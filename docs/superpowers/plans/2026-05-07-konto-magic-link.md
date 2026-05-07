# Konto użytkownika — Magic Link Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zaimplementować email-based magic link authentication oraz stronę `/konto` z sekcjami "Moje ebooki" i "Historia zamówień".

**Architecture:** Nowy Strapi content type `MagicToken` przechowuje jednorazowe tokeny (TTL 15 min). Next.js API routes obsługują wysyłkę/weryfikację. Sesja to podpisane JWT cookie (`jose`, 30 dni) zawierające email użytkownika. Middleware chroni `/konto/*`.

**Tech Stack:** `jose` (JWT), Resend (email), Strapi v5 (MagicToken storage), Next.js App Router middleware.

---

## File Map

**Tworzone:**
- `apps/cms/src/api/magic-token/content-types/magic-token/schema.json`
- `apps/cms/src/api/magic-token/controllers/magic-token.ts`
- `apps/cms/src/api/magic-token/routes/magic-token.ts`
- `apps/cms/src/api/magic-token/services/magic-token.ts`
- `apps/web/lib/session.ts` — JWT cookie helpers (sign/verify/clear)
- `apps/web/middleware.ts` — ochrona `/konto/*`
- `apps/web/app/api/auth/magic-link/route.ts` — POST: generuje token, wysyła email
- `apps/web/app/api/auth/verify/route.ts` — GET: weryfikuje token, ustawia sesję
- `apps/web/app/api/auth/logout/route.ts` — POST: usuwa sesję
- `apps/web/app/konto/logowanie/page.tsx` — formularz logowania

**Modyfikowane:**
- `apps/web/types/index.ts` — dodać `MagicToken` interface
- `apps/web/lib/strapi.ts` — dodać `createMagicToken`, `findMagicTokenByToken`, `markMagicTokenUsed`, `getOrdersByEmail`
- `apps/web/lib/email.ts` — dodać `sendMagicLinkEmail`
- `apps/web/app/konto/layout.tsx` — usunąć nawigację, dodać email + logout
- `apps/web/app/konto/page.tsx` — pełna implementacja z dwiema sekcjami
- `apps/web/.env.local` — dodać `SESSION_SECRET`

**Usuwane:**
- `apps/web/app/konto/ebooki/page.tsx` — przeniesione do `/konto`
- `apps/web/app/konto/zamowienia/` — przeniesione do `/konto`

---

## Task 1: Strapi — content type MagicToken

**Files:**
- Create: `apps/cms/src/api/magic-token/content-types/magic-token/schema.json`
- Create: `apps/cms/src/api/magic-token/controllers/magic-token.ts`
- Create: `apps/cms/src/api/magic-token/routes/magic-token.ts`
- Create: `apps/cms/src/api/magic-token/services/magic-token.ts`

- [ ] **Step 1: Utwórz schema.json**

```json
{
  "kind": "collectionType",
  "collectionName": "magic_tokens",
  "info": {
    "singularName": "magic-token",
    "pluralName": "magic-tokens",
    "displayName": "Magic Token",
    "description": "Jednorazowe tokeny do logowania magic link"
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "token": { "type": "uid", "required": true, "unique": true },
    "email": { "type": "email", "required": true },
    "expiresAt": { "type": "datetime", "required": true },
    "used": { "type": "boolean", "default": false, "required": true }
  }
}
```

Ścieżka: `apps/cms/src/api/magic-token/content-types/magic-token/schema.json`

- [ ] **Step 2: Utwórz controller, routes i service**

`apps/cms/src/api/magic-token/controllers/magic-token.ts`:
```typescript
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::magic-token.magic-token');
```

`apps/cms/src/api/magic-token/routes/magic-token.ts`:
```typescript
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::magic-token.magic-token');
```

`apps/cms/src/api/magic-token/services/magic-token.ts`:
```typescript
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::magic-token.magic-token');
```

- [ ] **Step 3: Zrestartuj Strapi**

```bash
# Z katalogu głównego projektu — zatrzymaj i uruchom ponownie
npm run dev
```

Poczekaj aż Strapi zaloguje "Your application is ready at http://localhost:1337". Nowy content type `magic-token` pojawi się w admin panelu.

- [ ] **Step 4: Skonfiguruj uprawnienia API token w Strapi Admin**

Wejdź na `http://localhost:1337/admin` → Settings → API Tokens → kliknij swój token (lub utwórz nowy jeśli nie istnieje) → w sekcji permissions znajdź `Magic-token` i zaznacz: `create`, `find`, `findOne`, `update`.

Zapisz token i upewnij się że `STRAPI_API_TOKEN` w `.env.local` jest aktualny.

- [ ] **Step 5: Weryfikacja — sprawdź endpoint**

