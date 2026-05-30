import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { getDownloadTokensByEmail } from "@/lib/strapi";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ ebookDocumentIds: [] });
  }

  const tokens = await getDownloadTokensByEmail(email).catch(() => []);
  const ebookDocumentIds = [...new Set(tokens.map((t) => t.ebook.documentId))];

  return NextResponse.json({ ebookDocumentIds });
}
