import { NextRequest, NextResponse } from "next/server";
import { findMagicTokenByToken, markMagicTokenUsed } from "@/lib/strapi";
import { setSessionCookie } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const errorUrl = `${APP_URL}/konto/logowanie?error=invalid_token`;

  if (!token) return NextResponse.redirect(errorUrl);

  try {
    const magicToken = await findMagicTokenByToken(token);

    if (
      !magicToken ||
      magicToken.used ||
      new Date(magicToken.expiresAt) < new Date()
    ) {
      return NextResponse.redirect(errorUrl);
    }

    await markMagicTokenUsed(magicToken.documentId);

    const res = NextResponse.redirect(`${APP_URL}/konto`);
    await setSessionCookie(res, magicToken.email);
    return res;
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.redirect(errorUrl);
  }
}
