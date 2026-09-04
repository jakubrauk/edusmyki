# Rebranding firmowe (dane firmy Edusmyki Małgorzata Smyk) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-09-04-rebranding-firmowe-design.md` (Status: Zaakceptowany)

**Goal:** Zastąpić prywatny adres e-mail `smyk1977@wp.pl` firmowym `kontakt@edusmyki.pl` we wszystkich
miejscach kontaktowych, zamienić treść strony `/regulamin` na embed dostarczonego przez klienta PDF-a,
zaktualizować dane administratora danych w `/polityka-prywatnosci`, oraz dopisać dane firmy
(Edusmyki Małgorzata Smyk, NIP 8981546948) w stopce.

**Architecture:** Wyłącznie zmiany treści w istniejących komponentach/stronach Next.js App Router
(`apps/web`). Brak zmian schematu danych, brak nowych zależności, brak zmian w Strapi. Jedna nowa
statyczna zawartość: `apps/web/public/regulamin.pdf` (już obecny w repo jako plik untracked,
dostarczony przez klienta — do zacommitowania w ramach tego planu).

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind v4

## Global Constraints

- Cały tekst UI po polsku
- Nie zmieniamy `EMAIL_FROM` / `FROM` (`zamowienia@edusmyki.pl`) w `apps/web/lib/email.ts` — to
  osobny, poprawny adres transakcyjny, poza zakresem tego zadania
- Nowy adres kontaktowy/reklamacyjny wszędzie indziej: `kontakt@edusmyki.pl`
- Dane firmy: **Edusmyki Małgorzata Smyk**, NIP **8981546948**, ul. Wrocławska 29 lok. 7,
  57-160 Borów
- TypeScript strict mode — weryfikuj `cd apps/web && npx tsc --noEmit` po każdym zadaniu
- Nie tworzymy nowych paczek npm
- Kryterium końcowe z sekcji 5 speca: `grep -rn "smyk1977@wp.pl" apps/web` musi zwrócić 0 wyników

---

### Task 1: Footer.tsx — wymiana maila + dane firmy pod copyrightem

**Files:**
- Modify: `apps/web/components/layout/Footer.tsx`

**Interfaces:**
- Brak zmian w propsach/eksportach — `Footer()` pozostaje komponentem bezargumentowym

Obecny stan (fragment sekcji "Informacje", linia ok. 27):
```tsx
<li><a href="mailto:smyk1977@wp.pl" className="hover:text-[#4BBFCA] transition-colors">smyk1977@wp.pl</a></li>
```

Obecny stan (dolny pasek stopki, linie ok. 33-42):
```tsx
<div className="mt-8 border-t pt-8 flex flex-col items-center gap-3 text-sm text-gray-400">
  <a
    href="https://www.facebook.com/profile.php?id=61583415274725"
    ...
  >
    ...
    Obserwuj nas na Facebooku
  </a>
  <span>© {new Date().getFullYear()} edusmyki.pl. Wszelkie prawa zastrzeżone.</span>
</div>
```

- [ ] **Step 1: Wymień mailto w sekcji "Informacje"**

Zamień:
```tsx
<li><a href="mailto:smyk1977@wp.pl" className="hover:text-[#4BBFCA] transition-colors">smyk1977@wp.pl</a></li>
```
na:
```tsx
<li><a href="mailto:kontakt@edusmyki.pl" className="hover:text-[#4BBFCA] transition-colors">kontakt@edusmyki.pl</a></li>
```

- [ ] **Step 2: Dodaj linię z danymi firmy nad linią copyrightu**

Zamień:
```tsx
          <span>© {new Date().getFullYear()} edusmyki.pl. Wszelkie prawa zastrzeżone.</span>
        </div>
```
na:
```tsx
          <span>Edusmyki Małgorzata Smyk, NIP 8981546948</span>
          <span>© {new Date().getFullYear()} edusmyki.pl. Wszelkie prawa zastrzeżone.</span>
        </div>
```

Rodzic (`flex flex-col items-center gap-3`) już centruje i rozdziela elementy pionowo — nowa
linia automatycznie wyląduje nad copyrightem z odstępem `gap-3`, bez dodatkowych klas.

