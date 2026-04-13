import { NextResponse } from "next/server";

export async function GET() {
  const P24_BASE_URL = "https://sandbox.przelewy24.pl";
  const POS_ID = process.env.P24_POS_ID || process.env.P24_MERCHANT_ID!;
  const API_KEY = process.env.P24_API_KEY!;

  const credentials = Buffer.from(`${POS_ID}:${API_KEY}`).toString("base64");

  const res = await fetch(`${P24_BASE_URL}/api/v1/testAccess`, {
    headers: { Authorization: `Basic ${credentials}` },
  });

  const body = await res.text();
  return NextResponse.json({ status: res.status, body });
}
