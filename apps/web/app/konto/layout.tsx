import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSessionEmail } from "@/lib/session";

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getSessionEmail();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          {email && (
            <div className="mb-8 flex items-center justify-between border-b pb-4">
              <span className="text-sm text-gray-500">{email}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-[#4BBFCA] hover:underline"
                >
                  Wyloguj
                </button>
              </form>
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
