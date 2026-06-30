# Hierarchical Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-level category hierarchy to Strapi, update catalog filtering to show ebooks from all subcategories when a parent is selected, and add sorting (newest / price asc / price desc / alphabetical).

**Architecture:** Self-referencing `parent`/`children` relation on the Strapi Category content type. On each catalog request, Next.js fetches all categories (flat list with `parent` populated), computes the selected category's full subtree IDs in memory, then queries Strapi for ebooks filtered by `categories.id[$in]`. Sort order is a new `?sortowanie=` query param mapped to Strapi sort strings.

**Tech Stack:** Strapi v5, Next.js 15 (App Router), TypeScript, Tailwind v4, shadcn/ui Select

## Global Constraints

- All UI text in Polish
- Brand colors: teal `#4BBFCA` (active/selected), gray `#e5e7eb` (border), `#6b7280` (text inactive)
- TypeScript strict mode — verify with `cd apps/web && npx tsc --noEmit` after each task
- No new npm packages
- Sorting default (when `?sortowanie` absent): newest first (`createdAt:desc`)
- Query param names: `kategoria`, `sortowanie`, `szukaj`, `strona`
- Sort param values: `najnowsze`, `cena-rosnaco`, `cena-malejaco`, `alfabetycznie`

---

### Task 1: Strapi category schema — add parent/children relation

**Files:**
- Modify: `apps/cms/src/api/category/content-types/category/schema.json`

**Interfaces:**
- Produces: Strapi Category content type with `parent` (manyToOne → self) and `children` (oneToMany → self) fields visible in Admin UI

- [ ] **Step 1: Add the relation fields to the schema**

Replace the content of `apps/cms/src/api/category/content-types/category/schema.json` with:

```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Kategoria",
    "description": "Kategorie ebooków"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true,
      "maxLength": 100
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "ebooks": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::ebook.ebook",
      "inversedBy": "categories"
    },
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
  }
}
```

- [ ] **Step 2: Restart Strapi and verify schema**

```bash
# In a separate terminal, restart the CMS:
npm run dev
# (runs both web + cms via turborepo)
```

Open http://localhost:1337/admin → Content Manager → Kategoria → click any category.
Expected: a "Parent" relation field appears in the edit form. Create a test subcategory by setting its parent to an existing category.

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/api/category/content-types/category/schema.json
git commit -m "feat(cms): add parent/children self-referencing relation to Category"
```

---

### Task 2: TypeScript types — extend Category interface

**Files:**
- Modify: `apps/web/types/index.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `Category` interface with optional `parent` and `children` fields used by all subsequent tasks

- [ ] **Step 1: Extend the Category interface**

In `apps/web/types/index.ts`, replace the `Category` interface:

```ts
// Category
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

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors related to Category. Any pre-existing errors are not introduced by this task.

- [ ] **Step 3: Commit**

```bash
git add apps/web/types/index.ts
git commit -m "feat(types): add parent/children to Category interface"
```

---

### Task 3: category-utils.ts — subtree resolution and display order

**Files:**
- Create: `apps/web/lib/category-utils.ts`

**Interfaces:**
- Consumes: `Category` from `@/types` (with `parent` and `children` from Task 2)
- Produces:
  - `getCategorySubtreeIds(categories: Category[], slug: string): number[]` — returns IDs of the matched category + all its descendants (BFS)
  - `buildDisplayOrder(categories: Category[]): Array<{ category: Category; depth: number }>` — DFS preorder with depth, used by sidebar/mobile panel

- [ ] **Step 1: Create the file**

Create `apps/web/lib/category-utils.ts`:

```ts
import type { Category } from "@/types";

function buildChildrenMap(categories: Category[]): Map<number, Category[]> {
  const map = new Map<number, Category[]>();
  for (const cat of categories) {
    if (cat.parent?.id != null) {
      const existing = map.get(cat.parent.id) ?? [];
      map.set(cat.parent.id, [...existing, cat]);
    }
  }
  return map;
}

export function getCategorySubtreeIds(
  categories: Category[],
  slug: string
): number[] {
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [];

  const childrenMap = buildChildrenMap(categories);
  const result: number[] = [];
  const queue: number[] = [root.id];

  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    const children = childrenMap.get(id) ?? [];
    queue.push(...children.map((c) => c.id));
  }

  return result;
}

