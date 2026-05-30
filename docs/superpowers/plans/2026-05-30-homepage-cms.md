# Homepage CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all homepage texts editable from Strapi admin panel without affecting SEO or performance.

**Architecture:** New `homepage` singleton in Strapi (same pattern as existing `setting`). Four repeatable components handle arrays (trust bar, stats, steps, feature cards). Next.js fetches with `revalidate: 60` (already default in strapiRequest) — page stays fully server-rendered. All fields have hardcoded fallbacks so the page works when Strapi is down.

**Tech Stack:** Strapi v5 single type + components, Next.js App Router SSR, TypeScript

---

## File Map

### CMS — new files
- `apps/cms/src/components/homepage/trust-item.json` — component: `{ text }` (1 trust bar item)
- `apps/cms/src/components/homepage/stat.json` — component: `{ value, label }`
- `apps/cms/src/components/homepage/step.json` — component: `{ title, desc }`
- `apps/cms/src/components/homepage/feature-card.json` — component: `{ title, desc, tag }`
- `apps/cms/src/api/homepage/content-types/homepage/schema.json` — singleton schema with all text fields + component relations
- `apps/cms/src/api/homepage/controllers/homepage.ts` — core controller
- `apps/cms/src/api/homepage/routes/homepage.ts` — core router
- `apps/cms/src/api/homepage/services/homepage.ts` — core service

### Web — modified files
- `apps/web/types/index.ts` — add `HomepageTrustItem`, `HomepageStat`, `HomepageStep`, `HomepageFeatureCard`, `Homepage` types
- `apps/web/lib/strapi.ts` — add `getHomepage()` function
- `apps/web/app/(shop)/page.tsx` — fetch homepage data, replace hardcoded strings with data fields + fallbacks

---

## Task 1: Strapi components

**Files:**
- Create: `apps/cms/src/components/homepage/trust-item.json`
- Create: `apps/cms/src/components/homepage/stat.json`
- Create: `apps/cms/src/components/homepage/step.json`
- Create: `apps/cms/src/components/homepage/feature-card.json`

- [ ] Create `apps/cms/src/components/homepage/trust-item.json`:

```json
{
  "collectionName": "components_homepage_trust_items",
  "info": {
    "displayName": "Trust Item",
    "icon": "check"
  },
  "options": {},
  "attributes": {
    "text": {
      "type": "string",
      "required": true
    }
  }
}
```

- [ ] Create `apps/cms/src/components/homepage/stat.json`:

```json
{
  "collectionName": "components_homepage_stats",
  "info": {
    "displayName": "Stat",
    "icon": "chartBar"
  },
  "options": {},
  "attributes": {
    "value": {
      "type": "string",
      "required": true
    },
    "label": {
      "type": "string",
      "required": true
    }
  }
}
```

- [ ] Create `apps/cms/src/components/homepage/step.json`:

```json
{
  "collectionName": "components_homepage_steps",
  "info": {
    "displayName": "Step",
    "icon": "bulletList"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "desc": {
      "type": "text",
      "required": true
    }
  }
}
```

- [ ] Create `apps/cms/src/components/homepage/feature-card.json`:

```json
{
  "collectionName": "components_homepage_feature_cards",
  "info": {
    "displayName": "Feature Card",
    "icon": "layout"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "desc": {
      "type": "text",
      "required": true
    },
    "tag": {
      "type": "string",
      "required": true
    }
  }
}
```

- [ ] Commit:

```bash
git add apps/cms/src/components/homepage/
git commit -m "feat(cms): add homepage Strapi components"
```

---

## Task 2: Strapi homepage singleton schema

**Files:**
- Create: `apps/cms/src/api/homepage/content-types/homepage/schema.json`

- [ ] Create `apps/cms/src/api/homepage/content-types/homepage/schema.json`:

