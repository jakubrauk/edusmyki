import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Błąd płatności" };

export default function BladPage() {
  return (
    <div className="bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-full text-4xl shadow-lg" style={{ background: "#FEF2F2" }}>
          😕
        </div>
        <h1 className="mb-4 text-3xl font-bold">Płatność nie powiodła się</h1>
        <p className="mx-auto mb-6 max-w-md text-gray-600">
          Wystąpił problem podczas realizacji płatności. Twoje zamówienie nie zostało
          zrealizowane. Spróbuj ponownie lub skontaktuj się z nami.
        </p>
        <div className="mx-auto mb-8 max-w-md rounded-lg bg-red-50 p-3 text-sm text-red-600">
          💡 Twój koszyk jest nadal zapisany
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full bg-[#F5A623] text-white hover:bg-[#e09510]">
            <Link href="/koszyk">Wróć do koszyka</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-2 border-[#4BBFCA] text-[#4BBFCA] hover:bg-[#4BBFCA]/10">
            <a href="mailto:kontakt@edusmyki.pl">Skontaktuj się z nami</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
