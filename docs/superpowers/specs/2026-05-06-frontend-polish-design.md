# Frontend Polish — edusmyki.pl

**Data:** 2026-05-06  
**Podejście:** Polish pass (Podejście 2)  
**Zakres:** Wszystkie widoki sklepu — bez zmian kolorów marki, bez refaktoryzacji logiki biznesowej

---

## Cel

Poprawić wygląd i spójność wszystkich widoków edusmyki.pl tak, żeby były bardziej przyjazne dla oka i w pełni responsywne (RWD), bez zmiany kolorów marki (#F5A623, #4BBFCA, #7BC44C).

---

## 1. Typografia

### Decyzja
Zastąpić `Inter` parą **Baloo 2** (nagłówki) + **DM Sans** (treść).

### Uzasadnienie
Inter jest zbyt generyczny. Baloo 2 jest zaokrąglony, ciepły i energetyczny — pasuje do marki edukacyjnej dla dzieci. DM Sans jest czytelny i nowoczesny jako font treści.

### Implementacja
- `apps/web/app/layout.tsx`: zamienić `Inter` na `Baloo_2` + `DM_Sans` z `next/font/google`
- Dodać zmienne CSS `--font-display` i `--font-body` do `globals.css`
- W `@layer base`: `h1, h2, h3, h4` → `font-family: var(--font-display)`, `body` → `var(--font-body)`
- Ceny wszędzie używają `font-family: var(--font-display)` (Baloo 2) + `font-weight: 800`

---

## 2. Naprawa kolorów — spójność marki

### Problem
3 pliki używają Tailwind `text-blue-600` (domyślny shadcn) zamiast koloru marki dla cen.

### Zmiany
| Plik | Przed | Po |
|------|-------|----|
| `components/cart/CartPageContent.tsx` | `text-blue-600` na cenach | `style={{ color: '#F5A623' }}` |
| `components/checkout/CheckoutForm.tsx` | `text-blue-600` na łącznie | `style={{ color: '#F5A623' }}` |
| `app/(shop)/katalog/[slug]/page.tsx` | `text-blue-600` na cenie | `style={{ color: '#F5A623' }}` |

---

## 3. Komponent `PageHeader`

### Nowy plik
`apps/web/components/layout/PageHeader.tsx`

### Props
```ts
interface PageHeaderProps {
  pill: string         // np. "📚 Katalog"
  pillColor?: string   // default: "#F5A623"
  title: string
  description?: string
}
```

### Wygląd
Gradient `linear-gradient(135deg, #FFF3DC 0%, #FFF8F0 60%, #E2F7FA 100%)` z `border-bottom: 1px solid #FFE4A0`. Pill kolorowy, h1 Baloo 2 / 800, opis DM Sans szary.

### Użycie — strony do zaktualizowania
| Strona | pill | pillColor | title | description |
|--------|------|-----------|-------|-------------|
| `/katalog` | "📚 Katalog" | #F5A623 | Katalog materiałów | 50+ ebooków i dokumentów dla żłobków i przedszkoli |
| `/koszyk` | "🛒 Koszyk" | #4BBFCA | Twój koszyk | [dynamicznie: `{n} produktów gotowych do zakupu`] |
| `/checkout` | "💳 Zamówienie" | #7BC44C | Realizacja zamówienia | Podaj dane, opłać i pobierz od razu |
| `/checkout/sukces` | "🎉 Sukces" | #7BC44C | Dziękujemy za zakup! | — |
| `/checkout/blad` | "😕 Błąd" | #ef4444 | Płatność nie powiodła się | — |
| `/konto` | "👤 Konto" | #4BBFCA | Moje konto | — |

---

## 4. Katalog — filtry mobilne

### Problem
Na mobile `<Select>` (dropdown) jest trudny w obsłudze jedną ręką i nie widać opcji.

### Rozwiązanie
- Na mobile (`sm:hidden`): wyświetlić `CategoryChips` — poziomy scroll z chipami per kategoria
- Na desktop (`hidden sm:flex`): obecny `<Select>` zostaje
- Nowy plik: `apps/web/components/catalog/CategoryChips.tsx`
- Chipy: `overflow-x: auto`, `scrollbar-width: none`, active chip ma `border-color: #4BBFCA`, `background: #E2F7FA`
- Siatka ebooków: na mobile (`< sm`) przechodzi z `grid-cols-2` → lista pionowa z miniaturą z lewej (flex row, cover 48×60px)

---

## 5. EbookCard — drobne ulepszenia

Plik: `apps/web/components/catalog/EbookCard.tsx`

- Shadow: `shadow-sm` → `shadow-md` na hover z `transition-shadow duration-200`
- Placeholder gdy brak okładki: dodać emoji 📖 na tle `linear-gradient(135deg, #FFF3DC, #FFE4A0)` zamiast szarego
- Badge "Polecany": upewnić się że używa `bg-[#F5A623]`
- CardFooter: separator górny w kolorze `#F0E8DC` zamiast domyślnego

---

## 6. Checkout — ulepszenia formularza

Plik: `apps/web/components/checkout/CheckoutForm.tsx`

- Sekcje `<Card>` dostają ikonkę emoji przed tytułem: "👤 Dane kontaktowe", "🧾 Faktura VAT", "📋 Zgody"
- `<Input>` wszystkie: `focus-visible:ring-[#4BBFCA]` zamiast domyślnego fioletowego ring
- Checkboxy zgód: owinąć w `div` z `rounded-lg bg-[#FAFAFA] border border-[#F0E8DC] p-3` dla lepszej czytelności
- Przycisk "Zapłać i pobierz": styl spójny z CTA homepage — `bg-[#F5A623] rounded-full shadow-lg`
- Podsumowanie zamówienia (`<Card>` po prawej): tło `#FFFBF5`, border `#FFE4A0`

---

## 7. Koszyk — ulepszenia

Plik: `apps/web/components/cart/CartPageContent.tsx`

- Ceny: `text-blue-600` → `style={{ color: '#F5A623' }}` + Baloo 2 przez klasę
- Przycisk "Przejdź do kasy": `rounded-full bg-[#F5A623] text-white`
- Przycisk "Usuń": `<Trash2>` z `text-gray-400 hover:text-red-500` (mniej agresywny)
- Podsumowanie box: tło `#FFFBF5`, border `#FFE4A0`
- Pusty koszyk: ikona `ShoppingBag` w kolorze `#F5A623` zamiast szarej

---

## 8. Strony Sukces i Błąd

### Sukces (`app/(shop)/checkout/sukces/page.tsx`)
- Tło górnej sekcji: `bg-gradient-to-b from-[#EDF9E8] to-white`
- Ikona: zastąpić `<CheckCircle2>` na emoji 🎉 w kółku z `bg-[#EDF9E8] shadow-lg`
- Info o emailu: pill `bg-[#EDF9E8] text-[#7BC44C] rounded-full px-4 py-2`
- Przyciski: "Moje ebooki" → `bg-[#F5A623] rounded-full`, "Katalog" → outline teal

### Błąd (`app/(shop)/checkout/blad/page.tsx`)
- Tło górnej sekcji: `bg-gradient-to-b from-red-50 to-white`
- Info: dodać box `bg-red-50 rounded-lg p-3` z "💡 Twój koszyk jest nadal zapisany"
- Przycisk "Wróć do koszyka": `bg-[#F5A623] rounded-full`

---

## 9. RWD — zasady ogólne

Wszystkie zmiany projektowane mobile-first:

- `container mx-auto px-4` na wszystkich stronach — już jest, utrzymać
- PageHeader: padding zmniejszony na mobile (`px-4 py-4` vs `px-6 py-7` na md+)
- Katalog: `grid-cols-1` (lista) na `< sm`, `grid-cols-2` na `sm`, `grid-cols-3` na `lg`
- Koszyk/Checkout: `grid-cols-1` na mobile, `lg:grid-cols-3` na desktop — już jest
- Przyciski CTA: `w-full` na mobile, `w-auto` na sm+
- Fonty: h1 `text-2xl` na mobile, `text-3xl` na md+

---

## Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `apps/web/app/layout.tsx` | Fonty Baloo 2 + DM Sans |
| `apps/web/app/globals.css` | CSS vars + base typografia |
| `apps/web/components/layout/PageHeader.tsx` | **NOWY** komponent |
| `apps/web/components/catalog/CategoryChips.tsx` | **NOWY** komponent mobilny |
| `apps/web/app/(shop)/katalog/page.tsx` | PageHeader + CategoryChips |
| `apps/web/app/(shop)/katalog/[slug]/page.tsx` | Naprawa cen |
| `apps/web/app/(shop)/koszyk/page.tsx` | PageHeader |
| `apps/web/app/(shop)/checkout/page.tsx` | PageHeader |
| `apps/web/app/(shop)/checkout/sukces/page.tsx` | Nowy styl |
| `apps/web/app/(shop)/checkout/blad/page.tsx` | Nowy styl |
| `apps/web/app/konto/page.tsx` | PageHeader |
| `apps/web/components/catalog/EbookCard.tsx` | Drobne ulepszenia |
| `apps/web/components/catalog/EbookGrid.tsx` | Mobile lista |
| `apps/web/components/cart/CartPageContent.tsx` | Kolory + styl |
| `apps/web/components/checkout/CheckoutForm.tsx` | Ikonki + input focus + styl |

**Łącznie: 15 plików** (2 nowe, 13 modyfikowanych)

---

## Czego NIE robimy

- Nie zmieniamy kolorów marki (#F5A623, #4BBFCA, #7BC44C)
- Nie zmieniamy logiki API / Strapi / Przelewy24
- Nie zmieniamy struktury routingu
- Nie przepisujemy logiki koszyka (Zustand)
- Nie dotykamy backendu CMS
