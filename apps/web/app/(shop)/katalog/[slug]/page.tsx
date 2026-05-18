import { notFound } from "next/navigation";
import Image from "next/image";
import { getEbookBySlug, getReviewsByEbook, getDownloadTokensByEmail, STRAPI_MEDIA_URL } from "@/lib/strapi";
import { getSessionEmail } from "@/lib/session";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, FileText, Tag } from "lucide-react";
import type { Metadata } from "next";
import type { Review } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ebook = await getEbookBySlug(slug);
  if (!ebook) return { title: "Nie znaleziono" };

  return {
    title: ebook.metaTitle || ebook.title,
    description: ebook.metaDescription || ebook.shortDescription,
    openGraph: {
      title: ebook.title,
      description: ebook.shortDescription,
      images: ebook.coverImage?.url
        ? [
            {
              url: ebook.coverImage.url.startsWith("http")
                ? ebook.coverImage.url
                : `${STRAPI_MEDIA_URL}${ebook.coverImage.url}`,
            },
          ]
        : [],
    },
  };
}

export default async function EbookPage({ params }: Props) {
  const { slug } = await params;
  const [ebook, sessionEmail] = await Promise.all([
    getEbookBySlug(slug),
    getSessionEmail().catch(() => null),
  ]);
  if (!ebook) notFound();

  const [reviews, userTokens] = await Promise.all([
    getReviewsByEbook(ebook.documentId).catch(() => [] as Review[]),
    sessionEmail
      ? getDownloadTokensByEmail(sessionEmail).catch(() => [])
      : Promise.resolve([]),
  ]);

  const hasPurchased = userTokens.some(
    (t) => t.ebook.documentId === ebook.documentId
  );

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  const coverUrl = ebook.coverImage?.url
    ? ebook.coverImage.url.startsWith("http")
      ? ebook.coverImage.url
      : `${STRAPI_MEDIA_URL}${ebook.coverImage.url}`
    : null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Cover */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={ebook.coverImage?.alternativeText || ebook.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-20 w-20 text-gray-400" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          {/* Categories */}
          {ebook.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ebook.categories.map((cat) => (
                <Badge key={cat.id} variant="secondary">
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold">{ebook.title}</h1>

          <p className="text-gray-600">{ebook.shortDescription}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {ebook.pageCount && (
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {ebook.pageCount} stron
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Format: PDF
            </span>
          </div>

          <Separator />

          {/* Price & CTA */}
          <div className="flex items-center gap-6">
            <span
              className="text-4xl font-extrabold"
              style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
            >
              {ebook.price.toFixed(2)} zł
            </span>
            <AddToCartButton ebook={ebook} />
          </div>

          <p className="text-sm text-gray-500">
            Po zakupie otrzymasz link do pobrania na podany email. Link ważny 30
            dni, max 5 pobrań.
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">Opis</h2>
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: ebook.description }}
        />
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Opinie</h2>
            {avgRating !== null && (
              <p className="mt-1 text-sm text-gray-500">
                Średnia ocena:{" "}
                <span className="font-semibold" style={{ color: "#F5A623" }}>
                  {avgRating} / 5
                </span>{" "}
                ({reviews.length}{" "}
                {reviews.length === 1
                  ? "opinia"
                  : reviews.length % 10 >= 2 && reviews.length % 10 <= 4 && (reviews.length % 100 < 10 || reviews.length % 100 >= 20)
                  ? "opinie"
                  : "opinii"})
              </p>
            )}
          </div>
          {hasPurchased && (
            <ReviewForm
              ebookDocumentId={ebook.documentId}
              ebookTitle={ebook.title}
            />
          )}
        </div>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
