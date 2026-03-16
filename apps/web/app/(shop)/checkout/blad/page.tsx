import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const metadata = { title: "Błąd płatności" };

export default function BladPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <XCircle className="mx-auto mb-6 h-20 w-20 text-red-400" />
      <h1 className="mb-4 text-3xl font-bold">Płatność nie powiodła się</h1>
      <p className="mx-auto mb-8 max-w-md text-gray-600">
        Wystąpił problem podczas realizacji płatności. Twoje zamówienie nie zostało
        zrealizowane. Spróbuj ponownie lub skontaktuj się z nami.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/koszyk">Wróć do koszyka</Link>
        </Button>
        <Button asChild variant="outline">
          <a href="mailto:kontakt@edusmyki.pl">Skontaktuj się z nami</a>
        </Button>
      </div>
    </div>
  );
}
