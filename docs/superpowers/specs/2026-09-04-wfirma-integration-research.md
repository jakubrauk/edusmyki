# Research: integracja z wFirma (fakturowanie)

**Data:** 2026-09-04
**Status:** Research — nie wyceniono, nie zaplanowano implementacji
**Powiązane:** wzmiankowane jako "poza zakresem" w `2026-09-04-rebranding-firmowe-design.md` (§3)

---

## 1. Kontekst i motywacja

edusmyki.pl to sklep z materiałami PDF (ebooki, procedury, scenariusze) dla żłobków/przedszkoli,
sprzedaż B2C, płatności przez Stripe. W kodzie (`types/index.ts`) istnieje `InvoiceData` —
to tylko formularz danych klienta do faktury (imię/nazwisko, NIP, adres), **nie ma** mechanizmu
generowania/wysyłki faktur sprzedawcy. Obecnie brak zautomatyzowanego fakturowania — potencjalna
integracja z wFirma jako zewnętrznym systemem księgowym.

---

## 2. Czy w ogóle trzeba wystawiać faktury?

- Sprzedaż B2C (konsument, nie firma) domyślnie dokumentuje się **paragonem fiskalnym**, nie
  fakturą — obowiązek faktury B2C powstaje dopiero na **żądanie klienta**, zgłoszone do 3 miesięcy
  od końca miesiąca sprzedaży.
- Sprzedaż produktów cyfrowych (PDF) opłacanych elektronicznie (Stripe: karta/BLIK) może
  korzystać ze **zwolnienia z kasy fiskalnej** (poz. 37 załącznika do rozporządzenia MF) — warunek:
  zapłata w całości za pośrednictwem banku/operatora płatności, z ewidencji jednoznacznie wynika,
  jakiej czynności zapłata dotyczyła i na czyją rzecz. To wymaga potwierdzenia z księgową/doradcą
  podatkowym pod kątem konkretnej sytuacji Edusmyki (JDG, prawdopodobnie zwolnienie podmiotowe
  z VAT — brak wpisu na białej liście MF, patrz `2026-09-04-rebranding-firmowe-design.md`).
- **Wniosek:** zanim planować integrację API, warto ustalić z klientem/księgową, czy faktury są
  w ogóle prawnie wymagane w obecnym wolumenie sprzedaży, czy to "nice to have" dla klientów,
  którzy o to proszą (np. żłobki/przedszkola kupujące na fakturę dla urzędu).

---

## 3. KSeF — obowiązkowe fakturowanie ustrukturyzowane

Krajowy System e-Faktur (KSeF) staje się obowiązkowy dla faktur B2B/B2C-na-żądanie:

- **1 lutego 2026** — duże firmy (sprzedaż >200 mln zł w 2024)
- **1 kwietnia 2026** — pozostali przedsiębiorcy
- **Mikroprzedsiębiorcy** — zwolnienie do końca 2026 r., pod warunkiem że miesięczna sprzedaż
  udokumentowana fakturami nie przekracza **10 000 zł brutto**
- Okres przejściowy 1 lutego – 31 grudnia 2026: brak sankcji za naruszenia obowiązku KSeF

Edusmyki (mały JDG, sprzedaż PDF-ów) najpewniej mieści się w progu mikroprzedsiębiorcy i ma czas
do końca 2026 — ale warto to zweryfikować liczbowo (miesięczna wartość faktur, nie całej sprzedaży
— tylko ta udokumentowana fakturami, bo większość to paragony/brak faktury).

wFirma **obsługuje KSeF w każdym pakiecie bez dopłat** i automatycznie wysyła faktury do KSeF po
utworzeniu przez API (kolejkowanie: co 10 min przy <5 fakturach w kolejce, co 5 min przy ≥5).
Numer referencyjny KSeF pobiera się przez `/invoices/get/{id}` lub webhook.

