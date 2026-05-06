# Frontend Polish — edusmyki.pl — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poprawić wygląd wszystkich widoków edusmyki.pl — nowe fonty (Baloo 2 + DM Sans), spójna paleta marki, ciepły PageHeader na stronach wewnętrznych, mobilne chipy kategorii, drobne ulepszenia kart i formularzy.

**Architecture:** Wprowadzamy system typografii przez CSS variables w Tailwind v4, tworzymy reusable `PageHeader` i `CategoryChips`, naprawiamy niespójne kolory i poprawiamy styl komponentów kartowych i formularzowych.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, next/font/google

---

## File Structure

**Nowe pliki:**
- `apps/web/components/layout/PageHeader.tsx` — reusable header dla stron wewnętrznych
- `apps/web/components/catalog/CategoryChips.tsx` — mobilny poziomy scroll kategorii

**Modyfikowane pliki:**
- `apps/web/app/layout.tsx` — zastąpienie Inter → Baloo 2 + DM Sans
- `apps/web/app/globals.css` — system typografii + CSS variables
- `apps/web/app/(shop)/katalog/page.tsx` — PageHeader + CategoryChips
- `apps/web/app/(shop)/katalog/[slug]/page.tsx` — naprawa niebieskiej ceny
- `apps/web/app/(shop)/koszyk/page.tsx` — PageHeader
- `apps/web/app/(shop)/checkout/page.tsx` — PageHeader
- `apps/web/app/(shop)/checkout/sukces/page.tsx` — cieplejszy styl
- `apps/web/app/(shop)/checkout/blad/page.tsx` — cieplejszy styl
- `apps/web/app/konto/page.tsx` — PageHeader
- `apps/web/app/konto/layout.tsx` — naprawa blue hover
- `apps/web/components/catalog/EbookCard.tsx` — lepszy shadow + placeholder
- `apps/web/components/cart/CartPageContent.tsx` — kolory + CTA
- `apps/web/components/checkout/CheckoutForm.tsx` — ikonki + focus + CTA

---

## Task 1: System typografii — layout.tsx + globals.css

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/globals.css`

- [ ] **Krok 1: Zaktualizuj layout.tsx — zamień Inter na Baloo 2 + DM Sans**

Zastąp całą zawartość pliku:

```tsx
import type { Metadata } from "next";
import { Baloo_2, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const baloo2 = Baloo_2({
  subsets: ["latin", "latin-ext"],
  variable: "--font-baloo",
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "edusmyki.pl – Ebooki dla przedszkoli i żłobków",
    template: "%s | edusmyki.pl",
  },
  description:
    "Profesjonalne ebooki z instrukcjami prowadzenia przedszkoli i żłobków. Pobierz gotowe procedury, regulaminy i poradniki.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl"
  ),
  icons: {
    icon: "/logo_noback.png",
    apple: "/logo_noback.png",
  },
  openGraph: {
    siteName: "edusmyki.pl",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${baloo2.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Krok 2: Zaktualizuj globals.css — system typografii**

W sekcji `@theme inline` zmień wpis `--font-sans` i dodaj `--font-display`:

```css
/* Znajdź tę linię: */
  --font-sans: var(--font-sans);
/* Zastąp: */
  --font-sans: var(--font-dm);
  --font-display: var(--font-baloo);
```

Znajdź sekcję `@layer base` i zaktualizuj:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-baloo), cursive;
  }
}
```

- [ ] **Krok 3: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 4: Uruchom dev i sprawdź wizualnie**

```bash
npm run dev
```

Otwórz `http://localhost:3000` — nagłówki powinny być zaokrąglone (Baloo 2), treść czytelna (DM Sans). Tytuł "Materiały dla żłobków i przedszkoli" powinien wyglądać energetyczniej niż wcześniej.

- [ ] **Krok 5: Commit**

```bash
git add apps/web/app/layout.tsx apps/web/app/globals.css
git commit -m "feat: replace Inter with Baloo 2 + DM Sans typography system"
```

---

## Task 2: Komponent PageHeader

**Files:**
- Create: `apps/web/components/layout/PageHeader.tsx`

