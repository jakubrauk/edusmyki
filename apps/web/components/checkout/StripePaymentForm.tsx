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
