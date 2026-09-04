# Dopasowanie strony do zarejestrowanej firmy (Edusmyki Małgorzata Smyk)

**Data:** 2026-09-04
**Branch:** feature/company-alignment
**Status:** Do akceptacji

---

## 1. Cel

Strona edusmyki.pl działała dotychczas bez formalnej identyfikacji sprzedawcy (regulamin/polityka
wskazywały tylko prywatny adres e-mail `smyk1977@wp.pl`, bez nazwy firmy, adresu czy NIP-u).
Firma została zarejestrowana w Polsce jako JDG, dostała nową skrzynkę firmową
`kontakt@edusmyki.pl`. Zadanie: dopasować treści strony do faktycznego podmiotu prawnego i
zaktualizować dane kontaktowe.

**Dane firmy (potwierdzone przez klienta):**
- Nazwa (CEIDG): **Edusmyki Małgorzata Smyk**
- Forma prawna: jednoosobowa działalność gospodarcza (JDG)
- NIP: **8981546948**
- Adres siedziby: **ul. Wrocławska 29 lok. 7, 57-160 Borów, woj. dolnośląskie**
- Nowy e-mail kontaktowy: **kontakt@edusmyki.pl**

Weryfikacja w publicznych rejestrach (biała lista MF, wyszukiwarki firm) nie zwróciła wyniku —
prawdopodobnie podmiot zwolniony z VAT (brak wpisu na białej liście). Dane przyjęte na podstawie
oświadczenia klienta.

---

## 2. Zakres zmian

### 2.1. Wymiana adresu e-mail

Stary prywatny adres `smyk1977@wp.pl` zastąpiony przez `kontakt@edusmyki.pl` we wszystkich
miejscach kontaktowych/reklamacyjnych — potwierdzone, `kontakt@edusmyki.pl` obsługuje też
zgłoszenia reklamacyjne. Adres wysyłkowy transakcyjny `zamowienia@edusmyki.pl`
(`EMAIL_FROM` w Resend, `apps/web/lib/email.ts`) **zostaje bez zmian** — jest już poprawny i
zgodny z domeną. Skrzynka `kontakt@edusmyki.pl` jest już skonfigurowana i odbiera pocztę
(patrz `docs/email-setup.md`).

Pliki do zmiany:
- `apps/web/components/layout/Footer.tsx` — link mailto w sekcji "Informacje"
- `apps/web/app/(shop)/checkout/blad/page.tsx` — link mailto na stronie błędu płatności
- `apps/web/lib/email.ts` — linia "Problemy z pobieraniem? Napisz do nas: smyk1977@wp.pl"
- `apps/web/app/(shop)/polityka-prywatnosci/page.tsx` — wszystkie odniesienia do maila (§1, §6)

`apps/web/app/(shop)/regulamin/page.tsx` nie wymaga ręcznej edycji maila — cała treść zostanie
zastąpiona embedem PDF (patrz 2.2).

### 2.2. Strona `/regulamin` — zamiana na PDF dostarczony przez klienta

Klient dostarczy gotowy regulamin w formacie PDF. Zamiast obecnej treści JSX (§1–§9 wpisanych na
sztywno w komponencie), strona `/regulamin` ma renderować dostarczony plik:

- Plik trafia do `apps/web/public/regulamin.pdf`
- Komponent `RegulaminPage` renderuje `<iframe src="/regulamin.pdf">` na pełną wysokość widoku
  (przeglądarki desktopowe pokazują natywny podgląd PDF)
- Fallback pod iframe: link `<a href="/regulamin.pdf" download>Pobierz regulamin (PDF)</a>` —
  potrzebny, bo część przeglądarek mobilnych nie renderuje PDF w iframe
- Metadata (`title: "Regulamin"`, `description`) zostaje bez zmian
- Cała obecna treść tekstowa (§1–§9) zostaje usunięta z kodu — źródłem prawdy jest odtąd PDF
  klienta, nie kod strony

Blokuje na: dostarczenie pliku PDF przez klienta.

### 2.3. Strona `/polityka-prywatnosci` — aktualizacja danych administratora

§1 "Administrator danych" zmienia się z generycznego "właściciel serwisu" na pełną identyfikację:

> Administratorem danych osobowych Klientów sklepu edusmyki.pl jest Edusmyki Małgorzata Smyk,
> NIP 8981546948, ul. Wrocławska 29 lok. 7, 57-160 Borów. Kontakt w sprawach dotyczących danych
> osobowych: kontakt@edusmyki.pl.

Reszta dokumentu (§2–§8: zakres danych, podstawy przetwarzania, odbiorcy danych — Przelewy24,
Resend, Railway, Cloudflare, okresy przechowywania, prawa użytkownika, cookies, zmiany polityki)
**zostaje bez zmian treściowych** — infrastruktura techniczna się nie zmieniła, zmienia się tylko
tożsamość administratora i adres kontaktowy.

REGON pominięty — dla JDG NIP wystarcza w standardowych klauzulach, potwierdzone przez klienta.

Data "Obowiązuje od" — do ustalenia, czy aktualizujemy na dzień publikacji zmiany czy zostawiamy
historyczną datę (patrz Otwarte pytania).

### 2.4. Stopka (`Footer.tsx`) — dopisanie danych firmy

Pod obecną linią copyrightu dodajemy linię z identyfikacją firmy:

> Edusmyki Małgorzata Smyk, NIP 8981546948
> © {rok} edusmyki.pl. Wszelkie prawa zastrzeżone.

Plus wymiana maila w sekcji "Informacje" (patrz 2.1).

---

## 3. Poza zakresem

- Zmiana marki/nazwy widocznej publicznie (`edusmyki.pl`, logo, kolory) — nazwa firmy
  "Edusmyki Małgorzata Smyk" pokrywa się z marką, nie ma potrzeby rebrandingu wizualnego.
- Konfiguracja skrzynki `kontakt@edusmyki.pl` (DNS, MX, Zoho/Cloudflare) — opisana osobno w
  `docs/email-setup.md`. Status: **skonfigurowana**, skrzynka już odbiera pocztę.
- Treść merytoryczna regulaminu — dostarcza klient, nie tworzymy jej w tym zadaniu.
- Dane do faktur VAT / integracja fakturowania — nie zidentyfikowano istniejącego mechanizmu
  wystawiania faktur w kodzie (`InvoiceData` w `types/index.ts` to tylko formularz danych klienta
  do faktury, nie generator faktur sprzedawcy) — poza zakresem tego zadania. Możliwa przyszła
  integracja z wFirma — osobny temat do wyceny w kolejnym zadaniu, nie część tej specyfikacji.

---

## 4. Otwarte pytania

1. Data "Obowiązuje od" w regulaminie (ustala klient razem z treścią PDF) i w polityce
   prywatności (proponowana: data wdrożenia tej zmiany) — do potwierdzenia przed wdrożeniem.

---

## 5. Testowanie

- Wizualna weryfikacja `/polityka-prywatnosci` po zmianie (dane administratora, mail)
- Wizualna weryfikacja `/regulamin` — iframe renderuje PDF, link pobierania działa, wygląda
  sensownie na mobile (fallback)
- Sprawdzenie wszystkich `mailto:` linków na stronie (Footer, checkout/blad) wskazują
  `kontakt@edusmyki.pl`
- `grep -rn "smyk1977@wp.pl"` w `apps/web` zwraca 0 wyników po zmianach
