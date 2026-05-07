import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEbooksByIds, createOrder } from "@/lib/strapi";
import { stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  ebookIds: z.array(z.number()).min(1),
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  invoiceRequested: z.boolean().default(false),
  invoiceData: z
    .object({
      companyName: z.string(),
      nip: z.string().regex(/^\d{10}$/, "NIP musi mieć 10 cyfr"),
      address: z.string(),
      city: z.string(),
      postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Nieprawidłowy kod pocztowy"),
      country: z.string().default("PL"),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    const ebooks = await getEbooksByIds(data.ebookIds);

    if (ebooks.length !== data.ebookIds.length) {
      return NextResponse.json(
        { error: "Jeden lub więcej ebooków jest niedostępnych" },
        { status: 400 }
      );
    }

    const items = ebooks.map((e) => ({
      ebook: e.id,
      ebookTitle: e.title,
      price: e.price,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price, 0);
    const amountInGrosze = Math.round(totalAmount * 100);

    const orderNumber = `EDU-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInGrosze,
      currency: "pln",
      payment_method_types: ["card", "blik", "p24"],
      metadata: { orderNumber },
    });

    await createOrder({
      orderNumber,
      status: "pending",
      items,
      totalAmount,
      guestEmail: data.email,
      guestFirstName: data.firstName,
      guestLastName: data.lastName,
      invoiceRequested: data.invoiceRequested,
      ...(data.invoiceData && { invoiceData: data.invoiceData }),
      paymentIntentId: paymentIntent.id,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane formularza", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Błąd podczas tworzenia zamówienia" },
      { status: 500 }
    );
  }
}