export function buildDisplayOrder(
  categories: Category[]
): Array<{ category: Category; depth: number }> {
  const childrenMap = buildChildrenMap(categories);
  const roots = categories
    .filter((c) => !c.parent)
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));

  const result: Array<{ category: Category; depth: number }> = [];

  function dfs(cat: Category, depth: number) {
    result.push({ category: cat, depth });
    const children = (childrenMap.get(cat.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "pl")
    );
    for (const child of children) {
      dfs(child, depth + 1);
    }
  }

  for (const root of roots) {
    dfs(root, 0);
  }

  return result;
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Manually verify logic in browser console (optional)**

In any browser console, paste and run:
```js
const cats = [
  { id: 1, slug: "doc", name: "Dokumentacja", parent: null },
  { id: 2, slug: "proc", name: "Procedury", parent: { id: 1 } },
  { id: 3, slug: "rodo", name: "RODO", parent: { id: 2 } },
];
// getCategorySubtreeIds(cats, "doc") should return [1, 2, 3]
// buildDisplayOrder(cats) should return [{depth:0,cat:doc},{depth:1,cat:proc},{depth:2,cat:rodo}]
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/category-utils.ts
git commit -m "feat(lib): add category-utils with subtree resolution and display order"
```

---

### Task 4: strapi.ts — update getCategories and getEbooks

**Files:**
- Modify: `apps/web/lib/strapi.ts`

**Interfaces:**
- Consumes: `getCategorySubtreeIds` is NOT called here — called in `page.tsx`. This task only changes the Strapi query functions.
- Produces:
  - `getCategories()` — now populates `parent` field on each category
  - `getEbooks(params)` — new optional params: `categoryIds?: number[]`, `sort?: "najnowsze" | "cena-rosnaco" | "cena-malejaco" | "alfabetycznie"`

- [ ] **Step 1: Update getCategories to populate parent**

In `apps/web/lib/strapi.ts`, replace the `getCategories` function:

```ts
export async function getCategories(): Promise<Category[]> {
  const res = await strapiRequest<StrapiResponse<Category[]>>(
    "/categories?sort=name:asc&populate[parent]=true"
  );
  return res.data;
}
```

- [ ] **Step 2: Update getEbooks to support categoryIds and sort**

In `apps/web/lib/strapi.ts`, replace the `getEbooks` function:

```ts
const SORT_MAP: Record<string, string> = {
  "najnowsze": "createdAt:desc",
  "cena-rosnaco": "price:asc",
  "cena-malejaco": "price:desc",
  "alfabetycznie": "title:asc",
};

export async function getEbooks(params?: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  categoryIds?: number[];
  search?: string;
  featured?: boolean;
  sort?: string;
}): Promise<StrapiResponse<Ebook[]>> {
  const qs = new URLSearchParams({
    "populate[coverImage]": "true",
    "populate[categories]": "true",
    "pagination[page]": String(params?.page ?? 1),
    "pagination[pageSize]": String(params?.pageSize ?? 12),
    "sort": SORT_MAP[params?.sort ?? ""] ?? "createdAt:desc",
  });

  if (params?.categoryIds && params.categoryIds.length > 0) {
    params.categoryIds.forEach((id, i) => {
      qs.set(`filters[categories][id][$in][${i}]`, String(id));
    });
  } else if (params?.categorySlug) {
    qs.set("filters[categories][slug][$eq]", params.categorySlug);
  }

  if (params?.search) {
    qs.set("filters[$or][0][title][$containsi]", params.search);
    qs.set("filters[$or][1][shortDescription][$containsi]", params.search);
  }

  if (params?.featured) {
    qs.set("filters[isFeatured][$eq]", "true");
  }

  return strapiRequest<StrapiResponse<Ebook[]>>(`/ebooks?${qs}`);
}
```

- [ ] **Step 3: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/strapi.ts
git commit -m "feat(lib): update getCategories to populate parent, add sort and categoryIds to getEbooks"
```

---

### Task 5: SortSelect component

**Files:**
- Create: `apps/web/components/catalog/SortSelect.tsx`

**Interfaces:**
- Consumes: shadcn/ui `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/ui/select`; `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`
- Produces: `SortSelect({ value?: string })` — client component that sets `?sortowanie=` query param

- [ ] **Step 1: Create the component**

Create `apps/web/components/catalog/SortSelect.tsx`:

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  value?: string;
}

const SORT_OPTIONS = [
  { value: "najnowsze", label: "Najnowsze" },
  { value: "cena-rosnaco", label: "Cena rosnąco" },
  { value: "cena-malejaco", label: "Cena malejąco" },
  { value: "alfabetycznie", label: "Alfabetycznie A–Z" },
] as const;

export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "najnowsze") {
      params.delete("sortowanie");
    } else {
      params.set("sortowanie", val);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value ?? "najnowsze"} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Sortowanie" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/catalog/SortSelect.tsx
git commit -m "feat(catalog): add SortSelect component"
```

