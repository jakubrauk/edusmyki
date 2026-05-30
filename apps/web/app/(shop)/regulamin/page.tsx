import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin",
  description: "Regulamin sklepu internetowego edusmyki.pl",
};

export default function RegulaminPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "#F5A623" }}>Regulamin sklepu</h1>
      <p className="text-sm text-gray-500 mb-10">Obowiązuje od 1 czerwca 2025 r.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§1. Postanowienia ogólne</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Sklep internetowy edusmyki.pl (dalej: „Sklep") prowadzi sprzedaż materiałów edukacyjnych w formie plików cyfrowych (PDF).</li>
          <li>Właścicielem Sklepu jest osoba fizyczna prowadząca działalność pod adresem e-mail: smyk1977@wp.pl.</li>
          <li>Klientem może być pełnoletnia osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej.</li>
          <li>Kontakt ze Sklepem odbywa się wyłącznie drogą elektroniczną: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§2. Produkty</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Produkty oferowane w Sklepie to materiały edukacyjne: procedury, regulaminy, scenariusze zajęć i inne pomoce dydaktyczne dla żłobków i przedszkoli, dostępne w formacie PDF.</li>
          <li>Pliki przeznaczone są do użytku własnego w placówce edukacyjnej. Zabrania się dalszej odsprzedaży lub udostępniania plików osobom trzecim.</li>
          <li>Ceny podane przy produktach są cenami brutto w złotych polskich (PLN) i zawierają podatek VAT.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§3. Składanie zamówień</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Zamówienie składa się przez dodanie produktów do koszyka i wypełnienie formularza zamówienia.</li>
          <li>Podanie adresu e-mail jest obowiązkowe — na ten adres wysyłane są linki do pobrania plików.</li>
          <li>Zamówienie jest wiążące z chwilą dokonania płatności.</li>
          <li>Po zaksięgowaniu płatności Klient otrzymuje wiadomość e-mail z linkami do pobrania zakupionych plików.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§4. Płatności</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Płatności obsługuje serwis Przelewy24 (DialCom24 Sp. z o.o.). Dostępne metody: BLIK, karta płatnicza, przelew bankowy.</li>
          <li>Płatność musi zostać zrealizowana niezwłocznie po złożeniu zamówienia. Nieopłacone zamówienia są anulowane automatycznie.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§5. Dostęp do plików</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Linki do pobrania plików są ważne przez 30 dni od daty zakupu.</li>
          <li>Każdy plik można pobrać maksymalnie 5 razy. W razie problemów technicznych prosimy o kontakt.</li>
          <li>Pliki nie wygasają merytorycznie — po pobraniu Klient może korzystać z nich bezterminowo.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§6. Prawo odstąpienia od umowy</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta, prawo odstąpienia od umowy <strong>nie przysługuje</strong> w odniesieniu do umów o dostarczanie treści cyfrowych niedostarczanych na nośniku materialnym, jeżeli spełnianie świadczenia rozpoczęło się za wyraźną zgodą konsumenta i po przyjęciu do wiadomości, że utraci prawo odstąpienia od umowy.</li>
          <li>Składając zamówienie, Klient wyraża zgodę na natychmiastowe dostarczenie treści cyfrowej i przyjmuje do wiadomości utratę prawa odstąpienia od umowy.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§7. Reklamacje</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Reklamacje dotyczące zamówień należy zgłaszać na adres: <a href="mailto:smyk1977@wp.pl" className="text-[#4BBFCA] underline">smyk1977@wp.pl</a>.</li>
          <li>Reklamacja powinna zawierać: numer zamówienia, adres e-mail użyty podczas zakupu oraz opis problemu.</li>
          <li>Reklamacje rozpatrujemy w terminie 14 dni roboczych od daty otrzymania.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§8. Ochrona danych osobowych</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Zasady przetwarzania danych osobowych opisuje <a href="/polityka-prywatnosci" className="text-[#4BBFCA] underline">Polityka prywatności</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">§9. Postanowienia końcowe</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy Kodeksu cywilnego oraz ustawy o prawach konsumenta.</li>
          <li>Sklep zastrzega sobie prawo do zmiany Regulaminu. Zmiana nie dotyczy zamówień złożonych przed datą zmiany.</li>
          <li>Sądem właściwym do rozstrzygania sporów jest sąd właściwy dla siedziby Sprzedawcy, o ile przepisy prawa nie stanowią inaczej.</li>
        </ol>
      </section>
    </div>
  );
}