- [ ] **Step 3: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: brak błędów.

- [ ] **Step 4: Wizualna weryfikacja (opcjonalnie w tym kroku, obowiązkowo w Task 6)**

```bash
npm run dev
```

Otwórz dowolną stronę sklepu (np. http://localhost:3000/), przewiń do stopki. Sprawdź:
1. Link e-mail w sekcji "Informacje" pokazuje i wskazuje `kontakt@edusmyki.pl`
2. Pod linią "Obserwuj nas na Facebooku" widoczna jest linia "Edusmyki Małgorzata Smyk, NIP 8981546948"
   nad linią copyrightu

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/layout/Footer.tsx
git commit -m "feat(footer): zamień mail na kontakt@edusmyki.pl i dopisz dane firmy"
```

---

### Task 2: checkout/blad/page.tsx — wymiana maila

**Files:**
- Modify: `apps/web/app/(shop)/checkout/blad/page.tsx`

Obecny stan (linia 26):
```tsx
<a href="mailto:smyk1977@wp.pl">Skontaktuj się z nami</a>
```

- [ ] **Step 1: Wymień mailto**

Zamień:
```tsx
<a href="mailto:smyk1977@wp.pl">Skontaktuj się z nami</a>
```
na:
```tsx
<a href="mailto:kontakt@edusmyki.pl">Skontaktuj się z nami</a>
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(shop)/checkout/blad/page.tsx"
git commit -m "feat(checkout): zamień mail kontaktowy na stronie błędu płatności"
```

---

### Task 3: lib/email.ts — wymiana maila w treści wiadomości transakcyjnej

**Files:**
- Modify: `apps/web/lib/email.ts`

**Uwaga:** `const FROM = process.env.EMAIL_FROM || "zamowienia@edusmyki.pl";` (linia 5) **NIE
zmienia się** — to poprawny, zgodny z domeną adres nadawcy transakcyjnego. Zmienia się wyłącznie
tekstowa wzmianka maila kontaktowego w stopce wiadomości e-mail z potwierdzeniem zamówienia.

Obecny stan (w `buildOrderEmailHtml`, linia ok. 74):
```tsx
      <p style="color:#6b7280;font-size:12px;">
        Problemy z pobieraniem? Napisz do nas: smyk1977@wp.pl
      </p>
```

- [ ] **Step 1: Wymień adres w treści maila**

Zamień:
```tsx
        Problemy z pobieraniem? Napisz do nas: smyk1977@wp.pl
```
na:
```tsx
        Problemy z pobieraniem? Napisz do nas: kontakt@edusmyki.pl
```

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: brak błędów.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/email.ts
git commit -m "feat(email): zamień mail kontaktowy w treści potwierdzenia zamówienia"
```

---

### Task 4: polityka-prywatnosci/page.tsx — dane administratora, mail, data

**Files:**
- Modify: `apps/web/app/(shop)/polityka-prywatnosci/page.tsx`

**Interfaces:** brak zmian w `metadata` (title/description zostają bez zmian, zgodnie ze specem
2.3)

Ten plik wymaga trzech niezależnych edycji w tym samym pliku: daty, treści §1, i dwóch mailto
w §1 i §6.

Obecny stan (linia 13, data):
```tsx
<p className="text-sm text-gray-500 mb-10">Obowiązuje od 1 czerwca 2025 r.</p>
```

Obecny stan (§1, linie 16-20):
```tsx
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§1. Administrator danych</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Administratorem danych osobowych Klientów sklepu edusmyki.pl jest właściciel serwisu. Kontakt w sprawach dotyczących danych osobowych: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>.
        </p>
      </section>
```

Obecny stan (§6, ostatni akapit, linia ok. 71):
```tsx
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          Wnioski dotyczące praw kieruj na: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>. Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
        </p>
```

- [ ] **Step 1: Zaktualizuj datę "Obowiązuje od"**

Zamień:
```tsx
<p className="text-sm text-gray-500 mb-10">Obowiązuje od 1 czerwca 2025 r.</p>
```
na (dzień wdrożenia zmiany — zgodnie z sekcją 4 speca, użyj dzisiejszej daty w momencie
implementacji; poniższa wartość odpowiada dacie akceptacji speca 2026-09-04, dostosuj jeśli
implementacja odbywa się innego dnia):
```tsx
<p className="text-sm text-gray-500 mb-10">Obowiązuje od 4 września 2026 r.</p>
```

- [ ] **Step 2: Zamień treść §1 "Administrator danych"**

Zamień cały blok:
```tsx
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§1. Administrator danych</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Administratorem danych osobowych Klientów sklepu edusmyki.pl jest właściciel serwisu. Kontakt w sprawach dotyczących danych osobowych: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>.
        </p>
      </section>
```
na:
```tsx
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§1. Administrator danych</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Administratorem danych osobowych Klientów sklepu edusmyki.pl jest Edusmyki Małgorzata Smyk, NIP 8981546948, ul. Wrocławska 29 lok. 7, 57-160 Borów. Kontakt w sprawach dotyczących danych osobowych: <a href="mailto:kontakt@edusmyki.pl" className="text-[#4BBFCA] underline">kontakt@edusmyki.pl</a>.
        </p>
      </section>
```

- [ ] **Step 3: Wymień mailto w §6**

Zamień:
```tsx
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          Wnioski dotyczące praw kieruj na: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>. Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
        </p>
```
na:
```tsx
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          Wnioski dotyczące praw kieruj na: <a href="mailto:kontakt@edusmyki.pl" className="text-[#4BBFCA] underline">kontakt@edusmyki.pl</a>. Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
        </p>
```

**Uwaga:** §2–§8 (poza tym jednym akapitem w §6) zostają bez zmian treściowych — nie edytuj nic
poza wskazanymi trzema blokami (data, §1, mailto w §6). REGON celowo pomijamy (potwierdzone przez
klienta w spec sekcja 2.3).

- [ ] **Step 4: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: brak błędów.

- [ ] **Step 5: Wizualna weryfikacja**

```bash
npm run dev
```

Otwórz http://localhost:3000/polityka-prywatnosci i sprawdź:
1. Data na górze strony to dzień wdrożenia (nie 1 czerwca 2025)
2. §1 zawiera pełną nazwę firmy, NIP, adres i mail `kontakt@edusmyki.pl`
3. Link mailto w §1 i w §6 wskazuje `kontakt@edusmyki.pl`
4. §2–§5, §7, §8 wyglądają identycznie jak przed zmianą (brak przypadkowych edycji)

- [ ] **Step 6: Commit**

```bash
git add "apps/web/app/(shop)/polityka-prywatnosci/page.tsx"
git commit -m "feat(polityka-prywatnosci): zaktualizuj dane administratora, mail i datę wdrożenia"
```

---

### Task 5: regulamin/page.tsx — zamiana treści na embed PDF

**Files:**
- Modify: `apps/web/app/(shop)/regulamin/page.tsx`
- Add (już obecny w working tree jako untracked, tylko `git add`): `apps/web/public/regulamin.pdf`

**Interfaces:**
- `metadata` (`title: "Regulamin"`, `description: "Regulamin sklepu internetowego edusmyki.pl"`)
  zostaje bez zmian
- `RegulaminPage()` pozostaje komponentem bezargumentowym (server component, brak `"use client"`)

Plik PDF dostarczony przez klienta już znajduje się w repo pod `apps/web/public/regulamin.pdf`
(untracked, 163 KB — zweryfikowano `git status`). Nie generuj/nie twórz tego pliku — tylko go
zacommituj razem ze zmianą komponentu.

Obecna zawartość całego pliku (§1–§9, ~95 linii) ma zostać **w całości usunięta** i zastąpiona
embedem iframe + linkiem fallback. Metadata na górze pliku zostaje bez zmian.

- [ ] **Step 1: Zastąp całą zawartość pliku**

Zamień całą zawartość `apps/web/app/(shop)/regulamin/page.tsx` na:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin",
  description: "Regulamin sklepu internetowego edusmyki.pl",
};

