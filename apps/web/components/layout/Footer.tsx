import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-12" style={{ backgroundColor: "#FFF8F0" }}>
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo_noback.png" alt="EduSmyk" width={110} height={110} className="object-contain" />
              <span className="font-bold text-lg" style={{ color: "#F5A623" }}>edusmyki.pl</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Praktyczne materiały dla żłobków i przedszkoli — dokumentacja, scenariusze zajęć i pomoce dydaktyczne.
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
        <div className="mt-8 border-t pt-8 flex flex-col items-center gap-3 text-sm text-gray-400">
          <a
            href="https://www.facebook.com/profile.php?id=61583415274725"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-[#4BBFCA] transition-colors"
            aria-label="Facebook edusmyki.pl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            Obserwuj nas na Facebooku
          </a>
          <span>© {new Date().getFullYear()} edusmyki.pl. Wszelkie prawa zastrzeżone.</span>
        </div>
      </div>
    </footer>
  );
}
