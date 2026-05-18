import { createHmac, timingSafeEqual } from "crypto";

const REVIEW_SECRET =
  process.env.REVIEW_SECRET || "dev-review-secret-change-in-production";

export function signReviewToken(email: string, ebookDocumentId: string): string {
  return createHmac("sha256", REVIEW_SECRET)
    .update(`${email}:${ebookDocumentId}`)
    .digest("hex");
}

function isValidSignature(
  email: string,
  ebookDocumentId: string,
  sig: string
): boolean {
  const expected = signReviewToken(email, ebookDocumentId);
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

export function buildReviewUrl(
  email: string,
  ebookDocumentId: string,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl"
): string {
  const e = Buffer.from(email).toString("base64url");
  const s = signReviewToken(email, ebookDocumentId);
  return `${appUrl}/opinia?e=${encodeURIComponent(e)}&b=${encodeURIComponent(ebookDocumentId)}&s=${s}`;
}

export function parseReviewUrlParams(params: {
  e?: string | null;
  b?: string | null;
  s?: string | null;
}): { email: string; ebookDocumentId: string } | null {
  const { e, b, s } = params;
  if (!e || !b || !s) return null;
  try {
    const email = Buffer.from(e, "base64url").toString("utf-8");
    if (!email || !email.includes("@")) return null;
    if (!isValidSignature(email, b, s)) return null;
    return { email, ebookDocumentId: b };
  } catch {
    return null;
  }
}
