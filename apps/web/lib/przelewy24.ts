import crypto from "crypto";
import type { P24RegisterResponse, P24WebhookPayload } from "@/types";

const P24_BASE_URL =
  process.env.P24_SANDBOX === "true"
    ? "https://sandbox.przelewy24.pl"
    : "https://secure.przelewy24.pl";

const MERCHANT_ID = Number(process.env.P24_MERCHANT_ID);
const POS_ID = Number(process.env.P24_POS_ID) || MERCHANT_ID;
const API_KEY = process.env.P24_API_KEY!;
const CRC_KEY = process.env.P24_CRC_KEY!;

function generateSign(data: Record<string, string | number>): string {
  const json = JSON.stringify(data);
  return crypto.createHash("sha384").update(json).digest("hex");
}

// Registers a new transaction with P24 and returns the payment token
export async function registerTransaction(params: {
  sessionId: string;
  amount: number; // in grosze (PLN * 100)
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  urlReturn: string;
  urlStatus: string;
}): Promise<string> {
  const sign = generateSign({
    sessionId: params.sessionId,
    merchantId: MERCHANT_ID,
    amount: params.amount,
    currency: "PLN",
    crc: CRC_KEY,
  });

  const body = {
    merchantId: MERCHANT_ID,
    posId: POS_ID,
    sessionId: params.sessionId,
    amount: params.amount,
    currency: "PLN",
    description: params.description,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    country: "PL",
    language: "pl",
    urlReturn: params.urlReturn,
    urlStatus: params.urlStatus,
    sign,
  };

  const credentials = Buffer.from(`${POS_ID}:${API_KEY}`).toString("base64");

  const res = await fetch(`${P24_BASE_URL}/api/v1/transaction/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`P24 register error ${res.status}: ${error}`);
  }

  const data = (await res.json()) as { data: P24RegisterResponse };
  return data.data.token;
}

// Returns the URL to redirect the user to for payment
export function getPaymentUrl(token: string): string {
  return `${P24_BASE_URL}/trnRequest/${token}`;
}

// Verifies a completed transaction with P24
export async function verifyTransaction(params: {
  sessionId: string;
  orderId: number;
  amount: number;
  currency: string;
}): Promise<boolean> {
  const sign = generateSign({
    sessionId: params.sessionId,
    orderId: params.orderId,
    amount: params.amount,
    currency: params.currency,
    crc: CRC_KEY,
  });

  const body = {
    merchantId: MERCHANT_ID,
    posId: POS_ID,
    sessionId: params.sessionId,
    amount: params.amount,
    currency: params.currency,
    orderId: params.orderId,
    sign,
  };

  const credentials = Buffer.from(`${POS_ID}:${API_KEY}`).toString("base64");

  const res = await fetch(`${P24_BASE_URL}/api/v1/transaction/verify`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });

  return res.ok;
}

// Verifies the webhook signature from P24
export function verifyWebhookSignature(payload: P24WebhookPayload): boolean {
  const expectedSign = generateSign({
    merchantId: payload.merchantId,
    posId: payload.posId,
    sessionId: payload.sessionId,
    amount: payload.amount,
    originAmount: payload.originAmount,
    currency: payload.currency,
    orderId: payload.orderId,
    methodId: payload.methodId,
    statement: payload.statement,
    crc: CRC_KEY,
  });

  return expectedSign === payload.sign;
}

// Known P24 IP addresses for webhook validation
const P24_IPS = [
  "91.216.191.181",
  "91.216.191.182",
  "91.216.191.183",
  "91.216.191.184",
  "91.216.191.185",
  // sandbox
  "91.216.191.186",
];

export function isValidP24Ip(ip: string): boolean {
  if (process.env.P24_SANDBOX === "true") return true; // skip in sandbox
  return P24_IPS.includes(ip);
}