- [ ] **Krok 1: Utwórz PageHeader.tsx**

```tsx
interface PageHeaderProps {
  pill: string;
  pillColor?: string;
  title: string;
  description?: string;
}

export function PageHeader({
  pill,
  pillColor = "#F5A623",
  title,
  description,
}: PageHeaderProps) {
  return (
    <div
      className="border-b px-4 py-6 md:px-8 md:py-8"
      style={{
        background:
          "linear-gradient(135deg, #FFF3DC 0%, #FFF8F0 60%, #E2F7FA 100%)",
        borderBottomColor: "#FFE4A0",
      }}
    >
      <div className="container mx-auto">
        <span
          className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: pillColor }}
        >
          {pill}
        </span>
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 md:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Krok 2: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 3: Commit**

```bash
git add apps/web/components/layout/PageHeader.tsx
git commit -m "feat: add PageHeader component for inner pages"
```

---

## Task 3: Komponent CategoryChips (mobile)

**Files:**
- Create: `apps/web/components/catalog/CategoryChips.tsx`

- [ ] **Krok 1: Utwórz CategoryChips.tsx**

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryChipsProps {
  categories: Category[];
  selected?: string;
}

export function CategoryChips({ categories, selected }: CategoryChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug || slug === "wszystkie") {
      params.delete("kategoria");
    } else {
      params.set("kategoria", slug);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeSlug = selected ?? "wszystkie";

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      <button
        onClick={() => handleSelect(null)}
        className="shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors"
        style={
          activeSlug === "wszystkie"
            ? { borderColor: "#4BBFCA", backgroundColor: "#E2F7FA", color: "#4BBFCA" }
            : { borderColor: "#e5e7eb", backgroundColor: "white", color: "#6b7280" }
        }
      >
        Wszystkie
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.slug)}
          className="shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors"
          style={
            activeSlug === cat.slug
              ? { borderColor: "#4BBFCA", backgroundColor: "#E2F7FA", color: "#4BBFCA" }
              : { borderColor: "#e5e7eb", backgroundColor: "white", color: "#6b7280" }
          }
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Krok 2: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 3: Commit**

```bash
git add apps/web/components/catalog/CategoryChips.tsx
git commit -m "feat: add CategoryChips component for mobile category filtering"
```

---

## Task 4: Naprawa niespójnych kolorów

**Files:**
- Modify: `apps/web/app/(shop)/katalog/[slug]/page.tsx:105`
- Modify: `apps/web/components/cart/CartPageContent.tsx:57,66`
- Modify: `apps/web/components/checkout/CheckoutForm.tsx:57,302`
- Modify: `apps/web/app/konto/layout.tsx:15-18`

- [ ] **Krok 1: Napraw cenę w `katalog/[slug]/page.tsx`**

Znajdź linię ~105:
```tsx
            <span className="text-4xl font-bold text-blue-600">
              {ebook.price.toFixed(2)} zł
            </span>
```

Zastąp:
```tsx
            <span
              className="text-4xl font-extrabold"
              style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
            >
              {ebook.price.toFixed(2)} zł
            </span>
```

- [ ] **Krok 2: Napraw kolory w `CartPageContent.tsx`**

Znajdź linię ~57:
```tsx
                    <Link href={`/katalog/${item.slug}`} className="font-semibold hover:text-blue-600">
```
Zastąp:
```tsx
                    <Link href={`/katalog/${item.slug}`} className="font-semibold hover:text-[#F5A623]">
```

Znajdź linię ~66:
```tsx
                    <span className="font-bold text-blue-600">
                      {item.price.toFixed(2)} zł
                    </span>
```
Zastąp:
```tsx
                    <span
                      className="font-extrabold"
                      style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
                    >
                      {item.price.toFixed(2)} zł
                    </span>
```

Znajdź linię ~96:
```tsx
              <span className="text-blue-600">{totalPrice().toFixed(2)} zł</span>
```
Zastąp:
```tsx
              <span
                className="font-extrabold"
                style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
              >
                {totalPrice().toFixed(2)} zł
              </span>