```json
{
  "kind": "singleType",
  "collectionName": "homepage",
  "info": {
    "singularName": "homepage",
    "pluralName": "homepages",
    "displayName": "Strona główna",
    "description": "Treści strony głównej"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "heroBadge": {
      "type": "string",
      "default": "mądrze, prosto i z sercem"
    },
    "heroTitleBefore": {
      "type": "string",
      "default": "Materiały dla"
    },
    "heroTitleHighlight": {
      "type": "string",
      "default": "żłobków i przedszkoli"
    },
    "heroTitleAfter": {
      "type": "string",
      "default": "– dokumentacja, scenariusze i pomoce dydaktyczne"
    },
    "heroSubtitle": {
      "type": "string",
      "default": "Gotowe materiały dla dyrektorów, nauczycieli i opiekunów dzieci"
    },
    "heroDescription": {
      "type": "text",
      "default": "Tworzymy praktyczne materiały dla żłobków i przedszkoli: procedury, regulaminy, scenariusze zajęć oraz dokumentację dla opiekunów i nauczycieli. Pobierz gotowe materiały, wydrukuj i wykorzystaj od razu w swojej placówce."
    },
    "heroCta1": {
      "type": "string",
      "default": "Przeglądaj katalog"
    },
    "heroCta2": {
      "type": "string",
      "default": "Jak to działa?"
    },
    "trustBar": {
      "type": "component",
      "repeatable": true,
      "component": "homepage.trust-item"
    },
    "statsTitle": {
      "type": "string"
    },
    "stats": {
      "type": "component",
      "repeatable": true,
      "component": "homepage.stat"
    },
    "howItWorksBadge": {
      "type": "string",
      "default": "Prosty proces"
    },
    "howItWorksTitle": {
      "type": "string",
      "default": "Jak to działa?"
    },
    "howItWorksSteps": {
      "type": "component",
      "repeatable": true,
      "component": "homepage.step"
    },
    "featuredBadge": {
      "type": "string",
      "default": "⭐ Bestsellery"
    },
    "featuredTitle": {
      "type": "string",
      "default": "Polecane ebooki"
    },
    "featuredLinkText": {
      "type": "string",
      "default": "Zobacz wszystkie"
    },
    "categoriesTitle": {
      "type": "string",
      "default": "Kategorie"
    },
    "categoriesSubtitle": {
      "type": "string",
      "default": "Znajdź dokumenty dla swojego żłobka"
    },
    "whyUsBadge": {
      "type": "string",
      "default": "Dlaczego my?"
    },
    "whyUsTitle": {
      "type": "string",
      "default": "Materiały do żłobka i przedszkola – gotowe rozwiązania"
    },
    "whyUsCards": {
      "type": "component",
      "repeatable": true,
      "component": "homepage.feature-card"
    },
    "testimonialsBadge": {
      "type": "string",
      "default": "❤️ Opinie"
    },
    "testimonialsTitle": {
      "type": "string",
      "default": "Co mówią dyrektorzy i właściciele placówek?"
    },
    "ctaTitle": {
      "type": "string",
      "default": "Nasze materiały wspierają pracę żłobków i przedszkoli"
    },
    "ctaSubtitle": {
      "type": "string",
      "default": "Scenariusze zajęć, dokumentacja dla opiekunek i gotowe procedury dla dyrektorów — przygotowane w PDF do pobrania i druku."
    },
    "ctaButton": {
      "type": "string",
      "default": "Przeglądaj katalog"
    },
    "seoText1": {
      "type": "text",
      "default": "Materiały dla żłobków i przedszkoli — gotowe procedury, regulaminy, scenariusze zajęć i dokumentacja w formacie PDF. Pobierz, wydrukuj i wdróż od razu w swojej placówce."
    },
    "seoText2": {
      "type": "text",
      "default": "Nasze materiały wspierają dyrektorów, właścicieli i opiekunów w codziennej pracy — zgodne z aktualnymi przepisami, tworzone przez praktyków."
    }
  }
}
```

- [ ] Commit:

```bash
git add apps/cms/src/api/homepage/content-types/
git commit -m "feat(cms): add homepage singleton schema"
```

---

## Task 3: Strapi API files (controller, routes, services)

**Files:**
- Create: `apps/cms/src/api/homepage/controllers/homepage.ts`
- Create: `apps/cms/src/api/homepage/routes/homepage.ts`
- Create: `apps/cms/src/api/homepage/services/homepage.ts`

- [ ] Create `apps/cms/src/api/homepage/controllers/homepage.ts`:

