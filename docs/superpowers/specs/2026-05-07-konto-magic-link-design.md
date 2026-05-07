# Design: Konto użytkownika — magic link auth + moje ebooki

**Data:** 2026-05-07  
**Status:** Approved

## Cel

Umożliwić użytkownikom dostęp do zakupionych ebooków i historii zamówień przez email-based magic link authentication. Sklep działa na guest checkout — brak haseł, email jest tożsamością.

## Architektura

### Nowy Strapi content type: `MagicToken`

Pola:
- `token` — UID (UUID), required, unique
- `email` — email, required
- `expiresAt` — datetime, required (15 minut od utworzenia)
- `used` — boolean, default false

### Sesja

Biblioteka `jose` (JWT). Cookie `session` — `HttpOnly`, `Secure`, `SameSite=lax`, ważne 30 dni.  
Payload: `{ email: string }`.  
Secret: zmienna środowiskowa `SESSION_SECRET` (min. 32 znaki).

### Middleware Next.js

`apps/web/middleware.ts` — chroni wszystkie ścieżki `/konto/*` z wyjątkiem `/konto/logowanie`.  
Niezalogowani → redirect na `/konto/logowanie`.

## API Routes

### `POST /api/auth/magic-link`

Wejście: `{ email: string }`

1. Walidacja emaila (zod)
2. Tworzenie MagicToken w Strapi (UUID, expiresAt = now + 15 min)
3. Wysyłka emaila przez Resend z linkiem `${APP_URL}/api/auth/verify?token=xxx`
4. Zwraca `200` zawsze (nie ujawnia czy email jest w systemie)

### `GET /api/auth/verify`

Parametr: `?token=xxx`

1. Pobiera MagicToken ze Strapi po wartości tokenu
2. Walidacja: istnieje, `used=false`, `expiresAt > now`
3. Ustawia `used=true` w Strapi
4. Tworzy JWT cookie z `{ email }`
5. Redirect na `/konto`

Błąd (wygasły/użyty/nieistniejący token) → redirect na `/konto/logowanie?error=invalid_token`

### `POST /api/auth/logout`

1. Usuwa cookie `session`
2. Redirect na `/`

## Strony

### `/konto/logowanie`

- Formularz: pole email + przycisk "Wyślij link logowania"
- Po wysłaniu: komunikat "Sprawdź skrzynkę — wysłaliśmy link logowania"
- Jeśli `?error=invalid_token` w URL: komunikat "Link wygasł lub był już użyty. Poproś o nowy."
- Dostępna bez sesji (wykluczona z middleware)

### `/konto` (chroniona)

Jedna strona z dwiema sekcjami. Email z sesji jako klucz do danych.

**Nagłówek:** wyświetla email zalogowanego użytkownika + przycisk "Wyloguj".

**Sekcja 1 — Moje ebooki:**
- Źródło: `getDownloadTokensByEmail(email)` (funkcja już istnieje)
- Każdy ebook: okładka, tytuł, przycisk "Pobierz PDF" (`/api/download/[token]`)
- Przycisk aktywny gdy: `downloadCount < maxDownloads` AND `expiresAt > now`
- Przycisk nieaktywny gdy token wygasł lub limit pobrań wyczerpany (tooltip z informacją)
- Brak tokenów: "Nie masz jeszcze żadnych ebooków — sprawdź katalog"

**Sekcja 2 — Historia zamówień:**
- Źródło: nowa funkcja `getOrdersByEmail(email)` w `strapi.ts`
  - Filter: `status=paid`, `guestEmail=email`, sort `createdAt:desc`
  - Populate: `items`
- Każde zamówienie: numer (`EDU-...`), data, lista tytułów ebooków, kwota łączna
- Brak zamówień: "Brak zamówień"

## Zmiany w istniejących plikach

| Plik | Zmiana |
|------|--------|
| `apps/cms/src/api/` | Nowy content type `magic-token` (schema + controller + routes + service) |
| `apps/web/lib/strapi.ts` | Dodać `getOrdersByEmail(email)` |
| `apps/web/middleware.ts` | Nowy plik — ochrona `/konto/*` |
| `apps/web/app/konto/layout.tsx` | Usunąć nawigację z linkami (jedna strona), dodać przycisk wyloguj |
| `apps/web/app/konto/page.tsx` | Pełna implementacja z sekcjami |
| `apps/web/app/konto/ebooki/page.tsx` | Usunąć (przeniesione do `/konto`) |
| `apps/web/lib/session.ts` | Nowy plik — helper do czytania/zapisywania JWT cookie (`jose`) |
| `apps/web/lib/email.ts` | Dodać `sendMagicLinkEmail(email, url)` |

## Nowe pliki

| Plik | Opis |
|------|------|
| `apps/web/app/api/auth/magic-link/route.ts` | POST — generuje i wysyła magic link |
| `apps/web/app/api/auth/verify/route.ts` | GET — weryfikuje token, ustawia sesję |
| `apps/web/app/api/auth/logout/route.ts` | POST — usuwa sesję |
| `apps/web/app/konto/logowanie/page.tsx` | Strona formularza logowania |
| `apps/web/middleware.ts` | Middleware ochrony `/konto/*` |
| `apps/web/lib/session.ts` | JWT cookie helpers |

## Zmienne środowiskowe

```
SESSION_SECRET=<min 32 losowe znaki>
```

`NEXT_PUBLIC_APP_URL` i `RESEND_API_KEY` już istnieją.

## Bezpieczeństwo

- Token magic link jednorazowy (`used=true` po pierwszym użyciu)
- Token ważny 15 minut
- Cookie `HttpOnly` + `Secure` — niedostępne przez JavaScript
- API magic-link zawsze zwraca 200 (brak enumeration emaili)
- Strapi MagicToken endpoint dostępny tylko przez `STRAPI_API_TOKEN` (nie publiczny)