**Ważny szczegół integracyjny:** autoryzacja KSeF jest przypięta do konkretnego użytkownika, który
wygenerował klucz API — ten użytkownik musi mieć osobno aktywowany dostęp do modułu KSeF
(zalogować się, PRZYCHODY » KSEF I INTEGRACJE, dokończyć autoryzację certyfikatem/tokenem).
Sam fakt włączenia KSeF przez administratora konta nie wystarczy dla użytkownika API — częsty
błąd integracji (faktura nie tworzy się, błąd autoryzacji).

---

## 4. API wFirma — jak to działa

- **Dokumentacja:** https://doc.wfirma.pl (pełne API), przegląd ogólny:
  https://pomoc.wfirma.pl/-api-interfejs-dla-programistow
- **Baza URL:** `https://api2.wfirma.pl/{modul}/{akcja}` np. `https://api2.wfirma.pl/invoices/add`,
  `https://api2.wfirma.pl/invoices/find`
- **Format:** XML domyślnie, JSON opcjonalnie przez parametry `inputFormat=json&outputFormat=json`
  w URL (uwaga: przy JSON gałąź `parameters` trzeba numerować kluczami — typowy problem opisany
  na forum wFirma przy `invoices/download` i `invoices/find`)
- **Autoryzacja:**
  - **API Key (zalecane, obecny standard)** — trójka: `accessKey` + `secretKey` + `appKeyId`
    (+ opcjonalnie `companyId` przy koncie z wieloma firmami). Generowane w panelu wFirma po
    zaakceptowaniu "Regulaminu API".
  - **OAuth 2.0** — alternatywa/dodatek do API Key, do skonfigurowania w
    Ustawienia → Bezpieczeństwo → Aplikacje OAuth 2.0 (client_id, client_secret, redirect_uri).
  - **Basic Auth (login/hasło)** — **wycofane 30.06.2023**, nie używać.
- **Limity:** do 1000 dokumentów/miesiąc w API za darmo; powyżej — indywidualne ustalenia
  (kontakt z wFirma). Dodatki e-commerce ("Allegro", "Manager e-commerce") podnoszą limit.
- **Fakturowanie:**
  - `invoices/add` — tworzenie faktury; nowa opcja **faktur roboczych (draft)** przez parametr
    typu `normal_draft` / `bill_draft` / `margin_draft` — przydatne, jeśli chcemy wystawiać
    "wersję roboczą" do wglądu przed publikacją/wysyłką do KSeF
  - Dane wymagane: kontrahent (nazwa, NIP, adres — lub `contractor_id` jeśli już istnieje w bazie
    wFirma), sposób płatności, pozycje faktury (z magazynu przez ID towaru albo custom: opis,
    ilość, cena, stawka VAT)
  - `invoices/find`, `invoices/get/{id}`, edycja/usuwanie — pełne CRUD po fakturach
- **Webhooki:** Ustawienia → Inne → Webhooks → "Faktury KSeF » Zmiana statusu przetwarzania" —
  pozwala odbierać zwrotnie status wysyłki do KSeF bez pollowania

---

## 4a. Wysyłka PDF faktury — hook po potwierdzonej płatności

**Punkt zaczepienia w kodzie:** `apps/web/app/api/webhooks/stripe/route.ts` — istniejący handler
`payment_intent.succeeded` już dziś robi: `updateOrderStatus(order.documentId, "paid")` →
`generateDownloadTokensForOrder(order)` → `sendOrderConfirmationEmail(order, tokens)` (linie 43–47).
Integracja z wFirma (wystawienie faktury + wysyłka PDF) dopina się w tym samym miejscu, jako kolejny
krok po `updateOrderStatus`, tuż obok/wewnątrz istniejącej logiki maila — **nie potrzeba** osobnego
webhooka ani osobnego triggera "po stronie Strapi", bo ten route już jest jedynym miejscem, gdzie
wiemy na pewno, że płatność przeszła.

**a) Pobranie faktury jako PDF:**
- `GET /invoices/download/{id}` — pobranie PDF przez API (z autoryzacją kluczami)
- Alternatywnie: bezpośredni link `https://wfirma.pl/invoice_externals/download/{id}/{hash}` —
  `hash` pobiera się z odpowiedzi `/invoices/get/{id}`. Link działa **bez autoryzacji** (hash pełni
  rolę tokena) — wygodny do wysyłki jako link w mailu, ale **nie wolno** go logować/udostępniać
  publicznie, bo daje dostęp do dokumentu każdemu kto go ma.