```

- [ ] **Krok 3: Napraw kolory w `CheckoutForm.tsx`**

Znajdź linię ~302:
```tsx
              <span className="text-blue-600">{totalPrice().toFixed(2)} zł</span>
```
Zastąp:
```tsx
              <span
                className="font-extrabold"
                style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
              >
                {totalPrice().toFixed(2)} zł
              </span>
```

- [ ] **Krok 4: Napraw hover w `konto/layout.tsx`**

Znajdź wszystkie wystąpienia `hover:text-blue-600` i zastąp `hover:text-[#4BBFCA]`:

```tsx
            <Link href="/konto" className="font-medium hover:text-[#4BBFCA]">
              Pulpit
            </Link>
            <Link href="/konto/zamowienia" className="hover:text-[#4BBFCA]">
              Zamówienia
            </Link>
            <Link href="/konto/ebooki" className="hover:text-[#4BBFCA]">
              Moje ebooki
            </Link>
```

- [ ] **Krok 5: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 6: Commit**

```bash
git add apps/web/app/\(shop\)/katalog/\[slug\]/page.tsx \
        apps/web/components/cart/CartPageContent.tsx \
        apps/web/components/checkout/CheckoutForm.tsx \
        apps/web/app/konto/layout.tsx
git commit -m "fix: replace text-blue-600 with brand orange/teal across all pages"
```

---

## Task 5: Ulepszenia EbookCard

**Files:**
- Modify: `apps/web/components/catalog/EbookCard.tsx`

- [ ] **Krok 1: Zaktualizuj EbookCard.tsx**

Zastąp całą zawartość pliku:

```tsx
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STRAPI_MEDIA_URL } from "@/lib/strapi";
import type { Ebook } from "@/types";

interface EbookCardProps {
  ebook: Ebook;
}

export function EbookCard({ ebook }: EbookCardProps) {
  const coverUrl = ebook.coverImage?.url
    ? ebook.coverImage.url.startsWith("http")
      ? ebook.coverImage.url
      : `${STRAPI_MEDIA_URL}${ebook.coverImage.url}`
    : null;

  return (
    <Card className="group flex flex-col overflow-hidden border-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={`/katalog/${ebook.slug}`}
        className="relative block aspect-[3/4] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF3DC, #FFE4A0)",
        }}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={ebook.coverImage?.alternativeText || ebook.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen
              className="h-14 w-14"
              style={{ color: "#F5A623", opacity: 0.5 }}
            />
          </div>
        )}
        {ebook.isFeatured && (
          <Badge
            className="absolute left-2 top-2 border-0 text-white"
            style={{ backgroundColor: "#F5A623" }}
          >
            Polecany
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        {ebook.categories?.slice(0, 1).map((cat) => (
          <Badge
            key={cat.id}
            variant="outline"
            className="w-fit text-xs"
            style={{ borderColor: "#4BBFCA", color: "#4BBFCA" }}
          >
            {cat.name}
          </Badge>
        ))}
        <Link href={`/katalog/${ebook.slug}`}>
          <h3 className="line-clamp-2 font-semibold leading-tight transition-colors hover:text-[#F5A623]">
            {ebook.title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-gray-500">
          {ebook.shortDescription}
        </p>
      </CardContent>

      <CardFooter
        className="flex items-center justify-between border-t pt-4"
        style={{ borderTopColor: "#F0E8DC" }}
      >
        <span
          className="text-xl font-extrabold"
          style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
        >
          {ebook.price.toFixed(2)} zł
        </span>
        <Button
          asChild
          size="sm"
          className="rounded-full border-0 text-white"
          style={{ backgroundColor: "#4BBFCA" }}
        >
          <Link href={`/katalog/${ebook.slug}`}>Szczegóły</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Krok 2: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 3: Commit**

```bash
git add apps/web/components/catalog/EbookCard.tsx
git commit -m "feat: improve EbookCard hover effect, placeholder and price style"
```

---

## Task 6: Strona Katalog

**Files:**
- Modify: `apps/web/app/(shop)/katalog/page.tsx`

- [ ] **Krok 1: Zaktualizuj katalog/page.tsx**

Zastąp całą zawartość pliku:

```tsx
import { Suspense } from "react";
import { getEbooks, getCategories } from "@/lib/strapi";
import { EbookGrid } from "@/components/catalog/EbookGrid";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { CategoryChips } from "@/components/catalog/CategoryChips";
import { SearchBar } from "@/components/catalog/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";

interface KatalogPageProps {
  searchParams: Promise<{
    strona?: string;
    kategoria?: string;
    szukaj?: string;
  }>;
}

export const metadata = {
  title: "Katalog ebooków",
  description:
    "Przeglądaj nasze ebooki z instrukcjami dla przedszkoli i żłobków.",
};

export default async function KatalogPage({ searchParams }: KatalogPageProps) {
  const params = await searchParams;
  const page = Number(params.strona ?? 1);
  const categorySlug = params.kategoria;
  const search = params.szukaj;

  const [ebooksRes, categories] = await Promise.all([
    getEbooks({ page, pageSize: 12, categorySlug, search }),
    getCategories(),
  ]);

  return (
    <>
      <PageHeader
        pill="📚 Katalog"
        pillColor="#F5A623"
        title="Katalog materiałów"
        description="Dokumenty i ebooki dla żłobków i przedszkoli"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Filtry desktop: SearchBar + CategoryFilter */}
        <div className="mb-4 hidden gap-4 sm:flex">
          <SearchBar defaultValue={search} />
          <CategoryFilter categories={categories} selected={categorySlug} />
        </div>

        {/* Filtry mobile: SearchBar + CategoryChips */}
        <div className="mb-4 flex flex-col gap-3 sm:hidden">
          <SearchBar defaultValue={search} />
          <Suspense fallback={null}>
            <CategoryChips categories={categories} selected={categorySlug} />
          </Suspense>
        </div>

        <Suspense fallback={<div className="py-10 text-center text-gray-400">Ładowanie...</div>}>
          <EbookGrid
            ebooks={ebooksRes.data}
            pagination={ebooksRes.meta.pagination}
          />
        </Suspense>
      </div>
    </>
  );
}
```

- [ ] **Krok 2: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 3: Commit**

```bash
git add apps/web/app/\(shop\)/katalog/page.tsx
git commit -m "feat: add PageHeader and mobile CategoryChips to catalog page"
```

---

## Task 7: Koszyk — PageHeader + styl

**Files:**
- Modify: `apps/web/app/(shop)/koszyk/page.tsx`
- Modify: `apps/web/components/cart/CartPageContent.tsx`

- [ ] **Krok 1: Zaktualizuj koszyk/page.tsx**

Zastąp całą zawartość:

```tsx
import { CartPageContent } from "@/components/cart/CartPageContent";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "Koszyk",
};

