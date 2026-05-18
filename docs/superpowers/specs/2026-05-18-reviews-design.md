# Moduł Opinii — Design Spec

**Data:** 2026-05-18  
**Status:** Zatwierdzone  
**Projekt:** edusmyki.pl — sklep z ebookami

---

## Cel

Umożliwić klientom, którzy zakupili ebooka, dodawanie opinii (gwiazdki + tekst). Admin zatwierdza opinie w Strapi i oznacza wybrane do wyświetlenia na stronie głównej. Opinie zastępują istniejące mocki.

---

## Wymagania

- Tylko kupujący (weryfikacja przez email + ebook) mogą dodać opinię
- Zalogowani użytkownicy: formularz na stronie produktu
- Goście (zakup bez konta): link z podpisanym URL w mailu potwierdzającym zakup
- Limit: 1 opinia per (email + ebook)
- Moderacja: każda opinia domyślnie ukryta, admin publikuje w Strapi
- Strona główna: osobna flaga `featuredOnHomepage`, admin zaznacza ręcznie
- Po dodaniu opinii: email powiadomienie do admina (adres konfigurowalny przez Strapi)

---

## Schemat danych

### Strapi Content Type: `review` (collectionType, draftAndPublish: true)

| Pole | Typ | Opis |
|------|-----|------|
| `rating` | integer (1–5) | Wymagane |
| `content` | text (max 500) | Wymagane |
| `authorName` | string | Wymagane (np. "Anna K.") |
| `authorRole` | string | Opcjonalne (np. "Właścicielka żłobka, Warszawa") |
| `email` | email | Wymagane — ukryte, tylko do weryfikacji |
| `ebook` | relation → Ebook | Many-to-one, wymagane |
| `order` | relation → Order | Many-to-one, opcjonalne (audit trail) |
| `featuredOnHomepage` | boolean | Default: false |

Unikalność: wymuszana przez API Route przed zapisem (nie w Strapi schema, bo Strapi nie obsługuje uniq na relacjach).  
Moderacja: `publishedAt = null` → oczekuje na moderację; `publishedAt != null` → zatwierdzona i widoczna.

### Strapi SingleType: `settings`

| Pole | Typ | Opis |
|------|-----|------|
| `adminEmail` | email | Adres do powiadomień o nowych opiniach |

---

## Architektura

### Weryfikacja zakupu

**Zalogowany użytkownik:**  
`getSessionEmail()` → sprawdź czy istnieje `DownloadToken` z tym emailem i tym `ebook.documentId`.

**Gość (link z maila):**  
Podpisany URL: `https://edusmyki.pl/opinia?e={base64(email)}&b={ebookDocumentId}&s={HMAC}`

```
signature = HMAC-SHA256(email + ":" + ebookDocumentId, REVIEW_SECRET)
```

Token nie wygasa — zabezpieczenie przez duplikat-check (jeśli opinia już istnieje → "Dziękujemy za opinię!").

### API Route: `POST /api/reviews`

Przyjmuje:
```json
{
  "ebookDocumentId": "string",
  "rating": 1-5,
  "content": "string",
  "authorName": "string",
  "authorRole": "string (opcjonalne)",
  "reviewToken": "string (tylko gość, zawiera e+b+s)"
}
```

Logika:
1. Jeśli `reviewToken` obecny → weryfikuj HMAC, wyciągnij email z tokenu
2. Jeśli brak tokenu → pobierz email z sesji (`getSessionEmail()`)
3. Brak emaila → 401
4. Sprawdź DownloadToken lub Order (status=paid) z tym emailem i ebookDocumentId → 403 jeśli brak
5. Sprawdź duplikat (`getReviewByEmailAndEbook`) → 409 jeśli istnieje
6. Utwórz rekord w Strapi (unpublished) przez Strapi API
7. Pobierz adminEmail z Strapi settings, wyślij email powiadomienie przez Resend

---

## Komponenty UI

### `components/reviews/StarRating.tsx`
Reużywalny komponent gwiazdek. Props: `value`, `onChange?` (readonly jeśli brak onChange), `max=5`.

