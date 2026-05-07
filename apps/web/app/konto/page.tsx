import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSessionEmail } from "@/lib/session";
import { getDownloadTokensByEmail, getOrdersByEmail, STRAPI_MEDIA_URL } from "@/lib/strapi";
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
          <div className="space-y-2">
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
                <div
                  key={dt.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
                >
                  {coverUrl ? (
                    <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={coverUrl}
                        alt={dt.ebook.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, #FFF3DC, #FFE4A0)" }}
                    />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                      {dt.ebook.title}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {dt.downloadCount}/{dt.maxDownloads} pobrań ·{" "}
                      {expired
                        ? "link wygasł"
                        : `ważny do ${new Date(dt.expiresAt).toLocaleDateString("pl-PL")}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {canDownload ? (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-full px-4 text-xs text-white bg-[#F5A623] hover:bg-[#e09410]"
                      >
                        <a href={`/api/download/${dt.token}`}>Pobierz</a>
                      </Button>
                    ) : (
                      <Button size="sm" disabled className="h-8 rounded-full px-4 text-xs">
                        {expired ? "Wygasł" : "Limit"}
                      </Button>
                    )}
                  </div>
                </div>
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
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-gray-500">
                    {order.items.map((item) => (
                      <li key={item.id}>· {item.ebookTitle}</li>
                    ))}
                  </ul>
                </div>
                <span className="shrink-0 text-base font-bold" style={{ color: "#F5A623" }}>
                  {order.totalAmount.toFixed(2)} zł
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