export default function KoszykPage() {
  return (
    <>
      <PageHeader
        pill="🛒 Koszyk"
        pillColor="#4BBFCA"
        title="Twój koszyk"
        description="Sprawdź swoje produkty przed zakupem"
      />
      <div className="container mx-auto px-4 py-8">
        <CartPageContent />
      </div>
    </>
  );
}
```

- [ ] **Krok 2: Zaktualizuj CartPageContent.tsx — styl koszyka**

Znajdź pusty koszyk (linia ~15) i zaktualizuj ikonę + przycisk:

```tsx
  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag
          className="mx-auto mb-4 h-16 w-16"
          style={{ color: "#F5A623", opacity: 0.4 }}
        />
        <h2 className="mb-2 text-xl font-semibold text-gray-600">
          Twój koszyk jest pusty
        </h2>
        <p className="mb-6 text-gray-500">Dodaj ebooki, aby rozpocząć zakupy</p>
        <Button
          asChild
          className="rounded-full text-white"
          style={{ backgroundColor: "#F5A623" }}
        >
          <Link href="/katalog">Przeglądaj katalog</Link>
        </Button>
      </div>
    );
  }
```

Znajdź blok podsumowania (`<Card>` z `Łącznie`) i zaktualizuj cały `<Card>` podsumowania:

```tsx
        <Card style={{ backgroundColor: "#FFFBF5", borderColor: "#FFE4A0" }}>
          <CardContent className="space-y-4 pt-6">
            <h2 className="text-lg font-semibold">Podsumowanie</h2>
            <div className="flex justify-between text-sm">
              <span>Liczba ebooków:</span>
              <span>{totalItems()}</span>
            </div>
            <Separator style={{ backgroundColor: "#FFE4A0" }} />
            <div className="flex justify-between text-lg font-bold">
              <span>Łącznie:</span>
              <span
                className="font-extrabold"
                style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
              >
                {totalPrice().toFixed(2)} zł
              </span>
            </div>
            <p className="text-xs text-gray-500">Ceny zawierają VAT</p>
            <Button
              asChild
              className="w-full rounded-full text-white shadow-md"
              size="lg"
              style={{
                backgroundColor: "#F5A623",
                boxShadow: "0 4px 14px rgba(245,166,35,0.3)",
              }}
            >
              <Link href="/checkout">Przejdź do kasy →</Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/katalog">Kontynuuj zakupy</Link>
            </Button>
          </CardContent>
        </Card>
