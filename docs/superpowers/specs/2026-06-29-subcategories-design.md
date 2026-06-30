# Hierarchiczne kategorie, filtrowanie i sortowanie w katalogu

**Data:** 2026-06-29  
**Branch:** feature/subcategories  
**Status:** Zaakceptowany

---

## 1. Cel

- Umożliwić tworzenie kategorii wielopoziomowych (dowolna głębokość, praktycznie do ~4 poziomów) w Strapi CMS
- Poprawić filtrowanie w katalogu: wybór kategorii nadrzędnej pokazuje ebooki ze wszystkich podkategorii
- Dodać sortowanie wyników katalogu: najnowsze, cena rosnąco/malejąco, alfabetycznie A–Z
- Poprawić UI katalogu: sidebar z flat listą kategorii na desktop, collapsible panel na mobile

---

## 2. Model danych (Strapi)

### Zmiana w `apps/cms/src/api/category/content-types/category/schema.json`

Dodanie self-referencing relacji `parent` / `children`:

```json
"parent": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "api::category.category",
  "inversedBy": "children"
},
"children": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::category.category",
  "mappedBy": "parent"
}
```

- Kategorie najwyższego poziomu mają `parent: null`
- Strapi Admin automatycznie pokazuje pole "Kategoria nadrzędna" jako select

### Zmiana w `apps/web/types/index.ts`

```ts
export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  ebooks?: Ebook[];
  parent?: Category | null;
  children?: Category[];
}
```

---

## 3. Pobieranie danych i subtree resolution

### `getCategories()` w `apps/web/lib/strapi.ts`

Rozszerzenie populate o relacje hierarchii:

```
/categories?sort=name:asc&populate[parent]=true&populate[children]=true
```

### Nowa funkcja `getCategorySubtreeIds()` w `apps/web/lib/category-utils.ts`

```ts
// Przyjmuje płaską listę kategorii i slug wybranej kategorii.
// Zwraca tablicę ID: wybrana kategoria + wszystkie jej potomkinie (rekurencyjnie).
function getCategorySubtreeIds(categories: Category[], slug: string): number[]
```

Algorytm: BFS/DFS po relacji `children` na płaskiej liście kategorii. Działa w pamięci — drzewo kategorii jest małe i cache'owane przez Next.js.

### `getEbooks()` w `apps/web/lib/strapi.ts`

Zmiany w parametrach:

```ts
params?: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;       // zostaje, ale obsługa zmienia się
  categoryIds?: number[];      // nowe — filtrowanie po wielu ID (subtree)
  search?: string;
  featured?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "title-asc";  // nowe
}
```

Logika filtrowania po kategorii:
```
// zamiast: filters[categories][slug][$eq]=slug
// nowe:    filters[categories][id][$in][0]=id1&filters[categories][id][$in][1]=id2...
```

Mapowanie sortowania na Strapi:
- `newest` → `createdAt:desc` (domyślne)
- `price-asc` → `price:asc`
- `price-desc` → `price:desc`
- `title-asc` → `title:asc`

---

## 4. URL katalogu

Query params:
- `?kategoria=slug` — wybrany slug kategorii (bez zmian)
- `?sortowanie=cena-rosnaco` — nowy param dla sortowania
- `?szukaj=tekst` — wyszukiwanie (bez zmian)
- `?strona=N` — paginacja (bez zmian)

Wartości `sortowanie`: `najnowsze` (domyślne), `cena-rosnaco`, `cena-malejaco`, `alfabetycznie`

---

## 5. UI — komponenty

### Nowe / zmienione komponenty w `apps/web/components/catalog/`

#### `CategorySidebar.tsx` (nowy, zastępuje `CategoryFilter.tsx` na desktop)

- Renderuje flat listę wszystkich kategorii z wcięciami (12px × poziom)
- Kategorie posortowane: najpierw wg pozycji w drzewie (DFS preorder), nie alfabetycznie
- Aktywna kategoria: kolor `#4BBFCA`, pogrubiona
- Wszystkie kategorie klikalne (w tym nadrzędne)
- Link "Wszystkie kategorie" na górze

#### `CategoryMobilePanel.tsx` (nowy, zastępuje `CategoryChips.tsx` na mobile)

- Przycisk "Kategorie: [aktywna] ▼" — po kliknięciu rozwija panel
- Panel zawiera tę samą flat listę z wcięciami co sidebar
- Zamknięcie po wyborze kategorii

#### `SortSelect.tsx` (nowy)

- `<Select>` z opcjami: Najnowsze / Cena rosnąco / Cena malejąco / Alfabetycznie A–Z
- Ustawia query param `sortowanie` i resetuje `strona`

#### `katalog/page.tsx` — zmiany

- Nowy query param `sortowanie` w `searchParams`
- Layout desktop: dwukolumnowy (`sidebar 220px | content flex-1`)
- Wywołanie `getCategorySubtreeIds()` przed `getEbooks()`
- Przekazanie `categoryIds` i `sort` do `getEbooks()`

---

## 6. Kolejność implementacji

1. Strapi schema — dodanie pól `parent`/`children` do kategorii
2. TypeScript types — rozszerzenie interfejsu `Category`
3. `category-utils.ts` — funkcja `getCategorySubtreeIds()`
4. `getCategories()` i `getEbooks()` — zmiany w `strapi.ts`
5. `SortSelect.tsx` — nowy komponent
6. `CategorySidebar.tsx` — nowy komponent
7. `CategoryMobilePanel.tsx` — nowy komponent
8. `katalog/page.tsx` — nowy layout i logika
9. Usunięcie `CategoryFilter.tsx` i `CategoryChips.tsx` (zastąpione)

---

## 7. Decyzje i uzasadnienia

- **Self-referencing relation zamiast nested sets:** Prosta implementacja w Strapi, brak raw SQL, działa na SQLite (dev) i PostgreSQL (prod)
- **Subtree resolution w Next.js (nie Strapi):** Brak potrzeby custom endpointów, drzewo kategorii jest małe i cache'owane
- **Flat lista z wcięciami zamiast accordion:** Prosta w implementacji, wszystkie opcje widoczne od razu, user potwierdził preferencję
- **Slugi w URL zamiast ID:** Czytelne URLe, SEO-friendly, bez zmian w obecnej strukturze URLi