---

### Task 6: CategorySidebar component

**Files:**
- Create: `apps/web/components/catalog/CategorySidebar.tsx`

**Interfaces:**
- Consumes: `buildDisplayOrder(categories: Category[]): Array<{ category: Category; depth: number }>` from `@/lib/category-utils`; `Category` from `@/types`; `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`
- Produces: `CategorySidebar({ categories: Category[], selected?: string })` — server-safe client component rendering flat indented list

- [ ] **Step 1: Create the component**

Create `apps/web/components/catalog/CategorySidebar.tsx`:

```tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { buildDisplayOrder } from "@/lib/category-utils";
import type { Category } from "@/types";

interface CategorySidebarProps {
  categories: Category[];
  selected?: string;
}

export function CategorySidebar({ categories, selected }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = selected ?? null;

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug) {
      params.delete("kategoria");
    } else {
      params.set("kategoria", slug);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  const items = buildDisplayOrder(categories);

  return (
    <nav aria-label="Kategorie">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Kategorie
      </p>
      <ul className="space-y-0.5">
        <li>
          <button
            onClick={() => handleSelect(null)}
            className="w-full rounded px-2 py-1.5 text-left text-sm transition-colors"
            style={
              !activeSlug
                ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                : { color: "#374151" }
            }
          >
            Wszystkie kategorie
          </button>
        </li>
        {items.map(({ category, depth }) => (
          <li key={category.id}>
            <button
              onClick={() => handleSelect(category.slug)}
              className="w-full rounded px-2 py-1.5 text-left text-sm transition-colors"
              style={{
                paddingLeft: `${8 + depth * 12}px`,
                ...(activeSlug === category.slug
                  ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                  : { color: "#374151" }),
              }}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/catalog/CategorySidebar.tsx
git commit -m "feat(catalog): add CategorySidebar with indented hierarchical list"
```

---

### Task 7: CategoryMobilePanel component

**Files:**
- Create: `apps/web/components/catalog/CategoryMobilePanel.tsx`

**Interfaces:**
- Consumes: `buildDisplayOrder` from `@/lib/category-utils`; `Category` from `@/types`; `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`; `useState` from `react`
- Produces: `CategoryMobilePanel({ categories: Category[], selected?: string })` — collapsible panel for mobile

- [ ] **Step 1: Create the component**

Create `apps/web/components/catalog/CategoryMobilePanel.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { buildDisplayOrder } from "@/lib/category-utils";
import type { Category } from "@/types";

interface CategoryMobilePanelProps {
  categories: Category[];
  selected?: string;
}

export function CategoryMobilePanel({ categories, selected }: CategoryMobilePanelProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = categories.find((c) => c.slug === selected);
  const activeLabel = activeCategory?.name ?? "Wszystkie kategorie";

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug) {
      params.delete("kategoria");
    } else {
      params.set("kategoria", slug);
    }
    params.delete("strona");
    setOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  }

  const items = buildDisplayOrder(categories);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
      >
        <span>
          Kategoria: <span style={{ color: "#4BBFCA" }}>{activeLabel}</span>
        </span>
        <ChevronDown
          className="h-4 w-4 text-gray-400 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-md">
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => handleSelect(null)}
                className="w-full rounded px-3 py-2 text-left text-sm transition-colors"
                style={
                  !selected
                    ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                    : { color: "#374151" }
                }
              >
                Wszystkie kategorie
              </button>
            </li>
            {items.map(({ category, depth }) => (
              <li key={category.id}>
                <button
                  onClick={() => handleSelect(category.slug)}
                  className="w-full rounded py-2 text-left text-sm transition-colors"
                  style={{
                    paddingLeft: `${12 + depth * 12}px`,
                    paddingRight: "12px",
                    ...(selected === category.slug
                      ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                      : { color: "#374151" }),
                  }}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/catalog/CategoryMobilePanel.tsx
git commit -m "feat(catalog): add CategoryMobilePanel collapsible for mobile"
```

---

### Task 8: Update katalog/page.tsx — new layout, subtree logic, remove old components

**Files:**
- Modify: `apps/web/app/(shop)/katalog/page.tsx`
- Delete: `apps/web/components/catalog/CategoryFilter.tsx`
- Delete: `apps/web/components/catalog/CategoryChips.tsx`

