import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSessionEmail } from "@/lib/session";
import { signReviewToken } from "@/lib/review-token";
import {
  getDownloadTokensByEmail,
  getReviewByEmailAndEbook,
  createReview,
  getSettings,
  getEbookByDocumentId,
} from "@/lib/strapi";
import { sendAdminReviewNotification } from "@/lib/email";

function verifyGuestSig(
  email: string,
  ebookDocumentId: string,
  sig: string
): boolean {
  const expected = signReviewToken(email, ebookDocumentId);
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(sig, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    ebookDocumentId,
    rating,
    content,
    authorName,
    authorRole,
    guestEmail: guestEmailEncoded,
    guestSig,
  } = body as {
    ebookDocumentId?: unknown;
    rating?: unknown;
    content?: unknown;
    authorName?: unknown;
    authorRole?: unknown;
    guestEmail?: unknown;
    guestSig?: unknown;
  };

  if (!ebookDocumentId || typeof ebookDocumentId !== "string") {
    return NextResponse.json({ error: "Missing ebookDocumentId" }, { status: 400 });
  }
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json({ error: "Rating must be integer 1–5" }, { status: 400 });
  }
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "Content too long (max 500)" }, { status: 400 });
  }
  if (!authorName || typeof authorName !== "string" || authorName.trim().length === 0) {
    return NextResponse.json({ error: "Author name is required" }, { status: 400 });
  }

  // Determine email — guest flow or session flow
  let email: string | null = null;

  if (
    typeof guestEmailEncoded === "string" &&
    typeof guestSig === "string"
  ) {
    try {
      email = Buffer.from(guestEmailEncoded, "base64url").toString("utf-8");
    } catch {
      return NextResponse.json({ error: "Invalid guest token" }, { status: 400 });
    }
    if (!verifyGuestSig(email, ebookDocumentId, guestSig)) {
      return NextResponse.json({ error: "Invalid review token" }, { status: 403 });
    }
  } else {
    email = await getSessionEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Verify purchase — check DownloadToken for this email + ebook
  const tokens = await getDownloadTokensByEmail(email).catch(() => []);
  const purchasedToken = tokens.find(
    (t) => t.ebook.documentId === ebookDocumentId
  );
  if (!purchasedToken) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 403 });
  }

  // Check duplicate
  const existing = await getReviewByEmailAndEbook(email, ebookDocumentId);
  if (existing) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  // Create review (draft — awaits admin approval in Strapi)
  await createReview({
    rating: rating as number,
    content: content.trim(),
    authorName: authorName.trim(),
    authorRole:
      typeof authorRole === "string" && authorRole.trim()
        ? authorRole.trim()
        : undefined,
    email,
    ebookId: purchasedToken.ebook.id,
  });

  // Send admin notification (best-effort)
  const [settings, ebook] = await Promise.all([
    getSettings(),
    getEbookByDocumentId(ebookDocumentId),
  ]);

  if (settings?.adminEmail && ebook) {
    await sendAdminReviewNotification({
      adminEmail: settings.adminEmail,
      ebookTitle: ebook.title,
      authorName: (authorName as string).trim(),
      rating: rating as number,
    }).catch((err) => console.warn("Admin review notification failed:", err));
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
