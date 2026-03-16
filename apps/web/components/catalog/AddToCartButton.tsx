"use client";

import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import type { Ebook } from "@/types";

interface AddToCartButtonProps {
  ebook: Ebook;
}

export function AddToCartButton({ ebook }: AddToCartButtonProps) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(ebook.id);

  function handleAdd() {
    addItem({
      ebookId: ebook.id,
      documentId: ebook.documentId,
      title: ebook.title,
      slug: ebook.slug,
      price: ebook.price,
      coverImage: ebook.coverImage,
      shortDescription: ebook.shortDescription,
    });
    toast.success("Dodano do koszyka", {
      description: ebook.title,
      action: {
        label: "Zobacz koszyk",
        onClick: () => (window.location.href = "/koszyk"),
      },
    });
  }

  if (inCart) {
    return (
      <Button size="lg" variant="secondary" disabled>
        <Check className="mr-2 h-5 w-5" />
        W koszyku
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={handleAdd}>
      <ShoppingCart className="mr-2 h-5 w-5" />
      Dodaj do koszyka
    </Button>
  );
}