```ts
import { factories } from '@strapi/strapi';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default factories.createCoreController('api::homepage.homepage' as any);
```

- [ ] Create `apps/cms/src/api/homepage/routes/homepage.ts`:

```ts
import { factories } from '@strapi/strapi';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default factories.createCoreRouter('api::homepage.homepage' as any);
```

- [ ] Create `apps/cms/src/api/homepage/services/homepage.ts`:

```ts
import { factories } from '@strapi/strapi';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default factories.createCoreService('api::homepage.homepage' as any);
```

- [ ] Commit:

```bash
git add apps/cms/src/api/homepage/
git commit -m "feat(cms): add homepage API controller, routes, services"
```

---

## Task 4: TypeScript types in web app

**Files:**
- Modify: `apps/web/types/index.ts`

- [ ] Add these types to `apps/web/types/index.ts` (append before the last export or at end of file):

```ts
export interface HomepageTrustItem {
  id: number;
  text: string;
}

export interface HomepageStat {
  id: number;
  value: string;
  label: string;
}

export interface HomepageStep {
  id: number;
  title: string;
  desc: string;
}

export interface HomepageFeatureCard {
  id: number;
  title: string;
  desc: string;
  tag: string;
}

export interface Homepage {
  heroBadge: string;
  heroTitleBefore: string;
  heroTitleHighlight: string;
  heroTitleAfter: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCta1: string;
  heroCta2: string;
  trustBar: HomepageTrustItem[];
  stats: HomepageStat[];
  howItWorksBadge: string;
  howItWorksTitle: string;
  howItWorksSteps: HomepageStep[];
  featuredBadge: string;
  featuredTitle: string;
  featuredLinkText: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  whyUsBadge: string;
  whyUsTitle: string;
  whyUsCards: HomepageFeatureCard[];
  testimonialsBadge: string;
  testimonialsTitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  seoText1: string;
  seoText2: string;
}
```

- [ ] Commit:

```bash
git add apps/web/types/index.ts
git commit -m "feat(types): add Homepage types"
```

---

## Task 5: getHomepage() in strapi client

**Files:**
- Modify: `apps/web/lib/strapi.ts`

- [ ] Add `Homepage` to the import at top of `apps/web/lib/strapi.ts`:

```ts
import type { Ebook, Category, Order, DownloadToken, MagicToken, Review, Settings, Homepage, StrapiResponse } from "@/types";
```

- [ ] Add `getHomepage()` function at the end of `apps/web/lib/strapi.ts` (before the final `export { STRAPI_URL }`):

```ts
// ── Homepage ──────────────────────────────────────────────────────────────────

export async function getHomepage(): Promise<Homepage | null> {
  try {
    const res = await strapiRequest<{ data: Homepage }>(
      "/homepage?populate[trustBar]=true&populate[stats]=true&populate[howItWorksSteps]=true&populate[whyUsCards]=true"
    );
    return res.data;
  } catch {
    return null;
  }
}
```

- [ ] Commit:

```bash
git add apps/web/lib/strapi.ts
git commit -m "feat(strapi): add getHomepage() client function"
```

---

## Task 6: Update page.tsx to use homepage data

**Files:**
- Modify: `apps/web/app/(shop)/page.tsx`

- [ ] Add `Homepage` and `getHomepage` to imports at top of `apps/web/app/(shop)/page.tsx`:

```ts
import { getEbooks, getCategories, getFeaturedReviews, getHomepage } from "@/lib/strapi";
import type { Ebook, Category, Review, Homepage } from "@/types";
```

- [ ] Update the data fetching block to also fetch homepage:

```ts
  const [ebooksRes, categories, featuredReviews, hp] = await Promise.all([
    getEbooks({ featured: true, pageSize: 3 }).catch(() => ({
      data: [] as Ebook[],
      meta: { pagination: { total: 0, page: 1, pageSize: 3, pageCount: 0 } },
    })),
    getCategories().catch(() => [] as Category[]),
    getFeaturedReviews(3).catch(() => [] as Review[]),
    getHomepage().catch(() => null),
  ]);
```

