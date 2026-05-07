import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function POST() {
  const res = NextResponse.redirect(`${APP_URL}/`);
  clearSessionCookie(res);
  return res;
}
