import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail } from "lucide-react";

export const metadata = { title: "Zamówienie złożone" };

export default function SukcesPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-6 h-20 w-20 text-green-500" />
      <h1 className="mb-4 text-3xl font-bold">Dziękujemy za zakup!</h1>
      <p className="mx-auto mb-4 max-w-md text-gray-600">
        Twoje zamówienie zostało zrealizowane. Za chwilę otrzymasz email z linkami
        do pobrania zakupionych ebooków.
      </p>
      <div className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-500">
        <Mail className="h-4 w-4" />
        <span>Sprawdź swoją skrzynkę email (również folder SPAM)</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/konto/ebooki">Moje ebooki</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/katalog">Kontynuuj zakupy</Link>
        </Button>
      </div>
    </div>
  );
}