- [ ] Add a defaults object immediately after the fetch block (before `const featuredEbooks`). This is the fallback used when Strapi is down:

```ts
  const h: Homepage = {
    heroBadge: hp?.heroBadge ?? "mądrze, prosto i z sercem",
    heroTitleBefore: hp?.heroTitleBefore ?? "Materiały dla",
    heroTitleHighlight: hp?.heroTitleHighlight ?? "żłobków i przedszkoli",
    heroTitleAfter: hp?.heroTitleAfter ?? "– dokumentacja, scenariusze i pomoce dydaktyczne",
    heroSubtitle: hp?.heroSubtitle ?? "Gotowe materiały dla dyrektorów, nauczycieli i opiekunów dzieci",
    heroDescription: hp?.heroDescription ?? "Tworzymy praktyczne materiały dla żłobków i przedszkoli: procedury, regulaminy, scenariusze zajęć oraz dokumentację dla opiekunów i nauczycieli. Pobierz gotowe materiały, wydrukuj i wykorzystaj od razu w swojej placówce.",
    heroCta1: hp?.heroCta1 ?? "Przeglądaj katalog",
    heroCta2: hp?.heroCta2 ?? "Jak to działa?",
    trustBar: hp?.trustBar?.length ? hp.trustBar : [
      { id: 1, text: "500+ dyrektorów i właścicieli" },
      { id: 2, text: "Zgodne z przepisami" },
      { id: 3, text: "Dostęp w kilka sekund" },
    ],
    stats: hp?.stats?.length ? hp.stats : [
      { id: 1, value: "500+", label: "dyrektorów i właścicieli" },
      { id: 2, value: "50+",  label: "dostępnych ebooków" },
      { id: 3, value: "30",   label: "dni dostępu po zakupie" },
      { id: 4, value: "100%", label: "zgodność z przepisami" },
    ],
    howItWorksBadge: hp?.howItWorksBadge ?? "Prosty proces",
    howItWorksTitle: hp?.howItWorksTitle ?? "Jak to działa?",
    howItWorksSteps: hp?.howItWorksSteps?.length ? hp.howItWorksSteps : [
      { id: 1, title: "Wybierz materiały", desc: "Przeglądaj katalog i znajdź dokumenty dopasowane do Twojej placówki — procedury, regulaminy, scenariusze zajęć." },
      { id: 2, title: "Zapłać bezpiecznie", desc: "BLIK, przelew lub karta przez Przelewy24. Bez zakładania konta." },
      { id: 3, title: "Pobierz i wdróż", desc: "Link do PDF trafia na e-mail w kilka sekund. Uzupełnij dane placówki i gotowe." },
    ],
    featuredBadge: hp?.featuredBadge ?? "⭐ Bestsellery",
    featuredTitle: hp?.featuredTitle ?? "Polecane ebooki",
    featuredLinkText: hp?.featuredLinkText ?? "Zobacz wszystkie",
    categoriesTitle: hp?.categoriesTitle ?? "Kategorie",
    categoriesSubtitle: hp?.categoriesSubtitle ?? "Znajdź dokumenty dla swojego żłobka",
    whyUsBadge: hp?.whyUsBadge ?? "Dlaczego my?",
    whyUsTitle: hp?.whyUsTitle ?? "Materiały do żłobka i przedszkola – gotowe rozwiązania",
    whyUsCards: hp?.whyUsCards?.length ? hp.whyUsCards : [
      { id: 1, title: "Materiały dla żłobków", desc: "Procedury, regulaminy i dokumentacja dostosowana do specyfiki żłobka — gotowe do uzupełnienia i druku.", tag: "Żłobki" },
      { id: 2, title: "Materiały dla przedszkoli", desc: "Scenariusze zajęć, pomoce dydaktyczne i dokumentacja dla nauczycieli wychowania przedszkolnego.", tag: "Przedszkola" },
      { id: 3, title: "Dokumentacja placówki", desc: "Gotowe wzory dokumentów dla żłobków i przedszkoli — procedury, regulaminy i formularze w jednym miejscu.", tag: "Dokumentacja" },
      { id: 4, title: "Dla każdej roli", desc: "Scenariusze zajęć dla najmłodszych, dokumentacja dla opiekunek oraz gotowe procedury dla dyrektorów placówek.", tag: "Dla zespołu" },
      { id: 5, title: "Codzienna praca", desc: "Nasze materiały pomagają w codziennej pracy, oszczędzają czas i pozwalają skupić się na tym, co ważne — dzieciach.", tag: "Praktyczne" },
      { id: 6, title: "Gotowe do wdrożenia", desc: "Materiały w PDF do pobrania i druku — możesz wdrożyć je od razu w swojej placówce bez dodatkowego przygotowania.", tag: "PDF" },
    ],
    testimonialsBadge: hp?.testimonialsBadge ?? "❤️ Opinie",
    testimonialsTitle: hp?.testimonialsTitle ?? "Co mówią dyrektorzy i właściciele placówek?",
    ctaTitle: hp?.ctaTitle ?? "Nasze materiały wspierają pracę żłobków i przedszkoli",
    ctaSubtitle: hp?.ctaSubtitle ?? "Scenariusze zajęć, dokumentacja dla opiekunek i gotowe procedury dla dyrektorów — przygotowane w PDF do pobrania i druku.",
    ctaButton: hp?.ctaButton ?? "Przeglądaj katalog",
    seoText1: hp?.seoText1 ?? "Materiały dla żłobków i przedszkoli — gotowe procedury, regulaminy, scenariusze zajęć i dokumentacja w formacie PDF. Pobierz, wydrukuj i wdróż od razu w swojej placówce.",
    seoText2: hp?.seoText2 ?? "Nasze materiały wspierają dyrektorów, właścicieli i opiekunów w codziennej pracy — zgodne z aktualnymi przepisami, tworzone przez praktyków.",
  };
```