### `components/reviews/ReviewForm.tsx`
Modal/Dialog z formularzem. Pola: StarRating (wymagane), textarea treść (max 500), input imię (wymagane), input rola (opcjonalne). Submit → `POST /api/reviews`. Stany: idle / loading / success / error.

### `components/reviews/ReviewList.tsx`
Lista zatwierdzonych opinii. Wyświetla: gwiazdki, treść, imię autora, rola, data. Props: `reviews: Review[]`.

### Strona produktu (`/katalog/[slug]/page.tsx`)

Pod istniejącym opisem nowa sekcja "Opinie":
- Średnia ocena + liczba opinii (jeśli > 0)
- `ReviewList` z opiniami
- Przycisk "Dodaj opinię" → otwiera `ReviewForm` (tylko dla zalogowanych którzy kupili ten ebook)
- Sprawdzenie własności ebooka: server-side przy renderowaniu strony (jeśli sesja → `getDownloadTokensByEmail`)

### Strona główna (`/page.tsx`)

Sekcja TESTIMONIALS (linie 366–420): zastąpić hardcoded array fetch'em `getFeaturedReviews()`.  
Fallback: jeśli brak opinii z flagą featuredOnHomepage lub Strapi offline → sekcja nie renderuje się (pattern `.catch(() => [])` już używany w projekcie).

### Nowa strona gościa (`/app/opinia/page.tsx`)

URL: `/opinia?e=...&b=...&s=...`  
Server component: weryfikuje HMAC przy renderowaniu.  
Stany:
- Token nieprawidłowy → komunikat błędu
- Opinia już istnieje → "Dziękujemy za opinię do [tytuł ebooka]!"
- Formularz → wyświetl `ReviewForm`
- Po submit → "Opinia wysłana, czeka na moderację"

---

## Zmodyfikowane pliki

| Plik | Zmiana |
|------|--------|
| `apps/web/lib/strapi.ts` | `getReviewsByEbook`, `getFeaturedReviews`, `createReview`, `getSettings`, `getReviewByEmailAndEbook` |
| `apps/web/lib/email.ts` | Szablon "link do opinii" w mailu zakupu + szablon "nowa opinia" dla admina |
| `apps/web/types/index.ts` | Typy `Review`, `Settings` |
| `apps/web/app/(shop)/page.tsx` | Zastąpić mocki prawdziwymi danymi |
| `apps/web/app/(shop)/katalog/[slug]/page.tsx` | Sekcja opinii |
| `apps/cms/src/api/` | Nowe content types: review, settings |

## Nowe pliki

| Plik | Opis |
|------|------|
| `apps/web/app/api/reviews/route.ts` | POST endpoint |
| `apps/web/app/opinia/page.tsx` | Strona gościa |
| `apps/web/components/reviews/StarRating.tsx` | Komponent gwiazdek |
| `apps/web/components/reviews/ReviewForm.tsx` | Formularz modalny |
| `apps/web/components/reviews/ReviewList.tsx` | Lista opinii |
| `apps/cms/src/api/review/` | Strapi content type |
| `apps/cms/src/api/settings/` | Strapi singleton |

## Nowe zmienne środowiskowe

| Zmienna | Opis |
|---------|------|
| `REVIEW_SECRET` | Sekret do podpisywania HMAC linków dla gości |

---

## Obsługa błędów i edge cases

- Strapi offline → `getFeaturedReviews().catch(() => [])` — strona główna renderuje się bez sekcji opinii
- Duplikat opinii → 409 → frontend pokazuje "Już dodałeś opinię do tego ebooka"
- Nieprawidłowy token HMAC → 403 → strona `/opinia` pokazuje komunikat błędu
- Rating poza zakresem lub brak pól wymaganych → walidacja w API Route przed zapisem do Strapi
- Email admina nie ustawiony w settings → skip wysyłki maila (log warning)

---

## Poza zakresem (YAGNI)

- Odpowiedź admina na opinię
- Możliwość edycji/usunięcia opinii przez użytkownika
- Paginacja listy opinii (na start wystarczy 20 ostatnich)
- Filtrowanie/sortowanie opinii
- Rich text w treści opinii
