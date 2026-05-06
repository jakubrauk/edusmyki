import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Zamówienie złożone" };

export default function SukcesPage() {
  return (
    <div className="bg-gradient-to-b from-[#EDF9E8] to-white">
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-full text-4xl shadow-lg" style={{ background: "#EDF9E8" }}>
          🎉
        </div>
        <h1 className="mb-4 text-3xl font-bold">Dziękujemy za zakup!</h1>
        <p className="mx-auto mb-4 max-w-md text-gray-600">
          Twoje zamówienie zostało zrealizowane. Za chwilę otrzymasz email z linkami
          do pobrania zakupionych ebooków.
        </p>
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="inline-block rounded-full px-4 py-2 text-sm font-medium" style={{ background: "#EDF9E8", color: "#7BC44C" }}>
            Sprawdź swoją skrzynkę email (również folder SPAM)
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full bg-[#F5A623] text-white hover:bg-[#e09510]">
            <Link href="/konto/ebooki">Moje ebooki</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-2 border-[#4BBFCA] text-[#4BBFCA] hover:bg-[#4BBFCA]/10">
            <Link href="/katalog">Kontynuuj zakupy</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
