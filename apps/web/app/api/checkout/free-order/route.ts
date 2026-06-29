import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEbooksByIds, createOrder } from "@/lib/strapi";
import { generateDownloadTokensForOrder } from "@/lib/download-tokens";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Order } from "@/types";

const schema = z.object({
  ebookIds: z.array(z.number()).min(1),
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ebooks = await getEbooksByIds(data.ebookIds);

    if (ebooks.length !== data.ebookIds.length) {
      return NextResponse.json(
        { error: "Jeden lub więcej ebooków jest niedostępnych" },
        { status: 400 }
      );
    }

    // Server-side price check — cannot be bypassed by client
    if (ebooks.some((e) => e.price > 0)) {
      return NextResponse.json(
        { error: "Koszyk zawiera produkty płatne" },
        { status: 400 }
      );
    }

    const orderNumber = `EDU-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await createOrder({
      orderNumber,
      status: "paid",
      items: ebooks.map((e) => ({ ebook: e.id, ebookTitle: e.title, price: 0 })),
      totalAmount: 0,
      guestEmail: data.email,
      guestFirstName: data.firstName,
      guestLastName: data.lastName,
      invoiceRequested: false,
    });

    // Strapi POST response doesn't populate relations — build a complete order
    // object using the ebooks we already fetched so generateDownloadTokensForOrder
    // has the data it needs (ebook.id, ebook.title, ebook.documentId).
    const orderWithEbooks: Order = {
      ...order,
      guestEmail: data.email,
      guestFirstName: data.firstName,
      guestLastName: data.lastName,
      items: ebooks.map((ebook, i) => ({
        id: order.items?.[i]?.id ?? i,
        ebook,
        ebookTitle: ebook.title,
        price: 0,
      })),
    };

    const tokens = await generateDownloadTokensForOrder(orderWithEbooks);
    await sendOrderConfirmationEmail(orderWithEbooks, tokens);

    return NextResponse.json({ orderNumber, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane formularza", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Free order error:", error);
    return NextResponse.json(
      { error: "Błąd podczas tworzenia zamówienia" },
      { status: 500 }
    );
  }
}
