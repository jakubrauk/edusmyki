# Migracja płatności: Przelewy24 → Stripe

**Data:** 2026-05-07  
**Gałąź:** f/update  
**Zakres:** Wymiana całej integracji płatniczej z Przelewy24 na Stripe z embedded Payment Elements

---

## 1. Cel

Zastąpienie własnego wrappera Przelewy24 oficjalnym Stripe SDK. Użytkownicy płacą bez opuszczania strony (embedded Stripe Payment Element zamiast redirect do P24). Obsługiwane metody: karta, BLIK, przelewy bankowe (Stripe p24).

---

## 2. Przepływ płatności

### Krok 1 — dane klienta

```
CheckoutForm (step="contact")
  → walidacja formularza (Zod, react-hook-form)
  → POST /api/checkout/create-payment-intent
      body: { ebookIds, email, firstName, lastName, invoiceRequested, invoiceData? }
      → getEbooksByIds() — walidacja cen po stronie serwera
      → createOrder(Strapi, { status: "pending", paymentIntentId: "pending_pi" })
      → stripe.paymentIntents.create({
           amount,          // grosze (PLN * 100)
           currency: "pln",
           payment_method_types: ["card", "blik", "p24"],
           metadata: { orderNumber, strapiDocumentId }
         })
      → updateOrder(Strapi, { paymentIntentId: pi.id })
      ← { clientSecret: pi.client_secret, orderNumber }
  → setState({ step: "payment", clientSecret, orderNumber })
```

### Krok 2 — płatność

```
CheckoutForm (step="payment")
  → <Elements stripe={stripePromise} options={{ clientSecret }}>
       <StripePaymentForm />
     </Elements>
  → użytkownik wypełnia dane płatności
  → stripe.confirmPayment({
       elements,
       confirmParams: { return_url: "/checkout/sukces" }
     })
  → Stripe przekierowuje na /checkout/sukces?payment_intent=pi_...&redirect_status=succeeded
```

### Potwierdzenie (webhook)

```
POST /api/webhooks/stripe
  → stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  → event.type === "payment_intent.succeeded":
      → getOrderByPaymentIntentId(paymentIntent.id)
      → idempotency: order.status === "paid" → return 200
      → updateOrderStatus(Strapi, "paid")
      → generateDownloadTokensForOrder()
      → sendOrderConfirmationEmail()
```

---

## 3. Zmiany schematu

### Strapi — Order (`apps/cms/src/api/order/content-types/order/schema.json`)

| Pole | Zmiana |
|------|--------|
| `p24TransactionId` | Przemianowane na `paymentIntentId` |
| `p24OrderId` | Usunięte |

### TypeScript — `apps/web/types/index.ts`

```ts
// Usunięte:
p24TransactionId?: string;
P24RegisterResponse
P24WebhookPayload

// Dodane:
paymentIntentId?: string;
```

---

## 4. Pliki

### Nowe / zastępujące

| Plik | Opis |
|------|------|
| `apps/web/lib/stripe.ts` | Server-side Stripe SDK (createPaymentIntent, konstruktor klienta) |
| `apps/web/app/api/checkout/create-payment-intent/route.ts` | Zastępuje `create-session/route.ts` |
| `apps/web/app/api/webhooks/stripe/route.ts` | Zastępuje `webhooks/przelewy24/route.ts` |
| `apps/web/components/checkout/StripePaymentForm.tsx` | Nowy komponent: `<PaymentElement>` + obsługa błędów |

### Modyfikowane

| Plik | Zmiana |
|------|--------|
| `apps/web/components/checkout/CheckoutForm.tsx` | Dodanie kroków `contact` / `payment`, usunięcie redirect URL |
| `apps/web/lib/strapi.ts` | `getOrderByP24SessionId` → `getOrderByPaymentIntentId` |
| `apps/web/types/index.ts` | Wymiana typów P24 na Stripe |
| `apps/cms/.../order/schema.json` | `p24TransactionId` → `paymentIntentId`, usunięcie `p24OrderId` |

### Usuwane

| Plik |
|------|
| `apps/web/lib/przelewy24.ts` |
| `apps/web/app/api/checkout/create-session/route.ts` |
| `apps/web/app/api/webhooks/przelewy24/route.ts` |
| `apps/web/app/api/p24-test/route.ts` |

---

## 5. Zmienne środowiskowe

### Usuwane

```
P24_MERCHANT_ID
P24_POS_ID
P24_API_KEY
P24_CRC_KEY
P24_SANDBOX
```

### Dodawane

```bash
STRIPE_SECRET_KEY=sk_live_...               # server-side
STRIPE_WEBHOOK_SECRET=whsec_...             # weryfikacja webhooków
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # client-side
```

---

## 6. Nowe pakiety

```bash
# apps/web
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

---

## 7. Obsługa błędów

- **Karta odrzucona / błąd Stripe:** `stripe.confirmPayment()` zwraca `error` — wyświetlamy inline pod `<PaymentElement>`, użytkownik może spróbować ponownie bez przeładowania
- **Strona sukcesu:** weryfikuje `redirect_status` z URL query params; `!== "succeeded"` → redirect na `/checkout/blad`
- **Webhook idempotentność:** sprawdzamy `order.status === "paid"` przed przetwarzaniem
- **Webhook raw body:** `req.text()` + `Buffer.from(body)` — wymagane przez Stripe do weryfikacji podpisu

---

## 8. Decyzje

- **Embedded Elements (nie Checkout hosted):** lepsza UX, użytkownik nie opuszcza sklepu
- **Dwuetapowy formularz:** PaymentIntent tworzony dopiero po walidacji danych kontaktowych — minimalizuje porzucone PaymentIntenty
- **Przemianowanie schematu (nie nowe pole):** czystsza baza, brak historycznych zamówień P24 do zachowania
- **Webhook jako autorytatywne źródło prawdy:** strona sukcesu pokazuje potwierdzenie na podstawie `redirect_status` (UX), ale faktyczne przetwarzanie zamówienia zawsze przez webhook
