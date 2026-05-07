import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSessionEmail } from "@/lib/session";
import { getDownloadTokensByEmail, getOrdersByEmail, STRAPI_MEDIA_URL } from "@/lib/strapi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Moje konto" };

export default async function KontoPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/konto/logowanie");

  const [tokens, orders] = await Promise.all([
    getDownloadTokensByEmail(email),
    getOrdersByEmail(email),
  ]);

  const now = new Date();

  return (
    <div className="space-y-12">
      <PageHeader
        pill="👤 Konto"
        pillColor="#4BBFCA"
        title="Moje konto"
      />

      {/* ── Moje ebooki ── */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Moje ebooki</h2>
        {tokens.length === 0 ? (
          <p className="text-gray-500">
            Nie masz jeszcze żadnych ebooków.{" "}
            <Link href="/katalog" className="text-[#4BBFCA] underline">
              Przejdź do katalogu
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tokens.map((dt) => {
              const expired = new Date(dt.expiresAt) < now;
              const limitReached = dt.downloadCount >= dt.maxDownloads;
              const canDownload = !expired && !limitReached;

              const coverUrl = dt.ebook.coverImage
                ? dt.ebook.coverImage.url.startsWith("http")
                  ? dt.ebook.coverImage.url
                  : `${STRAPI_MEDIA_URL}${dt.ebook.coverImage.url}`
                : null;

              return (
                <Card key={dt.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {coverUrl && (
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md">
                        <Image
                          src={coverUrl}
                          alt={dt.ebook.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="font-medium leading-tight">{dt.ebook.title}</p>
                    <p className="text-xs text-gray-400">
                      {dt.downloadCount}/{dt.maxDownloads} pobrań ·{" "}
                      {expired
                        ? "link wygasł"
                        : `ważny do ${new Date(dt.expiresAt).toLocaleDateString("pl-PL")}`}
                    </p>
                    {canDownload ? (
                      <Button
                        asChild
                        size="sm"
                        className="w-full rounded-full bg-[#F5A623] hover:bg-[#e09410]"
                      >
                        <a href={`/api/download/${dt.token}`}>
                          Pobierz PDF
                        </a>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="w-full rounded-full"
                      >
                        {expired ? "Link wygasł" : "Limit pobrań wyczerpany"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Historia zamówień ── */}
      <section>
        <h2 className="mb-6 text-xl font-semibold">Historia zamówień</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500">Brak zamówień.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-sm text-gray-600">
                        {order.items.map((item) => (
                          <li key={item.id}>· {item.ebookTitle}</li>
                        ))}
                      </ul>
                    </div>
                    <span
                      className="shrink-0 font-extrabold text-lg"
                      style={{ color: "#F5A623" }}
                    >
                      {order.totalAmount.toFixed(2)} zł
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
