# Stripe Payment Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Przelewy24 payment integration with Stripe embedded Payment Elements supporting card, BLIK, and Polish bank transfers.

**Architecture:** Two-step checkout — step 1 collects contact data and creates a Stripe PaymentIntent server-side; step 2 renders embedded `<PaymentElement>` for payment completion. A Stripe webhook at `/api/webhooks/stripe` handles fulfillment (order status update, download token generation, email). Cart is cleared on the success page after confirmed redirect from Stripe.

**Tech Stack:** `stripe` (Node.js SDK), `@stripe/stripe-js`, `@stripe/react-stripe-js`, Next.js App Router, Strapi v5, Zod

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `apps/web/lib/stripe.ts` | Reusable server-side Stripe client |
| Create | `apps/web/app/api/checkout/create-payment-intent/route.ts` | Create PaymentIntent + Strapi order |
| Create | `apps/web/app/api/webhooks/stripe/route.ts` | Fulfillment on `payment_intent.succeeded` |
| Create | `apps/web/components/checkout/StripePaymentForm.tsx` | `<PaymentElement>` + confirm button |
| Create | `apps/web/components/checkout/ClearCartOnSuccess.tsx` | Client component to clear cart on success |
| Modify | `apps/web/components/checkout/CheckoutForm.tsx` | Two-step flow (contact → payment) |
| Modify | `apps/web/app/(shop)/checkout/sukces/page.tsx` | Verify `redirect_status`, mount ClearCartOnSuccess |
| Modify | `apps/web/lib/strapi.ts` | Rename functions and `paymentIntentId` field |
| Modify | `apps/web/types/index.ts` | Replace P24 types |
| Modify | `apps/cms/src/api/order/content-types/order/schema.json` | Rename `p24TransactionId` → `paymentIntentId` |
| Delete | `apps/web/lib/przelewy24.ts` | — |
| Delete | `apps/web/app/api/checkout/create-session/route.ts` | — |
| Delete | `apps/web/app/api/webhooks/przelewy24/route.ts` | — |
| Delete | `apps/web/app/api/p24-test/route.ts` | — |

---

### Task 1: Install Stripe packages

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install dependencies**

```bash
cd apps/web && npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No new errors (pre-existing errors from P24 files are OK at this stage).

- [ ] **Step 3: Commit**

```bash
cd apps/web && git add package.json package-lock.json
git commit -m "chore: install Stripe packages"
```

---

### Task 2: Update Strapi order schema

**Files:**
- Modify: `apps/cms/src/api/order/content-types/order/schema.json`

- [ ] **Step 1: Rename `p24TransactionId` and remove `p24OrderId`**

In `apps/cms/src/api/order/content-types/order/schema.json`, in the `attributes` object:

Replace:
```json
    "p24TransactionId": {
      "type": "string"
    },
    "p24OrderId": {
      "type": "string"
    },
```

With:
```json
    "paymentIntentId": {
      "type": "string"
    },
```

- [ ] **Step 2: Restart Strapi and verify**

```bash
# Stop any running Strapi, then:
cd apps/cms && npm run develop
```

Open http://localhost:1337/admin → Content-Type Builder → Zamówienie. Verify `paymentIntentId` exists and `p24TransactionId` / `p24OrderId` are gone.

- [ ] **Step 3: Commit**

```bash
git add apps/cms/src/api/order/content-types/order/schema.json
git commit -m "feat: rename p24TransactionId to paymentIntentId in order schema"
```

---

### Task 3: Update TypeScript types

**Files:**
- Modify: `apps/web/types/index.ts`

- [ ] **Step 1: Update `Order` interface**

In `apps/web/types/index.ts`, in the `Order` interface, replace:

```ts
  p24TransactionId?: string;
```

with:

```ts
  paymentIntentId?: string;
```

- [ ] **Step 2: Remove P24 types**

Find and delete these two interfaces at the bottom of `apps/web/types/index.ts`:

```ts
// Przelewy24
export interface P24RegisterResponse {
  token: string;
}

