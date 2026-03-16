# edusmyki.pl

Sklep z ebookami dla przedszkoli i żłobków.

## Stack technologiczny

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS, shadcn/ui)
- **CMS**: Strapi v5 (headless CMS, self-hosted)
- **Płatności**: Przelewy24 (BLIK, karta, przelew)
- **Email**: Resend
- **Storage**: Cloudflare R2 (PDF pliki)
- **Deployment**: Railway (Strapi + PostgreSQL + Next.js)

## Struktura projektu

```
edusmyki-web/
├── apps/
│   ├── web/          # Next.js 14 frontend (port 3000)
│   └── cms/          # Strapi v5 CMS (port 1337)
├── packages/
│   └── shared-types/ # Wspólne typy TypeScript
└── docker-compose.yml
```

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
# Next.js
cp apps/web/.env.example apps/web/.env.local

# Strapi
cp apps/cms/.env.example apps/cms/.env
```

Uzupełnij pliki `.env.local` i `.env` — szczególnie:
- Klucze Przelewy24 (konto sandbox: sandbox.przelewy24.pl)
- Klucz Resend API (resend.com, free tier)
- Klucze Strapi (wygeneruj losowe)

### 3. Uruchomienie

```bash
# Oba serwisy jednocześnie
npm run dev

# lub osobno:
npm run dev:web   # Next.js → http://localhost:3000
npm run dev:cms   # Strapi  → http://localhost:1337/admin
```

### 4. Konfiguracja Strapi (pierwsze uruchomienie)

1. Otwórz http://localhost:1337/admin
2. Utwórz konto administratora
3. Przejdź do **Settings → API Tokens** → dodaj token z pełnymi uprawnieniami
4. Wklej token do `apps/web/.env.local` jako `STRAPI_API_TOKEN`
5. Dodaj przykładowe kategorie i ebooki

### 5. Testowanie płatności (Przelewy24 sandbox)

Webhook P24 wymaga publicznego URL. Użyj ngrok:
```bash
npx ngrok http 3000
# Skopiuj URL np. https://abc123.ngrok.io
# W panelu sandbox P24 ustaw: URL statusu = https://abc123.ngrok.io/api/webhooks/przelewy24
```

## Deployment na Railway

### Krok po kroku

1. **Fork/push** projekt na GitHub
2. **railway.app** → New Project → Deploy from GitHub
3. Dodaj serwis **Next.js**:
   - Root Directory: `apps/web`
   - Zmienne środowiskowe z `apps/web/.env.example`
4. Dodaj serwis **Strapi**:
   - Root Directory: `apps/cms`
   - Zmienne środowiskowe z `apps/cms/.env.example`
5. Dodaj **PostgreSQL plugin** → auto-linkuje `DATABASE_URL` do Strapi
6. Ustaw domeny w Railway dla obu serwisów

### Zmienne Railway dla Strapi (produkcja)
```
DATABASE_CLIENT=postgres
DATABASE_URL=<auto-wstrzykiwany przez Railway PostgreSQL>
NODE_ENV=production
PUBLIC_URL=https://cms.edusmyki.pl
APP_KEYS=...
JWT_SECRET=...
ADMIN_JWT_SECRET=...
```

## Content Types (Strapi)

| Typ | Opis |
|-----|------|
| Ebook | Produkty w sklepie |
| Category | Kategorie ebooków |
| Order | Zamówienia klientów |
| Download Token | Jednorazowe tokeny do pobrania plików |

## Bezpieczeństwo

- Pliki PDF **nigdy** nie są dostępne bezpośrednio
- Każdy zakup generuje unikalny token (UUID) do pobrania
- Tokeny wygasają po 30 dniach lub po 5 pobraniach
- Ceny walidowane po stronie serwera (nie z frontendu)
- Sygnatury webhooków P24 weryfikowane (SHA384)