**Interfaces:**
- Consumes:
  - `getCategorySubtreeIds(categories, slug): number[]` from `@/lib/category-utils`
  - `CategorySidebar({ categories, selected })` from `@/components/catalog/CategorySidebar`
  - `CategoryMobilePanel({ categories, selected })` from `@/components/catalog/CategoryMobilePanel`
  - `SortSelect({ value? })` from `@/components/catalog/SortSelect`
  - `getEbooks({ categoryIds, sort, ... })` from `@/lib/strapi`
- Produces: updated catalog page with sidebar layout on desktop, collapsible panel on mobile, sort dropdown

- [ ] **Step 1: Replace katalog/page.tsx**

Replace the entire content of `apps/web/app/(shop)/katalog/page.tsx`:

```tsx
import { Suspense } from "react";
import { getEbooks, getCategories } from "@/lib/strapi";
import { getCategorySubtreeIds } from "@/lib/category-utils";
import { EbookGrid } from "@/components/catalog/EbookGrid";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { CategoryMobilePanel } from "@/components/catalog/CategoryMobilePanel";
import { SortSelect } from "@/components/catalog/SortSelect";
import { SearchBar } from "@/components/catalog/SearchBar";
import { PageHeader } from "@/components/layout/PageHeader";

interface KatalogPageProps {
  searchParams: Promise<{
    strona?: string;
    kategoria?: string;
    szukaj?: string;
    sortowanie?: string;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function generateMetadata({ searchParams }: KatalogPageProps) {
  const params = await searchParams;
  const canonical = params.kategoria
    ? `${BASE_URL}/katalog?kategoria=${params.kategoria}`
    : `${BASE_URL}/katalog`;

  return {
    title: "Katalog ebooków",
    description:
      "Przeglądaj nasze ebooki z instrukcjami dla przedszkoli i żłobków.",
    alternates: { canonical },
  };
}

export default async function KatalogPage({ searchParams }: KatalogPageProps) {
  const params = await searchParams;
  const page = Number(params.strona ?? 1);
  const categorySlug = params.kategoria;
  const search = params.szukaj;
  const sort = params.sortowanie;

  const categories = await getCategories();

  const categoryIds = categorySlug
    ? getCategorySubtreeIds(categories, categorySlug)
    : undefined;

  const ebooksRes = await getEbooks({
    page,
    pageSize: 12,
    categoryIds,
    search,
    sort,
  });

  return (
    <div>
      <PageHeader
        pill="📚 Katalog"
        title="Katalog materiałów"
        description="50+ ebooków i dokumentów dla żłobków i przedszkoli"
      />

      <div className="container mx-auto px-4 py-10">
        {/* Mobile: collapsible category panel */}
        <div className="sm:hidden mb-4">
          <Suspense fallback={null}>
            <CategoryMobilePanel categories={categories} selected={categorySlug} />
          </Suspense>
        </div>

        {/* Toolbar: search + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <SearchBar defaultValue={search} />
          <Suspense fallback={null}>
            <SortSelect value={sort} />
          </Suspense>
        </div>

        {/* Desktop: sidebar + grid */}
        <div className="flex gap-8">
          <aside className="hidden sm:block w-52 shrink-0">
            <Suspense fallback={null}>
              <CategorySidebar categories={categories} selected={categorySlug} />
            </Suspense>
          </aside>
          <main className="flex-1 min-w-0">
            <Suspense fallback={<div className="py-10 text-center">Ładowanie...</div>}>
              <EbookGrid
                ebooks={ebooksRes.data}
                pagination={ebooksRes.meta.pagination}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete old components**

```bash
rm apps/web/components/catalog/CategoryFilter.tsx
rm apps/web/components/catalog/CategoryChips.tsx
```

- [ ] **Step 3: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors. If there are import errors about deleted files, verify they are only imported from `katalog/page.tsx` (already replaced above).

- [ ] **Step 4: Manually verify in browser**

```bash
npm run dev
```

Open http://localhost:3000/katalog and verify:
1. Desktop (>640px): sidebar with "Kategorie" heading and indented list appears on the left; ebook grid fills the rest
2. Mobile (<640px): "Kategoria: Wszystkie kategorie" button appears; tap it → dropdown opens with indented list; select a category → closes and filters
3. Sort dropdown appears next to search bar — selecting "Cena rosnąco" reloads with cheapest ebooks first
4. If any category has subcategories in Strapi: selecting the parent shows ebooks from subcategories too
5. `?kategoria=` + `?sortowanie=` + `?szukaj=` params coexist correctly in the URL

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/\(shop\)/katalog/page.tsx
git rm apps/web/components/catalog/CategoryFilter.tsx
git rm apps/web/components/catalog/CategoryChips.tsx
git commit -m "feat(catalog): hierarchical category sidebar, mobile panel, and sort dropdown"
```
