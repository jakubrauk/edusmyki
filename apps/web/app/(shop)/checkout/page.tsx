import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "Zamówienie",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader
        pill="💳 Zamówienie"
        pillColor="#7BC44C"
        title="Realizacja zamówienia"
        description="Podaj dane, opłać i pobierz od razu"
      />
      <CheckoutForm />
    </div>
  );
}