**b) Wysyłka faktury mailem — dwie opcje:**
1. **Wbudowana wysyłka wFirma** — parametr `auto_send=1` na `invoices/add`/`invoices/edit`,
   opcjonalnie `email_to=email1,email2,...` (do 5 adresów). Wymaga włączonej opcji
   "Udostępniaj faktury" w Ustawienia → Faktury → Wysyłka mailem. **Znany problem z forum wFirma:**
   `auto_send` nie działa, jeśli kontrahent podany inline (dane wpisane ręcznie w żądaniu) zamiast
   przez `contractor_id` z uzupełnionym mailem w bazie — trzeba więc albo najpierw
   `contractors/add`, albo dopilnować że `contractor_id` wskazuje rekord z mailem.
2. **Własna wysyłka przez Resend** (rekomendowane) — pobrać PDF przez `/invoices/download/{id}`,
   załączyć do własnego maila wysyłanego istniejącym mechanizmem (`apps/web/lib/email.ts`, tak jak
   dziś link do pobrania PDF-a produktu). Spójne z resztą brandingu (stopka, temat maila po polsku
   dopasowany do reszty komunikacji), omija ograniczenia `auto_send` opisane wyżej. **Rekomendacja.**

**c) Rejestrowanie płatności w wFirma — poza zakresem.** Osobny moduł "Płatności"
(https://pomoc.wfirma.pl/-platnosci) pozwala oznaczyć fakturę jako "rozliczoną" w księgowości.
**Ustalone z klientem: nie potrzebne** — pomijamy, faktura wystawiona przez API zostaje bez
rekordu płatności po stronie wFirma, rozliczenie robi księgowa ręcznie jeśli będzie trzeba.

**d) Zastrzeżenie: faktury robocze (draft) wymagają ręcznej akceptacji.** Nowa funkcja (od marca
2026) — faktura dodana przez API jako `normal_draft` czeka w wFirma na **ręczne zatwierdzenie przez
księgową/administratora** w panelu, i dopiero po zatwierdzeniu idzie do KSeF. Jeśli celem jest pełna
automatyzacja (klient dostaje PDF od razu po zakupie, bez czekania na kogoś), **trzeba wystawiać
fakturę od razu jako `normal`** (nie draft) — wtedy nie ma checkpointu do ręcznej weryfikacji przed
wysyłką do klienta i KSeF. To decyzja biznesowa: automatyzacja od razu vs. bufor na kontrolę przed
wysyłką — do ustalenia z klientem/księgową.

---

## 5. Gotowe integracje / pluginy

wFirma ma oficjalne/community wtyczki dla popularnych platform e-commerce — **żadna nie pasuje
bezpośrednio do naszego stacku** (Next.js + Strapi to custom, nie WooCommerce/Shoper/PrestaShop):

