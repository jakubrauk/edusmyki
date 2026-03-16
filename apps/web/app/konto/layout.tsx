import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// TODO: Add session check here when NextAuth is configured
// For now, layout wraps protected pages
export default function KontoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <nav className="mb-8 flex gap-4 border-b pb-4 text-sm">
            <Link href="/konto" className="font-medium hover:text-blue-600">
              Pulpit
            </Link>
            <Link href="/konto/zamowienia" className="hover:text-blue-600">
              Zamówienia
            </Link>
            <Link href="/konto/ebooki" className="hover:text-blue-600">
              Moje ebooki
            </Link>
          </nav>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
