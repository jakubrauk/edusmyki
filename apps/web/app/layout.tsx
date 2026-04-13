import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: {
    default: "edusmyki.pl – Ebooki dla przedszkoli i żłobków",
    template: "%s | edusmyki.pl",
  },
  description:
    "Profesjonalne ebooki z instrukcjami prowadzenia przedszkoli i żłobków. Pobierz gotowe procedury, regulaminy i poradniki.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl"
  ),
  icons: {
    icon: "/logo_noback.png",
    apple: "/logo_noback.png",
  },
  openGraph: {
    siteName: "edusmyki.pl",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