```bash
curl -s -X POST http://localhost:1337/api/magic-tokens \
  -H "Authorization: Bearer $STRAPI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"token":"test-uuid","email":"test@test.pl","expiresAt":"2099-01-01T00:00:00Z","used":false}}' \
  | jq .
```

Oczekiwany wynik: `{ "data": { "id": 1, "documentId": "...", ... } }`

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/api/magic-token
git commit -m "feat(cms): add MagicToken content type"
```

---

## Task 2: Session helper (`jose` + `session.ts`)

**Files:**
- Modify: `apps/web/.env.local`
- Create: `apps/web/lib/session.ts`

- [ ] **Step 1: Zainstaluj jose**

```bash
cd apps/web && npm install jose
```

- [ ] **Step 2: Dodaj SESSION_SECRET do .env.local**

Wygeneruj losowy secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Dodaj do `apps/web/.env.local`:
```
SESSION_SECRET=<wynik powyższego polecenia — min 32 znaki hex>
```

- [ ] **Step 3: Utwórz apps/web/lib/session.ts**

```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  email: string;
}

async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// For Server Components — reads session from Next.js cookie store
export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.email ?? null;
}

// For Route Handlers — sets JWT cookie on a NextResponse
export async function setSessionCookie(
  res: NextResponse,
  email: string
): Promise<void> {
  const token = await signToken({ email });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

// For Route Handlers — clears session cookie
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// For Middleware — verifies session from an incoming request
export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/session.ts apps/web/package.json apps/web/package-lock.json
git commit -m "feat(web): add jose session helper"
```

---

## Task 3: Typy + Strapi helpers

**Files:**
- Modify: `apps/web/types/index.ts`
- Modify: `apps/web/lib/strapi.ts`

- [ ] **Step 1: Dodaj MagicToken do types/index.ts**

Na końcu pliku `apps/web/types/index.ts` dodaj:

```typescript
// Magic Token (auth)
export interface MagicToken {
  id: number;
  documentId: string;
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}
```

- [ ] **Step 2: Dodaj import MagicToken w strapi.ts**

W pierwszej linii `apps/web/lib/strapi.ts` zmień import:

```typescript
import type { Ebook, Category, Order, DownloadToken, MagicToken, StrapiResponse } from "@/types";
```

- [ ] **Step 3: Dodaj funkcje MagicToken na końcu strapi.ts (przed `export { STRAPI_URL }`)**

```typescript
// ── Magic Tokens (auth) ──────────────────────────────────────────────────────

export async function createMagicToken(
  email: string,
  token: string,
  expiresAt: string
): Promise<void> {
  await strapiRequest("/magic-tokens", {
    method: "POST",
    body: JSON.stringify({ data: { token, email, expiresAt, used: false } }),
    next: { revalidate: 0 },
  });
}

export async function findMagicTokenByToken(
  token: string
): Promise<MagicToken | null> {
  const qs = new URLSearchParams({
    "filters[token][$eq]": token,
  });
  const res = await strapiRequest<StrapiResponse<MagicToken[]>>(
    `/magic-tokens?${qs}`,
    { next: { revalidate: 0 } }
  );
  return res.data[0] ?? null;
}

export async function markMagicTokenUsed(documentId: string): Promise<void> {
  await strapiRequest(`/magic-tokens/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { used: true } }),
    next: { revalidate: 0 },
  });
}

// ── Orders by email ───────────────────────────────────────────────────────────

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const qs = new URLSearchParams({
    "filters[guestEmail][$eq]": email,
    "filters[status][$eq]": "paid",
    "populate[items]": "true",
    "sort": "createdAt:desc",
  });
  const res = await strapiRequest<StrapiResponse<Order[]>>(
    `/orders?${qs}`,
    { next: { revalidate: 0 } }
  );
  return res.data;
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/types/index.ts apps/web/lib/strapi.ts
git commit -m "feat(web): add MagicToken type and Strapi helpers"
```

---

## Task 4: sendMagicLinkEmail

**Files:**
- Modify: `apps/web/lib/email.ts`

- [ ] **Step 1: Dodaj funkcję sendMagicLinkEmail na końcu email.ts**

```typescript
export async function sendMagicLinkEmail(
  email: string,
  magicUrl: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Zaloguj się do EduSmyki",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#F5A623;margin:0 0 4px;">edusmyki.pl</h1>
        <h2 style="margin:0 0 16px;">Link do logowania</h2>
        <p>Kliknij poniższy przycisk, aby zalogować się do swojego konta.</p>
        <p style="margin:24px 0;">
          <a href="${magicUrl}"
             style="background:#F5A623;color:#fff;padding:12px 28px;border-radius:24px;
                    text-decoration:none;font-weight:600;display:inline-block;">
            Zaloguj się
          </a>
        </p>
        <p style="color:#6b7280;font-size:12px;">
          Link ważny 15 minut, jednorazowy.<br>
          Jeśli to nie Ty prosiłeś/aś o link, zignoruj tę wiadomość.
        </p>
      </div>
    `,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/email.ts
git commit -m "feat(web): add sendMagicLinkEmail"
```

---

## Task 5: API route — POST /api/auth/magic-link

**Files:**
- Create: `apps/web/app/api/auth/magic-link/route.ts`

- [ ] **Step 1: Utwórz route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createMagicToken } from "@/lib/strapi";
import { sendMagicLinkEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await createMagicToken(email, token, expiresAt);
    await sendMagicLinkEmail(email, `${APP_URL}/api/auth/verify?token=${token}`);
  } catch (err) {
    console.error("magic-link error:", err);
    // always return 200 — don't reveal whether email exists
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Weryfikacja manualna**

Uruchom dev server i przetestuj:
```bash
curl -s -X POST http://localhost:3000/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"twoj@email.pl"}' | jq .
```

Oczekiwany wynik: `{ "ok": true }`. Sprawdź skrzynkę email — powinien dotrzeć link logowania.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/auth/magic-link/route.ts
git commit -m "feat(web): add magic-link API route"
```

---

## Task 6: API route — GET /api/auth/verify

**Files:**
- Create: `apps/web/app/api/auth/verify/route.ts`

- [ ] **Step 1: Utwórz route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { findMagicTokenByToken, markMagicTokenUsed } from "@/lib/strapi";
import { setSessionCookie } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const errorUrl = `${APP_URL}/konto/logowanie?error=invalid_token`;

  if (!token) return NextResponse.redirect(errorUrl);

  try {
    const magicToken = await findMagicTokenByToken(token);

    if (
      !magicToken ||
      magicToken.used ||
      new Date(magicToken.expiresAt) < new Date()
    ) {
      return NextResponse.redirect(errorUrl);
    }

    await markMagicTokenUsed(magicToken.documentId);

    const res = NextResponse.redirect(`${APP_URL}/konto`);
    await setSessionCookie(res, magicToken.email);
    return res;
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.redirect(errorUrl);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/api/auth/verify/route.ts
git commit -m "feat(web): add magic-link verify route"
```

---

## Task 7: API route — POST /api/auth/logout

**Files:**
- Create: `apps/web/app/api/auth/logout/route.ts`

- [ ] **Step 1: Utwórz route handler**

```typescript
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function POST() {
  const res = NextResponse.redirect(`${APP_URL}/`);
  clearSessionCookie(res);
  return res;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/api/auth/logout/route.ts
git commit -m "feat(web): add logout route"
```

---

## Task 8: Middleware Next.js

**Files:**
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Utwórz middleware.ts w katalogu apps/web**

Plik musi być w `apps/web/middleware.ts` (nie w `app/`).

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/konto/logowanie") {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.redirect(new URL("/konto/logowanie", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/konto", "/konto/:path*"],
};
```

- [ ] **Step 2: Weryfikacja manualna**

1. Otwórz `http://localhost:3000/konto` bez zalogowania — powinien nastąpić redirect na `/konto/logowanie`
2. Otwórz `http://localhost:3000/konto/logowanie` — powinno załadować się bez redirectu

- [ ] **Step 3: Commit**

```bash
git add apps/web/middleware.ts
git commit -m "feat(web): add auth middleware for /konto"
```

---

## Task 9: Strona logowania /konto/logowanie

**Files:**
- Create: `apps/web/app/konto/logowanie/page.tsx`

- [ ] **Step 1: Utwórz stronę logowania**

```typescript
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LogowaniePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-3">
            <div className="text-4xl">📬</div>
            <p className="text-lg font-semibold">Sprawdź skrzynkę!</p>
            <p className="text-gray-500 text-sm">
              Wysłaliśmy link logowania na <strong>{email}</strong>.<br />
              Link jest ważny przez 15 minut.
            </p>
            <p className="text-xs text-gray-400">Nie widzisz? Sprawdź folder SPAM.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-2">
            <Image src="/logo.jpeg" alt="EduSmyki" width={56} height={56} className="rounded-full" />
          </Link>
          <CardTitle>Zaloguj się do EduSmyki</CardTitle>
          <p className="text-sm text-gray-500">
            Wpisz email użyty przy zakupie — wyślemy Ci link logowania.
          </p>
        </CardHeader>
        <CardContent>
          {error === "invalid_token" && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              Link wygasł lub był już użyty. Poproś o nowy poniżej.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#F5A623] hover:bg-[#e09410]"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Wyślij link logowania"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/konto/logowanie/page.tsx
git commit -m "feat(web): add magic link login page"
```

---

## Task 10: Aktualizacja /konto/layout.tsx

**Files:**
- Modify: `apps/web/app/konto/layout.tsx`

- [ ] **Step 1: Zastąp zawartość layout.tsx**

```typescript
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSessionEmail } from "@/lib/session";

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getSessionEmail();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          {email && (
            <div className="mb-8 flex items-center justify-between border-b pb-4">
              <span className="text-sm text-gray-500">{email}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-[#4BBFCA] hover:underline"
                >
                  Wyloguj
                </button>
              </form>
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/konto/layout.tsx
git commit -m "feat(web): update konto layout with logout + session email"
```

---

## Task 11: Implementacja strony /konto

**Files:**
- Modify: `apps/web/app/konto/page.tsx`

- [ ] **Step 1: Zastąp zawartość page.tsx**

```typescript
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSessionEmail } from "@/lib/session";
import { getDownloadTokensByEmail, getOrdersByEmail, STRAPI_MEDIA_URL } from "@/lib/strapi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Moje konto" };

export default async function KontoPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/konto/logowanie");

  const [tokens, orders] = await Promise.all([
    getDownloadTokensByEmail(email),
    getOrdersByEmail(email),
  ]);

  const now = new Date();

  return (
    <div className="space-y-12">
      <PageHeader
        pill="👤 Konto"
        pillColor="#4BBFCA"
        title="Moje konto"
      />

      {/* ── Moje ebooki ── */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Moje ebooki</h2>
        {tokens.length === 0 ? (
          <p className="text-gray-500">
            Nie masz jeszcze żadnych ebooków.{" "}
            <Link href="/katalog" className="text-[#4BBFCA] underline">
              Przejdź do katalogu
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tokens.map((dt) => {
              const expired = new Date(dt.expiresAt) < now;
              const limitReached = dt.downloadCount >= dt.maxDownloads;
              const canDownload = !expired && !limitReached;

              const coverUrl = dt.ebook.coverImage
                ? dt.ebook.coverImage.url.startsWith("http")
                  ? dt.ebook.coverImage.url
                  : `${STRAPI_MEDIA_URL}${dt.ebook.coverImage.url}`
                : null;

              return (
                <Card key={dt.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {coverUrl && (
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md">
                        <Image
                          src={coverUrl}
                          alt={dt.ebook.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="font-medium leading-tight">{dt.ebook.title}</p>
                    <p className="text-xs text-gray-400">
                      {dt.downloadCount}/{dt.maxDownloads} pobrań ·{" "}
                      {expired
                        ? "link wygasł"
                        : `ważny do ${new Date(dt.expiresAt).toLocaleDateString("pl-PL")}`}
                    </p>
                    {canDownload ? (
                      <Button
                        asChild
                        size="sm"
                        className="w-full rounded-full bg-[#F5A623] hover:bg-[#e09410]"
                      >
                        <a href={`/api/download/${dt.token}`}>
                          Pobierz PDF
                        </a>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="w-full rounded-full"
                      >
                        {expired ? "Link wygasł" : "Limit pobrań wyczerpany"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Historia zamówień ── */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Historia zamówień</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">Brak zamówień.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-sm text-gray-600">
                        {order.items.map((item) => (
                          <li key={item.id}>· {item.ebookTitle}</li>
                        ))}
                      </ul>
                    </div>
                    <span
                      className="shrink-0 font-extrabold text-lg"
                      style={{ color: "#F5A623" }}
                    >
                      {order.totalAmount.toFixed(2)} zł
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/konto/page.tsx
git commit -m "feat(web): implement /konto page with ebooks and orders"
```

---

## Task 12: Usuń stare strony konto/ebooki i konto/zamowienia

**Files:**
- Delete: `apps/web/app/konto/ebooki/page.tsx`
- Delete: `apps/web/app/konto/zamowienia/` (cały katalog)

- [ ] **Step 1: Usuń zbędne pliki**

```bash
rm apps/web/app/konto/ebooki/page.tsx
rmdir apps/web/app/konto/ebooki
rm -rf apps/web/app/konto/zamowienia
```

- [ ] **Step 2: Weryfikacja end-to-end**

1. Wejdź na `http://localhost:3000/konto` → redirect na logowanie ✓
2. Wpisz email z zakupem → sprawdź skrzynkę → kliknij link
3. Po kliknięciu → redirect na `/konto` ✓
4. Widoczne sekcje "Moje ebooki" i "Historia zamówień" ✓
5. Klik "Pobierz PDF" dla aktywnego tokenu → pobiera plik ✓
6. Klik "Wyloguj" → redirect na `/` i brak sesji ✓
7. Próba wejścia na `/konto` po wylogowaniu → redirect na logowanie ✓

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(web): remove old konto/ebooki and konto/zamowienia stubs"
```