export default function RegulaminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: "#F5A623" }}>
        Regulamin sklepu
      </h1>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200" style={{ height: "80vh" }}>
        <iframe
          src="/regulamin.pdf"
          title="Regulamin sklepu edusmyki.pl"
          className="h-full w-full"
        />
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        Jeśli dokument nie wyświetla się poprawnie w przeglądarce,{" "}
        <a href="/regulamin.pdf" download className="text-[#4BBFCA] underline">
          pobierz regulamin (PDF)
        </a>.
      </p>
    </div>
  );
}
```

`title` i `description` w `metadata` są identyczne jak w poprzedniej wersji — nie wymagają zmian
poza pozostawieniem ich bez zmian podczas zamiany reszty pliku.

- [ ] **Step 2: Type-check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: brak błędów.

- [ ] **Step 3: Wizualna weryfikacja — desktop i mobile**

```bash
npm run dev
```

Otwórz http://localhost:3000/regulamin i sprawdź:
1. Desktop: iframe renderuje natywny podgląd PDF (Chrome/Firefox/Safari desktop) na pełną
   wysokość (80vh), z widocznym tytułem "Regulamin sklepu" nad nim
2. Link "pobierz regulamin (PDF)" pod iframe pobiera/otwiera plik poprawnie (kliknij i sprawdź)
3. Zwęź okno przeglądarki do szerokości mobilnej (np. DevTools responsive mode, ~375px) —
   sprawdź czy strona nie łamie się wizualnie i czy link fallback jest widoczny i klikalny
   (część przeglądarek mobilnych nie renderuje PDF w iframe, stąd fallback jest krytyczny)

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(shop)/regulamin/page.tsx" apps/web/public/regulamin.pdf
git commit -m "feat(regulamin): zastąp treść JSX embedem PDF dostarczonym przez klienta"
```