- [ ] Replace all hardcoded strings in the JSX with `h.*` equivalents. Go section by section:

**Hero badge** (`mądrze, prosto i z sercem`) → `{h.heroBadge}`

**Hero h1** — replace the three text nodes:
```tsx
<h1 ...>
  {h.heroTitleBefore}{" "}
  <span className="relative inline-block whitespace-nowrap" style={{ color: "#F5A623" }}>
    {h.heroTitleHighlight}
    <svg .../>
  </span>
  {" "}{h.heroTitleAfter}
</h1>
```

**Hero subtitle p** → `{h.heroSubtitle}`

**Hero description p** → `{h.heroDescription}`

**Hero CTA buttons** → `{h.heroCta1}` and `{h.heroCta2}`

**Trust bar** — replace the hardcoded array with:
```tsx
{h.trustBar.map(({ id, text }) => (
  <span key={id} className="flex items-center gap-1.5 font-medium">
    <CheckCircle2 className="h-4 w-4" style={{ color: "#7BC44C" }} />
    {text}
  </span>
))}
```
Note: icons stay hardcoded (CheckCircle2 for all items, matching current design).

**Stats section** — replace the hardcoded array with:
```tsx
{h.stats.map(({ id, value, label }, i) => {
  const icons = [Users, BookOpen, Clock, Trophy];
  const Icon = icons[i % icons.length];
  return (
    <div key={id} className="flex flex-col items-center gap-2 text-center text-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-1">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <p className="text-4xl font-bold drop-shadow-sm">{value}</p>
      <p className="text-sm text-white/80 leading-snug">{label}</p>
    </div>
  );
})}
```

**How it works badge** → `{h.howItWorksBadge}`

**How it works title** → `{h.howItWorksTitle}`

**How it works steps** — replace the hardcoded array with:
```tsx
{h.howItWorksSteps.map(({ id, title, desc }, i) => {
  const stepStyles = [
    { icon: BookOpen, bg: "linear-gradient(135deg, #FFF3DC, #FFE4A0)", color: "#F5A623", border: "#FFD875" },
    { icon: FileText, bg: "linear-gradient(135deg, #E2F7FA, #B2EBF2)", color: "#4BBFCA", border: "#81D4DA" },
    { icon: Download, bg: "linear-gradient(135deg, #EDF9E8, #C8F0BC)", color: "#7BC44C", border: "#A5D99B" },
  ];
  const { icon: Icon, bg, color, border } = stepStyles[i % stepStyles.length];
  const step = String(i + 1).padStart(2, "0");
  return (
    <div key={id} className="relative rounded-3xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: bg, border: `1.5px solid ${border}` }}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md" style={{ backgroundColor: color }}>
        <Icon className="h-7 w-7" />
      </div>
      <span className="absolute right-6 top-6 text-5xl font-black opacity-15" style={{ color }}>{step}</span>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
})}
```

