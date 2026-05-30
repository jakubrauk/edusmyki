# edusmyki.pl

Sklep z materiałami PDF (ebooki, procedury, scenariusze) dla żłobków i przedszkoli.

## Stack technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Frontend | Next.js 16.1.6, React 19, TypeScript, Tailwind v4, shadcn/ui |
| CMS | Strapi v5.38.0 (self-hosted, headless) |
| Auth | Magic link (email) + sesje cookie (NextAuth.js) |
| Płatności | Przelewy24 REST API (BLIK, karta, przelew) |
| Email | Resend |
| Storage | Cloudflare R2 (pliki PDF — S3-compatible) |
| Deployment | Railway (Next.js + Strapi + PostgreSQL plugin) |

## Struktura projektu

```
edusmyki-web/
├── apps/
│   ├── web/                        # Next.js frontend (port 3000)
│   │   ├── app/(shop)/             # Strony sklepu: /, /katalog, /koszyk, /checkout
│   │   ├── app/(auth)/             # Logowanie magic link
│   │   ├── app/konto/              # Panel klienta (zamówienia, pobieranie)
│   │   ├── app/opinia/             # Strona wystawiania recenzji (HMAC token)
│   │   ├── app/api/                # API routes (webhooks, download, reviews, auth)
│   │   ├── components/             # Komponenty React
│   │   ├── lib/                    # strapi.ts, przelewy24.ts, cart-store.ts, email.ts
│   │   └── types/index.ts          # Wszystkie typy TypeScript
│   └── cms/                        # Strapi v5 CMS (port 1337)
│       └── src/api/                # Content types: ebook, category, order,
│                                   #   download-token, review, setting, magic-token, profile
├── packages/
│   └── shared-types/               # Re-exportuje typy z apps/web/types
└── docker-compose.yml              # PostgreSQL lokalnie (opcjonalne)
```

## Content Types (Strapi)

| Typ | Opis |
|-----|------|
| Ebook | Produkt: tytuł, slug, opis, cena, okładka, plik PDF, kategorie, wyróżnienie |
| Category | Kategoria ebooków |
| Order | Zamówienie: status (pending/paid/cancelled/refunded), pozycje, email, ID transakcji P24 |
| DownloadToken | Token UUID do pobrania PDF — wygasa po 30 dniach lub 5 pobraniach |
| Review | Recenzja zakupu: ocena (1–5), treść, autor, status moderacji |
| Setting | Singleton — konfiguracja admina (email powiadomień) |
| MagicToken | Token do logowania magic link |
| Profile | Profil zalogowanego klienta |

## Uruchomienie lokalne

### Wymagania