```

Znajdź przycisk usuń (linia ~68) i zmień styl:

```tsx
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.ebookId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
```

- [ ] **Krok 3: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 4: Commit**

```bash
git add apps/web/app/\(shop\)/koszyk/page.tsx \
        apps/web/components/cart/CartPageContent.tsx
git commit -m "feat: add PageHeader to cart, warm summary box, brand CTA button"
```

---

## Task 8: Checkout — PageHeader + ulepszenia formularza

**Files:**
- Modify: `apps/web/app/(shop)/checkout/page.tsx`
- Modify: `apps/web/components/checkout/CheckoutForm.tsx`

- [ ] **Krok 1: Zaktualizuj checkout/page.tsx**

Zastąp całą zawartość:

```tsx
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "Zamówienie",
};

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        pill="💳 Zamówienie"
        pillColor="#7BC44C"
        title="Realizacja zamówienia"
        description="Podaj dane, opłać i pobierz od razu"
      />
      <div className="container mx-auto px-4 py-8">
        <CheckoutForm />
      </div>
    </>
  );
}
```

- [ ] **Krok 2: Zaktualizuj CheckoutForm.tsx — tytuły sekcji**

Znajdź `<CardTitle>Dane kontaktowe</CardTitle>` i zastąp:
```tsx
              <CardTitle className="flex items-center gap-2">
                👤 Dane kontaktowe
              </CardTitle>
```

Znajdź `<CardTitle>Faktura VAT</CardTitle>` i zastąp:
```tsx
              <CardTitle className="flex items-center gap-2">
                🧾 Faktura VAT
              </CardTitle>
```

Znajdź `<CardTitle>Zgody</CardTitle>` i zastąp:
```tsx
              <CardTitle className="flex items-center gap-2">
                📋 Zgody
              </CardTitle>
```

- [ ] **Krok 3: Zaktualizuj CheckoutForm.tsx — podsumowanie zamówienia**

Znajdź `<Card>` z `Twoje zamówienie` (~linia 291) i zaktualizuj styl:

```tsx
          <Card style={{ backgroundColor: "#FFFBF5", borderColor: "#FFE4A0" }}>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold">Twoje zamówienie</h2>
              {items.map((item) => (
                <div key={item.ebookId} className="flex justify-between text-sm">
                  <span className="pr-4 text-gray-700 line-clamp-2">{item.title}</span>
                  <span className="shrink-0 font-medium">{item.price.toFixed(2)} zł</span>
                </div>
              ))}
              <Separator style={{ backgroundColor: "#FFE4A0" }} />
              <div className="flex justify-between font-bold">
                <span>Łącznie:</span>
                <span
                  className="font-extrabold"
                  style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
                >
                  {totalPrice().toFixed(2)} zł
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Płatność obsługiwana przez Przelewy24 (BLIK, karta, przelew)
              </p>
              <Button
                type="submit"
                className="w-full rounded-full text-white shadow-md"
                size="lg"
                disabled={loading}
                style={{
                  backgroundColor: "#F5A623",
                  boxShadow: "0 4px 14px rgba(245,166,35,0.3)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Przekierowywanie...
                  </>
                ) : (
                  "Zapłać i pobierz →"
                )}
              </Button>
            </CardContent>
          </Card>
