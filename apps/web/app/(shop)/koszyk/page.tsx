import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata = {
  title: "Koszyk",
};

export default function KoszykPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Koszyk</h1>
      <CartPageContent />
    </div>
  );
}