**Featured badge** → `{h.featuredBadge}`

**Featured title** → `{h.featuredTitle}`

**Featured link text** → `{h.featuredLinkText}`

**Categories title** → `{h.categoriesTitle}`

**Categories subtitle** → `{h.categoriesSubtitle}`

**Why us badge** → `{h.whyUsBadge}`

**Why us title** → `{h.whyUsTitle}`

**Why us cards** — replace the hardcoded array with:
```tsx
{h.whyUsCards.map(({ id, title, desc, tag }, i) => {
  const cardStyles = [
    { icon: BookOpen,      color: "#F5A623", bg: "#FFF3DC" },
    { icon: GraduationCap, color: "#4BBFCA", bg: "#E2F7FA" },
    { icon: FileText,      color: "#7BC44C", bg: "#EDF9E8" },
    { icon: Users,         color: "#F5A623", bg: "#FFF3DC" },
    { icon: Heart,         color: "#4BBFCA", bg: "#E2F7FA" },
    { icon: Download,      color: "#7BC44C", bg: "#EDF9E8" },
  ];
  const { icon: Icon, color, bg } = cardStyles[i % cardStyles.length];
  return (
    <div key={id} className="flex flex-col gap-4 rounded-3xl p-7 transition-all hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: bg }}>
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: color }}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: color }}>{tag}</span>
      </div>
      <div>
        <h3 className="mb-1.5 text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
})}
```

**Testimonials badge** → `{h.testimonialsBadge}`

**Testimonials title** → `{h.testimonialsTitle}`

**CTA title** → `{h.ctaTitle}`

**CTA subtitle** → `{h.ctaSubtitle}`

**CTA button** → `{h.ctaButton}`

**SEO text** — replace both paragraphs:
```tsx
<p><strong className="text-gray-500">Materiały dla żłobków i przedszkoli</strong> — {h.seoText1}</p>
<p>{h.seoText2}</p>
```

- [ ] Verify the app compiles:

```bash
cd apps/web && npx tsc --noEmit
```

Expected: no errors.

- [ ] Commit:

```bash
git add apps/web/app/(shop)/page.tsx apps/web/types/index.ts apps/web/lib/strapi.ts
git commit -m "feat(homepage): wire homepage content from Strapi with fallbacks"
```

---

## Task 7: Seed default content in Strapi (manual step)

After restarting Strapi (`npm run dev:cms`), the `homepage` content type will appear in the admin panel.

- [ ] Open http://localhost:1337/admin → **Content Manager → Strona główna**
- [ ] Fill in all fields with default values from the fallbacks defined in Task 6
- [ ] For `trustBar`, add 3 items: "500+ dyrektorów i właścicieli", "Zgodne z przepisami", "Dostęp w kilka sekund"
- [ ] For `stats`, add 4 items: ("500+", "dyrektorów i właścicieli"), ("50+", "dostępnych ebooków"), ("30", "dni dostępu po zakupie"), ("100%", "zgodność z przepisami")
- [ ] For `howItWorksSteps`, add 3 steps matching the fallback values in Task 6
- [ ] For `whyUsCards`, add 6 cards matching the fallback values in Task 6
- [ ] Click **Save**
- [ ] Verify the homepage at http://localhost:3000 still looks correct

---

## Notes

- The `revalidate: 60` default in `strapiRequest` means homepage changes take up to 60 seconds to appear. This is fine for editorial content.
- Icons are determined by array position (index), not stored in Strapi — this was a deliberate decision to keep the schema simple.
- Fallbacks in `h` object ensure the page works even when Strapi is unreachable (important for Railway cold starts).
- Strapi's `Public` role needs `find` permission for `homepage` — check Settings → Roles → Public → Homepage → enable `find`.
