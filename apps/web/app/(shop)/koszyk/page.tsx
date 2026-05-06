import { CartPageContent } from "@/components/cart/CartPageContent";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "Koszyk",
};

export default function KoszykPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <PageHeader
        pill="🛒 Koszyk"
        title="Twój koszyk"
        description="Sprawdź zawartość koszyka i przejdź do kasy"
      />
      <CartPageContent />
    </div>
  );
}
