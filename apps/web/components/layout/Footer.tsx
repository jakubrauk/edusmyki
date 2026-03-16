import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-12" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.jpeg" alt="EduSmyk" width={40} height={40} className="rounded-full" />
              <span className="font-bold text-lg" style={{ color: "#F5A623" }}>edusmyki.pl</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Profesjonalne ebooki dla dyrektorów i właścicieli przedszkoli i żłobków.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-gray-800">Sklep</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/katalog" className="hover:text-[#4BBFCA] transition-colors">Katalog ebooków</Link></li>
              <li><Link href="/koszyk" className="hover:text-[#4BBFCA] transition-colors">Koszyk</Link></li>
              <li><Link href="/konto" className="hover:text-[#4BBFCA] transition-colors">Moje konto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-gray-800">Informacje</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/regulamin" className="hover:text-[#4BBFCA] transition-colors">Regulamin</Link></li>
              <li><Link href="/polityka-prywatnosci" className="hover:text-[#4BBFCA] transition-colors">Polityka prywatności</Link></li>
              <li><a href="mailto:kontakt@edusmyki.pl" className="hover:text-[#4BBFCA] transition-colors">kontakt@edusmyki.pl</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} edusmyki.pl. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
