import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  verifyTransaction,
  isValidP24Ip,
} from "@/lib/przelewy24";
import {
  getOrderByP24SessionId,
  updateOrderStatus,
} from "@/lib/strapi";
import { generateDownloadTokensForOrder } from "@/lib/download-tokens";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getDownloadTokensByEmail } from "@/lib/strapi";
import type { P24WebhookPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // Validate source IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!isValidP24Ip(ip)) {
      console.warn(`P24 webhook from unknown IP: ${ip}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = (await req.json()) as P24WebhookPayload;

    // Verify signature
    if (!verifyWebhookSignature(payload)) {
      console.warn("P24 webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Find order
    const order = await getOrderByP24SessionId(payload.sessionId);

    if (!order) {
      console.error(`P24 webhook: order not found for sessionId ${payload.sessionId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: skip if already paid
    if (order.status === "paid") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Verify amount matches
    const expectedGrosze = Math.round(order.totalAmount * 100);
    if (payload.amount !== expectedGrosze) {
      console.error(
        `P24 webhook: amount mismatch for order ${order.orderNumber}. ` +
          `Expected ${expectedGrosze}, got ${payload.amount}`
      );
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Confirm transaction with P24
    const verified = await verifyTransaction({
      sessionId: payload.sessionId,
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
    });

    if (!verified) {
      console.error(`P24 webhook: verification failed for order ${order.orderNumber}`);
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    // Update order status in Strapi
    const updatedOrder = await updateOrderStatus(
      order.documentId,
      "paid",
      String(payload.orderId)
    );

    // Generate download tokens (one per ebook in the order)
    await generateDownloadTokensForOrder(updatedOrder);

    // Send confirmation email with download links
    const tokens = await getDownloadTokensByEmail(updatedOrder.guestEmail!);
    const newTokens = tokens.filter((t) =>
      updatedOrder.items.some((i) => i.ebook.id === t.ebook.id)
    );

    await sendOrderConfirmationEmail(updatedOrder, newTokens);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("P24 webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
