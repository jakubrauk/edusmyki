import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = {
  title: "Zamówienie",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Realizacja zamówienia</h1>
      <CheckoutForm />
    </div>
  );
}
