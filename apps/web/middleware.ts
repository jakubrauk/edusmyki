import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/konto/logowanie") {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.redirect(new URL("/konto/logowanie", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/konto", "/konto/:path*"],
};
