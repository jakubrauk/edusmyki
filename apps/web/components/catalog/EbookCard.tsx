import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { STRAPI_MEDIA_URL } from "@/lib/strapi";
import type { Ebook } from "@/types";

interface EbookCardProps {
  ebook: Ebook;
}

export function EbookCard({ ebook }: EbookCardProps) {
  const coverUrl = ebook.coverImage?.url
    ? ebook.coverImage.url.startsWith("http")
      ? ebook.coverImage.url
      : `${STRAPI_MEDIA_URL}${ebook.coverImage.url}`
    : null;

  return (
    <Link href={`/katalog/${ebook.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-md">
        {/* Cover */}
        <div className="relative aspect-[2/3] overflow-hidden" style={{ backgroundColor: "#FFF8F0" }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={ebook.coverImage?.alternativeText || ebook.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FFF3DC, #FFE4A0)" }}
            >
              <BookOpen className="h-10 w-10" style={{ color: "#F5A623" }} />
            </div>
          )}
          {ebook.isFeatured && (
            <span
              className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: "#F5A623" }}
            >
              Polecany
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {ebook.categories?.slice(0, 1).map((cat) => (
            <span
              key={cat.id}
              className="block text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#4BBFCA" }}
            >
              {cat.name}
            </span>
          ))}
          <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-[#F5A623]">
            {ebook.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: "#F5A623" }}>
              {ebook.price.toFixed(2)} zł
            </span>
            <span className="text-[11px] font-medium" style={{ color: "#4BBFCA" }}>
              Szczegóły →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