export interface P24WebhookPayload {
  merchantId: number;
  posId: number;
  sessionId: string;
  amount: number;
  originAmount: number;
  currency: string;
  orderId: number;
  methodId: number;
  statement: string;
  sign: string;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: Errors only in P24 files that will be deleted in Task 11 (`lib/przelewy24.ts`, `app/api/checkout/create-session/route.ts`, `app/api/webhooks/przelewy24/route.ts`). No errors in any other file.

- [ ] **Step 4: Commit**

```bash
git add apps/web/types/index.ts
git commit -m "feat: replace P24 types with paymentIntentId in Order"
```

---

### Task 4: Update `lib/strapi.ts`

**Files:**
- Modify: `apps/web/lib/strapi.ts`

Three functions reference P24 and need updating.

- [ ] **Step 1: Update `createOrder` — replace `p24TransactionId` with `paymentIntentId`**

Find the `createOrder` function (around line 104). Replace its parameter type definition:

```ts
export async function createOrder(data: {
  orderNumber: string;
  status: "pending";
  items: Array<{ ebook: number; ebookTitle: string; price: number }>;
  totalAmount: number;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  invoiceRequested: boolean;
  invoiceData?: object;
  paymentIntentId: string;
}): Promise<Order> {
  const res = await strapiRequest<{ data: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify({ data }),
    next: { revalidate: 0 },
  });
  return res.data;
}
```

- [ ] **Step 2: Update `updateOrderStatus` — remove `p24OrderId` param**

Replace the `updateOrderStatus` function:

```ts
export async function updateOrderStatus(
  documentId: string,
  status: "paid" | "cancelled" | "refunded"
): Promise<Order> {
  const res = await strapiRequest<{ data: Order }>(`/orders/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        status,
        ...(status === "paid" && { paidAt: new Date().toISOString() }),
      },
    }),
    next: { revalidate: 0 },
  });
  return res.data;
}
```

- [ ] **Step 3: Rename `getOrderByP24SessionId` → `getOrderByPaymentIntentId`**

Replace the function:

```ts
export async function getOrderByPaymentIntentId(paymentIntentId: string): Promise<Order | null> {
  const qs = new URLSearchParams({
    "filters[paymentIntentId][$eq]": paymentIntentId,
    "populate[items][populate][ebook]": "true",
  });

  const res = await strapiRequest<StrapiResponse<Order[]>>(`/orders?${qs}`);
  return res.data[0] ?? null;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: Errors only in P24 files (`lib/przelewy24.ts`, `create-session/route.ts`, `webhooks/przelewy24/route.ts`). No errors elsewhere.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/strapi.ts
git commit -m "feat: update strapi.ts for Stripe (paymentIntentId, getOrderByPaymentIntentId)"
```

---

### Task 5: Create `lib/stripe.ts`

**Files:**
- Create: `apps/web/lib/stripe.ts`

- [ ] **Step 1: Create the Stripe server-side client**

Create `apps/web/lib/stripe.ts`:

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

- [ ] **Step 2: Add env variables to `.env.local`**

In `apps/web/.env.local` (create if it doesn't exist), add:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Get `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from https://dashboard.stripe.com/test/apikeys.  
Get `STRIPE_WEBHOOK_SECRET` from the Stripe CLI in Task 7 Step 2.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/stripe.ts
git commit -m "feat: add Stripe server-side client"
```

---

### Task 6: Create `/api/checkout/create-payment-intent` route

**Files:**
- Create: `apps/web/app/api/checkout/create-payment-intent/route.ts`

- [ ] **Step 1: Create the route**

Create `apps/web/app/api/checkout/create-payment-intent/route.ts`:

```ts
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
```

- [ ] **Step 2: Test the route manually**

Start dev server with `npm run dev` from the repo root (Strapi must also be running).

```bash
curl -X POST http://localhost:3000/api/checkout/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"ebookIds":[1],"email":"test@test.pl","firstName":"Jan","lastName":"Kowalski","invoiceRequested":false}'
```

Expected: `{"clientSecret":"pi_..._secret_...","orderNumber":"EDU-..."}`

If ebook ID 1 doesn't exist in Strapi yet, expected: `{"error":"Jeden lub więcej ebooków jest niedostępnych"}`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/checkout/create-payment-intent/route.ts
git commit -m "feat: add Stripe create-payment-intent API route"
```

---

### Task 7: Create `/api/webhooks/stripe` route

**Files:**
- Create: `apps/web/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Create the webhook handler**

Create `apps/web/app/api/webhooks/stripe/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  getOrderByPaymentIntentId,
  updateOrderStatus,
  getDownloadTokensByEmail,
} from "@/lib/strapi";
import { generateDownloadTokensForOrder } from "@/lib/download-tokens";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const order = await getOrderByPaymentIntentId(paymentIntent.id);

      if (!order) {
        console.error(`Stripe webhook: order not found for paymentIntent ${paymentIntent.id}`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "paid") {
        return NextResponse.json({ status: "already_processed" });
      }

      await updateOrderStatus(order.documentId, "paid");

      await generateDownloadTokensForOrder(order);

      const tokens = await getDownloadTokensByEmail(order.guestEmail!);
      const newTokens = tokens.filter((t) =>
        order.items.some((i) => i.ebook.id === t.ebook.id)
      );

      await sendOrderConfirmationEmail(order, newTokens);
    } catch (err) {
      console.error("Stripe webhook processing error:", err);
      return NextResponse.json({ error: "Processing error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Set up Stripe CLI for local webhook forwarding**

Install the Stripe CLI if not present: https://stripe.com/docs/stripe-cli#install

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret printed by the CLI (starts with `whsec_`) and add it to `apps/web/.env.local`:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Leave this terminal running.

- [ ] **Step 3: Test the webhook**

In a second terminal, trigger a test event:

```bash
stripe trigger payment_intent.succeeded
```

Expected in the `stripe listen` terminal: `200 POST /api/webhooks/stripe`

Expected in server logs: either "order not found" (no matching order in Strapi yet — this is fine) or successful processing log.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe webhook handler"
```

---

### Task 8: Create `StripePaymentForm` component

**Files:**
- Create: `apps/web/components/checkout/StripePaymentForm.tsx`

- [ ] **Step 1: Create the component**

Create `apps/web/components/checkout/StripePaymentForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface Props {
  orderNumber: string;
  totalAmount: number;
}

export function StripePaymentForm({ orderNumber, totalAmount }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${APP_URL}/checkout/sukces`,
      },
    });

    // Only runs if confirmPayment fails synchronously (e.g. card declined before redirect)
    if (stripeError) {
      setError(stripeError.message ?? "Wystąpił błąd płatności");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-sm text-gray-500 mb-2">
        Zamówienie <span className="font-medium text-gray-700">{orderNumber}</span>
      </div>

      <PaymentElement />

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-full bg-[#F5A623] hover:bg-[#e09410]"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Przetwarzanie...
          </>
        ) : (
          `Zapłać ${totalAmount.toFixed(2)} zł`
        )}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors in this file.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/checkout/StripePaymentForm.tsx
git commit -m "feat: add StripePaymentForm component with PaymentElement"
```

---

### Task 9: Update `CheckoutForm` to two-step flow

**Files:**
- Modify: `apps/web/components/checkout/CheckoutForm.tsx`

The component gains a `paymentState` field. When `null`, show the contact form (step 1). When set, show Stripe Elements (step 2). No more redirect — no `useRouter`, no `clearCart` (cart is cleared on the success page).

- [ ] **Step 1: Replace `CheckoutForm.tsx` entirely**

Replace the full content of `apps/web/components/checkout/CheckoutForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "./StripePaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const checkoutSchema = z.object({
  email: z.string().email("Podaj prawidłowy adres email"),
  firstName: z.string().min(2, "Imię jest za krótkie").max(50),
  lastName: z.string().min(2, "Nazwisko jest za krótkie").max(50),
  invoiceRequested: z.boolean(),
  companyName: z.string().optional(),
  nip: z
    .string()
    .regex(/^\d{10}$/, "NIP musi mieć 10 cyfr")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, "Format: XX-XXX")
    .optional()
    .or(z.literal("")),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "Musisz zaakceptować regulamin"),
  digitalDeliveryConsent: z
    .boolean()
    .refine(
      (val) => val === true,
      "Zgoda na dostarczenie treści cyfrowej jest wymagana"
    ),
  marketingConsent: z.boolean().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface PaymentState {
  clientSecret: string;
  orderNumber: string;
}

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const { items, totalPrice } = useCartStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      invoiceRequested: false,
      termsAccepted: undefined,
      digitalDeliveryConsent: undefined,
    },
  });

  const invoiceRequested = watch("invoiceRequested");

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="mb-4 text-gray-500">Twój koszyk jest pusty.</p>
        <Button asChild>
          <Link href="/katalog">Wróć do katalogu</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(data: CheckoutFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookIds: items.map((i) => i.ebookId),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          invoiceRequested: data.invoiceRequested,
          ...(data.invoiceRequested && {
            invoiceData: {
              companyName: data.companyName,
              nip: data.nip,
              address: data.address,
              city: data.city,
              postalCode: data.postalCode,
              country: "PL",
            },
          }),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Błąd serwera");
      }

      setPaymentState({ clientSecret: json.clientSecret, orderNumber: json.orderNumber });
    } catch (error) {
      toast.error("Błąd podczas składania zamówienia", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie",
      });
    } finally {
      setLoading(false);
    }
  }

  if (paymentState) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>💳 Dane płatności</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: paymentState.clientSecret, locale: "pl" }}
              >
                <StripePaymentForm
                  orderNumber={paymentState.orderNumber}
                  totalAmount={totalPrice()}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card style={{ background: "#FFFBF5", borderColor: "#FFE4A0" }}>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Twoje zamówienie</h2>
              {items.map((item) => (
                <div key={item.ebookId} className="flex justify-between text-sm">
                  <span className="text-gray-700 pr-4 line-clamp-2">{item.title}</span>
                  <span className="shrink-0 font-medium">{item.price.toFixed(2)} zł</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Łącznie:</span>
                <span
                  className="font-extrabold"
                  style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
                >
                  {totalPrice().toFixed(2)} zł
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Płatność obsługiwana przez Stripe (BLIK, karta, przelew bankowy)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Przygotowywanie płatności...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact data */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.pl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Imię *</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nazwisko *</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice */}
          <Card>
            <CardHeader>
              <CardTitle>🧾 Faktura VAT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="invoiceRequested"
                  {...register("invoiceRequested")}
                  className="h-4 w-4"
                />
                <Label htmlFor="invoiceRequested" className="cursor-pointer">
                  Chcę otrzymać fakturę VAT
                </Label>
              </div>

              {invoiceRequested && (
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="companyName">Nazwa firmy</Label>
                    <Input id="companyName" {...register("companyName")} />
                  </div>
                  <div>
                    <Label htmlFor="nip">NIP (10 cyfr)</Label>
                    <Input id="nip" placeholder="1234567890" {...register("nip")} />
                    {errors.nip && (
                      <p className="mt-1 text-sm text-red-500">{errors.nip.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input id="address" {...register("address")} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="postalCode">Kod pocztowy</Label>
                      <Input id="postalCode" placeholder="00-000" {...register("postalCode")} />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">Miasto</Label>
                      <Input id="city" {...register("city")} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Zgody</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  {...register("termsAccepted")}
                  className="mt-0.5 h-4 w-4"
                />
                <Label htmlFor="termsAccepted" className="cursor-pointer text-sm leading-relaxed">
                  Akceptuję{" "}
                  <Link href="/regulamin" className="text-[#4BBFCA] underline" target="_blank">
                    regulamin
                  </Link>{" "}
                  i{" "}
                  <Link href="/polityka-prywatnosci" className="text-[#4BBFCA] underline" target="_blank">
                    politykę prywatności
                  </Link>{" "}
                  *
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="digitalDeliveryConsent"
                  {...register("digitalDeliveryConsent")}
                  className="mt-0.5 h-4 w-4"
                />
                <Label htmlFor="digitalDeliveryConsent" className="cursor-pointer text-sm leading-relaxed">
                  Wyrażam zgodę na natychmiastowe dostarczenie treści cyfrowej i potwierdzam
                  utratę prawa do odstąpienia od umowy po dostarczeniu pliku. *
                </Label>
              </div>
              {errors.digitalDeliveryConsent && (
                <p className="text-sm text-red-500">{errors.digitalDeliveryConsent.message}</p>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  {...register("marketingConsent")}
                  className="mt-0.5 h-4 w-4"
                />
                <Label htmlFor="marketingConsent" className="cursor-pointer text-sm leading-relaxed">
                  Wyrażam zgodę na otrzymywanie informacji marketingowych drogą elektroniczną.
                  (opcjonalne)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card style={{ background: "#FFFBF5", borderColor: "#FFE4A0" }}>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Twoje zamówienie</h2>
              {items.map((item) => (
                <div key={item.ebookId} className="flex justify-between text-sm">
                  <span className="text-gray-700 pr-4 line-clamp-2">{item.title}</span>
                  <span className="shrink-0 font-medium">{item.price.toFixed(2)} zł</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Łącznie:</span>
                <span
                  className="font-extrabold"
                  style={{ color: "#F5A623", fontFamily: "var(--font-baloo)" }}
                >
                  {totalPrice().toFixed(2)} zł
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Płatność obsługiwana przez Stripe (BLIK, karta, przelew bankowy)
              </p>
              <Button
                type="submit"
                className="w-full rounded-full bg-[#F5A623] hover:bg-[#e09410]"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Przetwarzanie...
                  </>
                ) : (
                  "Przejdź do płatności →"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors in this file.

- [ ] **Step 3: Test in browser (step 1 only)**

Start dev server: `npm run dev` from the repo root. Open http://localhost:3000/checkout.

1. Add an ebook to cart (http://localhost:3000/katalog)
2. Fill the contact form and click "Przejdź do płatności →"
3. Verify the loading state appears briefly, then the Stripe Payment Element renders with card/BLIK/bank options

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/checkout/CheckoutForm.tsx
git commit -m "feat: two-step checkout with Stripe Payment Elements"
```

---

### Task 10: Update success page and add cart-clear component

**Files:**
- Modify: `apps/web/app/(shop)/checkout/sukces/page.tsx`
- Create: `apps/web/components/checkout/ClearCartOnSuccess.tsx`

- [ ] **Step 1: Create `ClearCartOnSuccess` component**

Create `apps/web/components/checkout/ClearCartOnSuccess.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function ClearCartOnSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
```

- [ ] **Step 2: Update `sukces/page.tsx`**

Replace the full content of `apps/web/app/(shop)/checkout/sukces/page.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";

export const metadata = { title: "Zamówienie złożone" };

interface Props {
  searchParams: Promise<{ redirect_status?: string; payment_intent?: string }>;
}

export default async function SukcesPage({ searchParams }: Props) {
  const params = await searchParams;

  if (params.redirect_status && params.redirect_status !== "succeeded") {
    redirect("/checkout/blad");
  }

  return (
    <div className="bg-gradient-to-b from-[#EDF9E8] to-white">
      <ClearCartOnSuccess />
      <div className="container mx-auto px-4 py-20 text-center">
        <div
          className="flex h-20 w-20 mx-auto mb-6 items-center justify-center rounded-full text-4xl shadow-lg"
          style={{ background: "#EDF9E8" }}
        >
          🎉
        </div>
        <h1 className="mb-4 text-3xl font-bold">Dziękujemy za zakup!</h1>
        <p className="mx-auto mb-4 max-w-md text-gray-600">
          Twoje zamówienie zostało zrealizowane. Za chwilę otrzymasz email z linkami
          do pobrania zakupionych ebooków.
        </p>
        <div className="mb-8 flex items-center justify-center gap-2">
          <span
            className="inline-block rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: "#EDF9E8", color: "#7BC44C" }}
          >
            Sprawdź swoją skrzynkę email (również folder SPAM)
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full bg-[#F5A623] text-white hover:bg-[#e09510]">
            <Link href="/konto/ebooki">Moje ebooki</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-2 border-[#4BBFCA] text-[#4BBFCA] hover:bg-[#4BBFCA]/10"
          >
            <Link href="/katalog">Kontynuuj zakupy</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/(shop)/checkout/sukces/page.tsx \
        apps/web/components/checkout/ClearCartOnSuccess.tsx
git commit -m "feat: update success page to verify Stripe redirect_status and clear cart"
```

---

### Task 11: Remove P24 files and smoke test

**Files:**
- Delete: `apps/web/lib/przelewy24.ts`
- Delete: `apps/web/app/api/checkout/create-session/route.ts`
- Delete: `apps/web/app/api/webhooks/przelewy24/route.ts`
- Delete: `apps/web/app/api/p24-test/route.ts`

- [ ] **Step 1: Delete P24 files**

```bash
rm apps/web/lib/przelewy24.ts
rm apps/web/app/api/checkout/create-session/route.ts
rm apps/web/app/api/webhooks/przelewy24/route.ts
rm apps/web/app/api/p24-test/route.ts
```

- [ ] **Step 2: Verify TypeScript compiles with 0 errors**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: **0 errors**.

- [ ] **Step 3: Full end-to-end smoke test**

Start dev server and Stripe CLI listener in separate terminals:

```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Test flow:
1. http://localhost:3000/katalog — add an ebook to cart
2. http://localhost:3000/koszyk — verify cart shows the item
3. http://localhost:3000/checkout — fill contact form, click "Przejdź do płatności →"
4. Stripe Payment Element renders — enter test card `4242 4242 4242 4242`, expiry `12/34`, CVC `123`
5. Click "Zapłać X zł" — should redirect to `/checkout/sukces`
6. Verify cart is empty after redirect
7. Check Terminal 2 — should show `200 POST /api/webhooks/stripe`
8. Check Strapi admin (http://localhost:1337/admin) — order status should be `paid`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove Przelewy24 integration"
```

---

## Railway Production Setup (post-deploy checklist)

After merging to `main` and deploying:

1. In Railway dashboard (Next.js service), set environment variables:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - Remove: `P24_MERCHANT_ID`, `P24_POS_ID`, `P24_API_KEY`, `P24_CRC_KEY`, `P24_SANDBOX`
2. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://yourdomain.pl/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`
   - Copy the signing secret → set `STRIPE_WEBHOOK_SECRET=whsec_...` in Railway
3. In Stripe Dashboard → Settings → Payment methods: enable **BLIK** and **Przelewy24** (bank transfers)
4. Redeploy Next.js service in Railway to pick up the new env vars
