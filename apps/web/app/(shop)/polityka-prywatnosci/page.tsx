import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description: "Polityka prywatności i ochrony danych osobowych edusmyki.pl",
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "#F5A623" }}>Polityka prywatności</h1>
      <p className="text-sm text-gray-500 mb-10">Obowiązuje od 1 czerwca 2025 r.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§1. Administrator danych</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Administratorem danych osobowych Klientów sklepu edusmyki.pl jest właściciel serwisu. Kontakt w sprawach dotyczących danych osobowych: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§2. Jakie dane zbieramy</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li><strong>Adres e-mail</strong> — niezbędny do realizacji zamówienia i dostarczenia plików.</li>
          <li><strong>Imię i nazwisko</strong> — podawane dobrowolnie przy składaniu zamówienia.</li>
          <li><strong>Dane do faktury</strong> — jeśli Klient wnioskuje o fakturę (NIP, adres firmy).</li>
          <li><strong>Adres IP</strong> — rejestrowany przy każdym pobraniu pliku w celach bezpieczeństwa.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§3. Cel i podstawa przetwarzania</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li><strong>Realizacja umowy</strong> (art. 6 ust. 1 lit. b RODO) — dostarczenie zamówionych plików, obsługa płatności, wysyłka potwierdzeń zamówień.</li>
          <li><strong>Prawnie uzasadniony interes</strong> (art. 6 ust. 1 lit. f RODO) — zapobieganie nadużyciom, rejestracja pobrań plików.</li>
          <li><strong>Obowiązki prawne</strong> (art. 6 ust. 1 lit. c RODO) — wystawianie faktur, przechowywanie dokumentacji sprzedaży.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§4. Odbiorcy danych</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">Dane osobowe mogą być przekazywane następującym podmiotom:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li><strong>Przelewy24 (DialCom24 Sp. z o.o.)</strong> — operator płatności, przetwarza dane niezbędne do realizacji transakcji.</li>
          <li><strong>Resend Inc.</strong> — dostawca usługi wysyłki e-mail (potwierdzenia zamówień, linki do pobrania).</li>
          <li><strong>Railway Corp.</strong> — hosting serwisu (serwery w UE lub USA z odpowiednimi zabezpieczeniami).</li>
          <li><strong>Cloudflare Inc.</strong> — przechowywanie plików PDF (Cloudflare R2).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§5. Okres przechowywania danych</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Dane zamówień przechowywane są przez 5 lat od końca roku kalendarzowego, w którym dokonano zakupu (wymogi podatkowe).</li>
          <li>Dane związane z pobraniami plików (tokeny) przechowywane są przez 30 dni od zakupu.</li>
          <li>Dane konta (jeśli Klient założył konto) — do czasu usunięcia konta na wniosek Klienta.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§6. Prawa przysługujące użytkownikom</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">Na podstawie RODO przysługują Ci następujące prawa:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li><strong>Prawo dostępu</strong> — możesz zażądać informacji o przetwarzanych danych.</li>
          <li><strong>Prawo do sprostowania</strong> — możesz żądać poprawienia nieprawidłowych danych.</li>
          <li><strong>Prawo do usunięcia</strong> — możesz żądać usunięcia danych, jeśli nie ma podstawy prawnej do ich przechowywania.</li>
          <li><strong>Prawo do ograniczenia przetwarzania</strong> — możesz żądać ograniczenia przetwarzania w określonych przypadkach.</li>
          <li><strong>Prawo do przenoszenia danych</strong> — możesz otrzymać swoje dane w ustrukturyzowanym formacie.</li>
          <li><strong>Prawo do sprzeciwu</strong> — możesz wnieść sprzeciw wobec przetwarzania opartego na prawnie uzasadnionym interesie.</li>
        </ul>
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          Wnioski dotyczące praw kieruj na: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>. Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§7. Pliki cookies</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li><strong>Niezbędne</strong> — sesja użytkownika (zalogowanie), koszyk zakupowy. Wymagane do działania serwisu.</li>
          <li><strong>Analityczne</strong> — Google Analytics 4 (jeśli aktywne) zbiera anonimowe dane o ruchu w serwisie. Możesz je wyłączyć w ustawieniach przeglądarki.</li>
        </ul>
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          Możesz zablokować lub usunąć pliki cookies w ustawieniach swojej przeglądarki.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§8. Zmiany polityki</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Zastrzegamy sobie prawo do zmiany niniejszej polityki. Aktualna wersja dostępna jest zawsze pod adresem <a href="/polityka-prywatnosci" className="text-[#4BBFCA] underline">edusmyki.pl/polityka-prywatnosci</a>. O istotnych zmianach poinformujemy drogą e-mailową.
        </p>
      </section>
    </div>
  );
}
