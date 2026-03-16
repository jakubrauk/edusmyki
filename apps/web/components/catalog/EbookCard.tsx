import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STRAPI_URL } from "@/lib/strapi";
import type { Ebook } from "@/types";

interface EbookCardProps {
  ebook: Ebook;
}

export function EbookCard({ ebook }: EbookCardProps) {
  const coverUrl = ebook.coverImage?.url
    ? ebook.coverImage.url.startsWith("http")
      ? ebook.coverImage.url
      : `${STRAPI_URL}${ebook.coverImage.url}`
    : null;

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lg border-gray-100">
      <Link href={`/katalog/${ebook.slug}`} className="relative block aspect-[3/4]" style={{ backgroundColor: "#FFF8F0" }}>
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={ebook.coverImage?.alternativeText || ebook.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12" style={{ color: "#F5A623", opacity: 0.4 }} />
          </div>
        )}
        {ebook.isFeatured && (
          <Badge className="absolute left-2 top-2 text-white border-0" style={{ backgroundColor: "#F5A623" }}>
            Polecany
          </Badge>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        {ebook.categories?.slice(0, 1).map((cat) => (
          <Badge key={cat.id} variant="outline" className="w-fit text-xs" style={{ borderColor: "#4BBFCA", color: "#4BBFCA" }}>
            {cat.name}
          </Badge>
        ))}
        <Link href={`/katalog/${ebook.slug}`}>
          <h3 className="font-semibold leading-tight line-clamp-2 hover:text-[#F5A623] transition-colors">
            {ebook.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 line-clamp-2">
          {ebook.shortDescription}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <span className="text-xl font-bold" style={{ color: "#F5A623" }}>
          {ebook.price.toFixed(2)} zł
        </span>
        <Button asChild size="sm" className="text-white border-0" style={{ backgroundColor: "#4BBFCA" }}>
          <Link href={`/katalog/${ebook.slug}`}>Szczegóły</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