- WooCommerce — wtyczka WP Desk (https://www.wpdesk.pl/docs/wfirma-woocommerce-docs/)
- Shoper — integracja natywna w panelu Shoper
- AtomStore — integracja natywna
- Apilo — hub integracyjny (Allegro, Shoper, Amazon, eBay) z wpięciem do wFirma

**Wniosek:** dla edusmyki.pl integracja musiałaby być **własna, po REST API**, wołana np. z Strapi
lifecycle hooka na `order` (po opłaceniu zamówienia) albo z Next.js API route obsługującego webhook
Stripe — analogicznie do obecnego flow (`apps/web/lib/stripe.ts` → webhook → Strapi order).

## 6. Biblioteki / SDK

Brak dobrze utrzymanej biblioteki dla naszego stacku (Node/TypeScript):

- `dbojdo/wFirma` (PHP) — najbardziej rozbudowane, ale PHP, nie nadaje się bezpośrednio
- `python-wfirma` (PyPI) — Python
- `wfirma-api-wrapper` (npm) — Node.js, **porzucony** (ostatni release ~5 lat temu, wersja 0.0.6)
- `zmilonas/wfirma-php-api` — PHP, prosty klient

**Wniosek:** przy implementacji w Node/TS realistycznie pisać cienki własny klient REST (fetch +
podpisywanie żądań kluczami API) zamiast polegać na istniejącym pakiecie — API jest proste
(REST + XML/JSON), nie uzasadnia dużej zależności.

---

## 7. Cennik wFirma (orientacyjny, 2026)

System modułowy — płaci się za używane moduły:

| Moduł | Cena/mies. | Zawiera |
|---|---|---|
| Fakturowanie + CRM | 19 zł | Faktury bez limitu, 9 języków, KSeF, baza kontrahentów, CRM |
| Księgowość online | 49 zł | KPiR/ryczałt, OCR, JPK_V7, PIT-36/36L, ZUS |
| Kadry i płace | 49 zł | Umowy, listy płac, ZUS DRA, PIT-11 |
| Magazyn | 30 zł | WZ, PZ, MM, FIFO/FEFO, kody EAN |
| Pełna księgowość | 99 zł | Księga główna, CIT, bilans |

Dla samego fakturowania z API (nasz przypadek — nie potrzeba magazynu/kadr) wystarczy najtańszy
moduł **Fakturowanie + CRM, 19 zł/mies.** — do zweryfikowania czy ten pakiet w ogóle ma dostęp do
API (część funkcji API bywa ograniczana per pakiet, nie potwierdzone w źródłach). KSeF wliczony
w każdy pakiet bez dopłat.

Źródło cen: agregatory branżowe (ksef-dla.pl, kalkulatorksiegowosci.pl) — **do potwierdzenia na
oficjalnym** https://wfirma.pl/cennik przed decyzją, ceny mogły się zmienić.

---

## 8. Otwarte pytania (do ustalenia przed wyceną)

1. Czy klient (właścicielka) **w ogóle chce/potrzebuje** automatycznego fakturowania, czy
   wystarczy ręczne wystawianie faktur na żądanie w samym panelu wFirma (bez integracji API)?
2. Czy obecny wolumen sprzedaży faktur mieści się w progu mikroprzedsiębiorcy KSeF
   (10 000 zł brutto/mies. **udokumentowane fakturami**, nie cała sprzedaż)?
3. Czy Edusmyki jest podatnikiem VAT czynnym czy zwolnionym? (wpływa na treść faktur, stawki)
4. Czy klientki/klienci (żłobki, przedszkola) faktycznie proszą o faktury, czy to wyłącznie
   sprzedaż detaliczna bez potrzeby dokumentu?
5. Czy klient ma już konto wFirma / używa go do księgowości, czy trzeba zakładać od zera?
6. Faktura wystawiana od razu jako `normal` (pełna automatyzacja, PDF do klienta natychmiast po
   zakupie) czy jako `normal_draft` (bufor na ręczną weryfikację przez księgową przed wysyłką) —
   patrz §4a punkt d?

---

## 9. Możliwy kierunek implementacji (szkic)

Jeśli po odpowiedzi na powyższe integracja ma sens:

1. Konto wFirma (moduł Fakturowanie + CRM), wygenerowanie kluczy API (`accessKey`/`secretKey`/
   `appKeyId`), autoryzacja KSeF dla użytkownika API
2. Cienki klient REST w `apps/web/lib/wfirma.ts` (analogicznie do `stripe.ts`) — funkcja
   `createInvoice(order)` wołająca `invoices/add`
3. Hook w `apps/web/app/api/webhooks/stripe/route.ts`, zaraz po `updateOrderStatus(order.documentId,
   "paid")` (linia 43) — wywołanie `createInvoice(order)`, opcjonalnie tylko gdy klient poda dane
   do faktury (`InvoiceData`) — patrz §4a
4. Zapis numeru faktury / statusu KSeF z powrotem do rekordu `order` w Strapi (webhook lub
   polling `invoices/get/{id}`)
5. Rozważyć faktury robocze (`normal_draft`) jeśli potrzebna weryfikacja przed wysyłką do KSeF
   (patrz §4a punkt d — draft wymaga ręcznej akceptacji, nie da się w pełni zautomatyzować)
6. Pobranie PDF (`invoices/download/{id}`) i wysyłka własnym mailem przez Resend
   (`apps/web/lib/email.ts`), w tym samym miejscu co dzisiejszy `sendOrderConfirmationEmail`
   — patrz §4a punkt b, rekomendacja: nie polegać na wbudowanym `auto_send` wFirma

Rejestracja płatności w wFirma (moduł "Płatności") — **ustalone jako niepotrzebne**, poza zakresem
(patrz §4a punkt c).

---

## 10. Orientacyjna wycena (dev + Claude)

Założenie: otwarte pytania z §8 rozwiązane (klient chce integracji, konto wFirma założone,
status VAT znany). Jeden developer, kod + integracja, bez ustaleń prawnych/księgowych i bez
UI do wyświetlania faktury klientowi w koncie. Stawka: **200 zł/h**.

| Etap | Godziny | Koszt |
|---|---|---|
| Setup konta wFirma, klucze API, autoryzacja KSeF dla usera API (głównie panel, nie kod) | 1–2h | 200–400 zł |
| Klient REST `lib/wfirma.ts` (auth, `invoices/add`, error handling) | 3–4h | 600–800 zł |
| Hook w `webhooks/stripe/route.ts` po `updateOrderStatus` (rozszerzenie istniejącego handlera) | 1–2h | 200–400 zł |
| Pobranie PDF faktury + wysyłka mailem przez Resend (§4a-b) | 2–3h | 400–600 zł |
| Zapis numeru faktury/statusu KSeF z powrotem do `order` (webhook lub polling) | 2–3h | 400–600 zł |
| Testy end-to-end (środowisko testowe wFirma, brak NIP, zwolnienie VAT, draft vs live) | 2–3h | 400–600 zł |
| Bufor na niespodzianki API (XML/JSON quirki, błędy autoryzacji KSeF, `auto_send` bugi — §3, §4, §4a) | 2–3h | 400–600 zł |
| **Razem** | **~13–19h** | **~2600–3800 zł** |

Widełki szerokie — REST API samo w sobie proste, ale autoryzacja KSeF i quirki XML/JSON
(widoczne w zgłoszeniach na forum wFirma, patrz §4) to typowe miejsce na niespodziewane dłubanie.

---

## Źródła

- https://doc.wfirma.pl — pełna dokumentacja API
- https://pomoc.wfirma.pl/-api-interfejs-dla-programistow — przegląd API, limity, webhooki
- https://pomoc.wfirma.pl/-integracje-ze-sklepami-internetowymi
- https://pomoc.wfirma.pl/-integracja-z-ksef
- https://github.com/dbojdo/wFirma — SDK PHP (ApiKeysAuth, struktura żądań)
- https://www.wpdesk.pl/docs/wfirma-woocommerce-docs/
- https://forum.wfirma.pl/temat/6211-api-pobieranie-faktur — `invoices/download`, hash-link
- https://forum.wfirma.pl/temat/6276-api-json-wysylka-faktury-na-wskazany-adres-email-opcja-auto_send
  — `auto_send`, `email_to`, problem z kontrahentem inline
- https://forum.wfirma.pl/temat/4005-api-auto_send
- https://pomoc.wfirma.pl/-platnosci — moduł Płatności
- https://pomoc.wfirma.pl/-wprowadzanie-informacji-o-otrzymanej-platnosci
- https://forum.wfirma.pl/temat/3969-dodawanie-faktur-api — faktury robocze, akceptacja przez
  księgową przed KSeF
- https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/podstawy-prawne-oraz-kluczowe-terminy/
  — terminy KSeF
- https://ksef-dla.pl/program/wfirma-cennik-2026/ — cennik (agregator, do weryfikacji na wfirma.pl)
- https://poradnikprzedsiebiorcy.pl/-dokumentowanie-sprzedazy-internetowej-faktura-czy-paragon
- https://poradnikprzedsiebiorcy.pl/-faktura-do-paragonu-dla-osoby-prywatnej