- Node.js 20+
- npm 10+

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja zmiennych środowiskowych

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/cms/.env.example apps/cms/.env
```

Minimalne wartości do uzupełnienia w `apps/web/.env.local`:

```env
STRAPI_API_TOKEN=        # z panelu Strapi (krok 4)
NEXTAUTH_SECRET=         # openssl rand -base64 32
SESSION_SECRET=          # openssl rand -base64 32
REVIEW_SECRET=           # openssl rand -base64 32
RESEND_API_KEY=          # resend.com → free tier
P24_MERCHANT_ID=         # konto sandbox: sandbox.przelewy24.pl
P24_POS_ID=
P24_API_KEY=
P24_CRC_KEY=
P24_SANDBOX=true
```

W `apps/cms/.env` wygeneruj losowe wartości dla wszystkich `*_SECRET` i `APP_KEYS`.

### 3. Uruchomienie

```bash
npm run dev          # web (3000) + cms (1337) jednocześnie
npm run dev:web      # tylko Next.js
npm run dev:cms      # tylko Strapi
```

### 4. Pierwsze uruchomienie Strapi

1. Otwórz http://localhost:1337/admin
2. Utwórz konto administratora
3. **Settings → API Tokens** → utwórz token z typem `Full access`
4. Wklej token do `apps/web/.env.local` jako `STRAPI_API_TOKEN`
5. Dodaj kilka kategorii i ebooków (bez pliku PDF — wystarczy dla testów UI)

### 5. Testowanie płatności (sandbox P24)

Webhook P24 wymaga publicznego URL — użyj ngrok:

```bash
npx ngrok http 3000
# W panelu sandbox P24 → URL statusu = https://<id>.ngrok.io/api/webhooks/przelewy24
```

### 6. Testowanie recenzji

Po złożeniu zamówienia (status `paid`) system wysyła email z linkiem `/opinia?token=<hmac>`.  
Lokalnie możesz wygenerować token ręcznie przez endpoint lub sprawdzić logi konsoli.

## Deployment — Railway

### Krok po kroku

1. Push projektu na GitHub
2. railway.app → **New Project** → Deploy from GitHub repo
3. Dodaj serwis **Strapi** (Root Directory: `apps/cms`)
4. Dodaj **PostgreSQL plugin** → auto-wstrzykuje `DATABASE_URL` do Strapi
5. Dodaj serwis **Next.js** (Root Directory: `apps/web`)
6. Ustaw domeny dla obu serwisów i wypełnij zmienne środowiskowe

### Zmienne Railway — Strapi

```env
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
PUBLIC_URL=https://cms.edusmyki.pl
DATABASE_CLIENT=postgres
DATABASE_URL=          # auto-wstrzykiwany przez Railway PostgreSQL plugin
APP_KEYS=              # 4 losowe base64 stringi, przecinkami
API_TOKEN_SALT=        # openssl rand -base64 32
ADMIN_JWT_SECRET=      # openssl rand -base64 32
TRANSFER_TOKEN_SALT=   # openssl rand -base64 32
JWT_SECRET=            # openssl rand -base64 32
ENCRYPTION_KEY=        # openssl rand -base64 32
```

### Zmienne Railway — Next.js

Takie same jak w `.env.example`, z wartościami produkcyjnymi (P24 bez sandboxa, R2 storage).  
Klucze R2 (Cloudflare) są wymagane na produkcji — bez nich pobieranie PDF nie działa (Railway ma efemeryczny filesystem).

## Bezpieczeństwo

- Pliki PDF dostępne wyłącznie przez `/api/download/[token]` — nigdy bezpośrednio
- Token pobrania: UUID powiązany z zamówieniem, wygasa po 30 dniach / 5 pobraniach
- Ceny walidowane po stronie serwera z Strapi (frontend nie dyktuje kwoty)
- Webhook P24: weryfikacja sygnatury SHA384 + whitelist IP
- Linki do recenzji podpisane HMAC-SHA256 (secret `REVIEW_SECRET`)
- Magic link auth: token jednorazowy, wygasa po 15 minutach

## Handoff — stan aplikacji (maj 2026)

### Co działa

- [x] Sklep: strona główna, katalog, strona produktu, koszyk
- [x] Checkout: formularz danych, płatność P24, obsługa webhooków
- [x] Pobieranie PDF: tokeny z limitem pobrań i datą wygaśnięcia
- [x] Konto klienta: historia zamówień, lista pobrań
- [x] Auth: logowanie magic link przez email
- [x] Recenzje: wystawianie przez link z emaila, lista recenzji na stronie produktu, recenzje na homepage
- [x] Email: potwierdzenie zamówienia + link do recenzji, powiadomienie admina
- [x] SEO: sitemap.xml, robots.txt, meta tagi Open Graph
- [x] Deployment: Railway (Strapi + Next.js + PostgreSQL)

### Czego brakuje / znane ograniczenia

- [ ] Panel admina do moderacji recenzji (aktualnie przez Strapi admin UI)
- [ ] Faktury PDF dla klientów
- [ ] Kody rabatowe / kupony
- [ ] Strona z polityką prywatności i regulaminem (placeholder)
- [ ] Testy automatyczne (brak unit/e2e testów)
- [ ] Monitoring błędów (brak Sentry lub podobnego)
- [x] Analytics: Google Analytics 4 (wymaga ustawienia `NEXT_PUBLIC_GA_ID`)

### Google Analytics

1. Wejdź na [analytics.google.com](https://analytics.google.com) i utwórz konto lub zaloguj się
2. **Admin → Create → Property** → wpisz nazwę (np. `edusmyki.pl`), strefa czasowa `Poland`, waluta `PLN`
3. W sekcji **Data collection** wybierz **Web** → wpisz URL `https://edusmyki.pl` i nazwę strumienia
4. Skopiuj **Measurement ID** (format `G-XXXXXXXXXX`)
5. Wklej do zmiennych środowiskowych Railway (Next.js): `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`
6. Po redeploy dane pojawią się w GA w ciągu 24–48h

Lokalnie GA jest wyłączone gdy `NEXT_PUBLIC_GA_ID` jest puste — brak przypadkowego śledzenia ruchu deweloperskiego.

### Kluczowe gotchas

- `DATABASE_URL` w Strapi wymaga `as any` przy typecast SSL — patrz `apps/cms/config/env/production/database.ts`
- Na Railway pliki PDF **muszą** być na R2 — efemeryczny filesystem nie zachowa uploadów
- `app/page.tsx` nie istnieje — route `/` obsługuje `app/(shop)/page.tsx`
- Wszystkie fetch'e do Strapi mają `.catch(() => fallback)` żeby strona działała gdy CMS jest wyłączony
