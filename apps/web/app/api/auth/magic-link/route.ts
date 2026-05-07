import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createMagicToken } from "@/lib/strapi";
import { sendMagicLinkEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await createMagicToken(email, token, expiresAt);
    await sendMagicLinkEmail(email, `${APP_URL}/api/auth/verify?token=${token}`);
  } catch (err) {
    console.error("magic-link error:", err);
    // always return 200 — don't reveal whether email exists
  }

  return NextResponse.json({ ok: true });
}