---

### Task 6: Weryfikacja końcowa (kryteria z sekcji 5 speca)

**Files:** brak zmian — tylko weryfikacja

- [ ] **Step 1: Grep na stary adres e-mail**

```bash
grep -rn "smyk1977@wp.pl" apps/web
```

Expected: **0 wyników** (pusty output, exit code 1). Jeśli cokolwiek się pojawi, wróć do
odpowiedniego zadania (1-5) i popraw brakujące miejsce.

- [ ] **Step 2: Sprawdź wszystkie linki mailto wskazują kontakt@edusmyki.pl**

```bash
grep -rn "mailto:" apps/web/components apps/web/app --include="*.tsx"
```

Expected: każdy wynik zawiera `mailto:kontakt@edusmyki.pl` (poza ewentualnymi innymi mailto spoza
zakresu tego zadania — porównaj z listą plików w spec sekcja 2.1: Footer.tsx, checkout/blad,
polityka-prywatnosci — regulamin nie ma już mailto, bo cała treść to teraz iframe).

- [ ] **Step 3: Type-check całej aplikacji**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: brak błędów.

- [ ] **Step 4: Build produkcyjny (opcjonalnie, ale zalecane przed mergem)**

```bash
cd apps/web && npm run build
```

Expected: build kończy się sukcesem, brak błędów związanych ze zmienionymi stronami.

- [ ] **Step 5: Pełna wizualna weryfikacja obu stron (ponowna, całościowa)**

```bash
npm run dev
```

1. http://localhost:3000/polityka-prywatnosci — dane administratora (Edusmyki Małgorzata Smyk,
   NIP 8981546948, adres, kontakt@edusmyki.pl), data wdrożenia, reszta dokumentu niezmieniona
2. http://localhost:3000/regulamin — iframe z PDF-em, fallback link pobierania, wygląda sensownie
   na mobile
3. Stopka na dowolnej stronie — mail `kontakt@edusmyki.pl` + linia z danymi firmy pod
   copyrightem
4. http://localhost:3000/checkout/blad (lub link "Skontaktuj się z nami" z testowego przepływu
   błędu płatności) — mailto wskazuje kontakt@edusmyki.pl

- [ ] **Step 6: Commit (tylko jeśli weryfikacja ujawniła i wymagała poprawek)**

Jeśli wszystkie poprzednie zadania zakończyły się bez poprawek w tym kroku, nie ma nic do
zacommitowania — Task 6 jest czysto weryfikacyjny. Jeśli podczas weryfikacji wprowadzono poprawki,
zacommituj je z opisową wiadomością odnoszącą się do konkretnej poprawki.