```

- [ ] **Krok 4: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 5: Commit**

```bash
git add apps/web/app/\(shop\)/checkout/page.tsx \
        apps/web/components/checkout/CheckoutForm.tsx
git commit -m "feat: add PageHeader to checkout, section icons, warm order summary"
```

---

## Task 9: Strona Konto

**Files:**
- Modify: `apps/web/app/konto/page.tsx`

- [ ] **Krok 1: Zaktualizuj konto/page.tsx**

Nota: `PageHeader` nie może tu być użyty bezpośrednio bo `konto/layout.tsx` ma własny wrapper z nawigacją. Zamiast tego dodajemy ciepły nagłówek inline.

Zastąp całą zawartość:

```tsx
import { BookOpen, Download, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Moje konto" };

export default function KontoDashboard() {
  return (
    <div>
      <div className="mb-8">
        <span
          className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: "#4BBFCA" }}
        >
          👤 Konto
        </span>
        <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
          Witaj w swoim koncie
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Zarządzaj zamówieniami i pobieraj zakupione materiały.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link
          href="/konto/ebooki"
          className="flex flex-col gap-3 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ backgroundColor: "#FFF3DC" }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: "#F5A623" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Moje ebooki</p>
            <p className="text-sm text-gray-500">Pobierz zakupione materiały</p>
          </div>
        </Link>

        <Link
          href="/katalog"
          className="flex flex-col gap-3 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ backgroundColor: "#E2F7FA" }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: "#4BBFCA" }}
          >
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Przeglądaj katalog</p>
            <p className="text-sm text-gray-500">Odkryj nowe materiały</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Krok 2: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 3: Commit**

```bash
git add apps/web/app/konto/page.tsx
git commit -m "feat: improve konto dashboard with warm cards and navigation links"
```

---

## Task 10: Strony Sukces i Błąd

**Files:**
- Modify: `apps/web/app/(shop)/checkout/sukces/page.tsx`
- Modify: `apps/web/app/(shop)/checkout/blad/page.tsx`

- [ ] **Krok 1: Zaktualizuj sukces/page.tsx**

Zastąp całą zawartość:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const metadata = { title: "Zamówienie złożone" };

export default function SukcesPage() {
  return (
    <div
      className="min-h-[60vh] px-4 py-20 text-center"
      style={{
        background: "linear-gradient(180deg, #EDF9E8 0%, #ffffff 50%)",
      }}
    >
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
        style={{
          backgroundColor: "#EDF9E8",
          boxShadow: "0 4px 24px rgba(123,196,76,0.25)",
        }}
      >
        🎉
      </div>
      <h1 className="mb-3 text-3xl font-extrabold text-gray-900">
        Dziękujemy za zakup!
      </h1>
      <p className="mx-auto mb-4 max-w-md text-gray-600">
        Twoje ebooki są gotowe! Za chwilę link do pobrania trafi na Twój adres
        email.
      </p>
      <div className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
        style={{ backgroundColor: "#EDF9E8", color: "#7BC44C" }}
      >
        <Mail className="h-4 w-4" />
        Sprawdź skrzynkę email (również folder SPAM)
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="rounded-full text-white"
          style={{ backgroundColor: "#F5A623" }}
        >
          <Link href="/konto/ebooki">Moje ebooki →</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full"
          style={{ borderColor: "#4BBFCA", color: "#4BBFCA" }}
        >
          <Link href="/katalog">Kontynuuj zakupy</Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Krok 2: Zaktualizuj blad/page.tsx**

Zastąp całą zawartość:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Błąd płatności" };

export default function BladPage() {
  return (
    <div
      className="min-h-[60vh] px-4 py-20 text-center"
      style={{
        background: "linear-gradient(180deg, #FEF2F2 0%, #ffffff 50%)",
      }}
    >
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
        style={{
          backgroundColor: "#FEF2F2",
          boxShadow: "0 4px 24px rgba(239,68,68,0.15)",
        }}
      >
        😕
      </div>
      <h1 className="mb-3 text-3xl font-extrabold text-gray-900">
        Płatność nie powiodła się
      </h1>
      <p className="mx-auto mb-4 max-w-md text-gray-600">
        Wystąpił problem podczas realizacji płatności. Twoje zamówienie nie
        zostało zrealizowane.
      </p>
      <div
        className="mx-auto mb-8 max-w-sm rounded-xl p-4 text-sm text-gray-600"
        style={{ backgroundColor: "#FEF2F2" }}
      >
        💡 Twój koszyk jest nadal zapisany — możesz spróbować ponownie lub
        wybrać inną metodę płatności.
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="rounded-full text-white"
          style={{ backgroundColor: "#F5A623" }}
        >
          <Link href="/koszyk">Wróć do koszyka</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-full"
          style={{ borderColor: "#4BBFCA", color: "#4BBFCA" }}
        >
          <a href="mailto:kontakt@edusmyki.pl">Skontaktuj się z nami</a>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Krok 3: Sprawdź TypeScript**

```bash
cd apps/web && npx tsc --noEmit
```

Oczekiwane: brak błędów

- [ ] **Krok 4: Commit**

```bash
git add apps/web/app/\(shop\)/checkout/sukces/page.tsx \
        apps/web/app/\(shop\)/checkout/blad/page.tsx
git commit -m "feat: warm gradient style for success and error checkout pages"
```

---

## Task 11: Weryfikacja końcowa

- [ ] **Krok 1: TypeScript + build check**

```bash
cd apps/web && npx tsc --noEmit && echo "✅ TypeScript OK"
```

Oczekiwane: `✅ TypeScript OK`

- [ ] **Krok 2: Uruchom dev i sprawdź wszystkie widoki**

```bash
npm run dev
```

Sprawdź kolejno (z RWD toolbarem w DevTools, widok iPhone 390px):

| Strona | Co sprawdzić |
|--------|-------------|
| `/` | Fonty Baloo 2 w nagłówkach, DM Sans w treści |
| `/katalog` | PageHeader z pigułką, chipy kategorii na mobile |
| `/katalog/[slug]` | Cena pomarańczowa (nie niebieska) |
| `/koszyk` | PageHeader, pomarańczowe ceny, ciepłe podsumowanie |
| `/checkout` | PageHeader, ikonki sekcji, ciepłe podsumowanie, pomarańczowy CTA |
| `/checkout/sukces` | Zielony gradient, pill email |
| `/checkout/blad` | Czerwony gradient, hint box |
| `/konto` | Karty nawigacyjne, teal hover |

- [ ] **Krok 3: Sprawdź RWD na mobile (390px)**

W każdym widoku upewnij się, że:
- PageHeader nie obcina tekstu
- Katalog: chipy przewijają się poziomo, nie przepełniają
- Koszyk/Checkout: podsumowanie poniżej listy (nie obok)
- Przyciski CTA: pełna szerokość na mobile

- [ ] **Krok 4: Opcjonalnie — build produkcyjny**

```bash
cd apps/web && npm run build
```

Oczekiwane: build zakończony bez błędów

---

## Podsumowanie zmian

| Zadanie | Pliki | Status |
|---------|-------|--------|
| Task 1: Typografia | layout.tsx, globals.css | - |
| Task 2: PageHeader | PageHeader.tsx (nowy) | - |
| Task 3: CategoryChips | CategoryChips.tsx (nowy) | - |
| Task 4: Kolory | [slug]/page.tsx, CartPageContent, CheckoutForm, konto/layout | - |
| Task 5: EbookCard | EbookCard.tsx | - |
| Task 6: Katalog | katalog/page.tsx | - |
| Task 7: Koszyk | koszyk/page.tsx, CartPageContent.tsx | - |
| Task 8: Checkout | checkout/page.tsx, CheckoutForm.tsx | - |
| Task 9: Konto | konto/page.tsx | - |
| Task 10: Sukces/Błąd | sukces/page.tsx, blad/page.tsx | - |
| Task 11: Weryfikacja | — | - |
