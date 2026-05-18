import { parseReviewUrlParams, signReviewToken } from "@/lib/review-token";
import {
  getReviewByEmailAndEbook,
  getEbookByDocumentId,
} from "@/lib/strapi";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dodaj opinię" };

interface Props {
  searchParams: Promise<{ e?: string; b?: string; s?: string }>;
}

export default async function OpiniaPage({ searchParams }: Props) {
  const params = await searchParams;

  const parsed = parseReviewUrlParams({
    e: params.e ?? null,
    b: params.b ?? null,
    s: params.s ?? null,
  });

  if (!parsed) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-semibold text-red-500">
          Nieprawidłowy link do opinii.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Link mógł być nieprawidłowy lub już użyty.
        </p>
      </div>
    );
  }

  const { email, ebookDocumentId } = parsed;

  const [existing, ebook] = await Promise.all([
    getReviewByEmailAndEbook(email, ebookDocumentId).catch(() => null),
    getEbookByDocumentId(ebookDocumentId).catch(() => null),
  ]);

  if (existing) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-semibold" style={{ color: "#7BC44C" }}>
          Dziękujemy za opinię!
        </p>
        {ebook && (
          <p className="mt-2 text-sm text-gray-500">
            Twoja opinia o <strong>{ebook.title}</strong> czeka na moderację.
          </p>
        )}
      </div>
    );
  }

  const guestEmail = Buffer.from(email).toString("base64url");
  const guestSig = signReviewToken(email, ebookDocumentId);

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">Dodaj opinię</h1>
      {ebook && (
        <p className="mb-6 text-sm text-gray-500">{ebook.title}</p>
      )}
      <ReviewForm
        ebookDocumentId={ebookDocumentId}
        ebookTitle={ebook?.title ?? ""}
        guestEmail={guestEmail}
        guestSig={guestSig}
        inline
      />
    </div>
  );
}
