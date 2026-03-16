"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, BookOpen } from "lucide-react";
import { STRAPI_URL } from "@/lib/strapi";

export function CartPageContent() {
  const { items, removeItem, totalPrice, totalItems } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-semibold text-gray-600">
          Twój koszyk jest pusty
        </h2>
        <p className="mb-6 text-gray-500">
          Dodaj ebooki, aby rozpocząć zakupy
        </p>
        <Button asChild>
          <Link href="/katalog">Przeglądaj katalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Items list */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => {
          const coverUrl = item.coverImage?.url
            ? item.coverImage.url.startsWith("http")
              ? item.coverImage.url
              : `${STRAPI_URL}${item.coverImage.url}`
            : null;

          return (
            <Card key={item.ebookId}>
              <CardContent className="flex gap-4 pt-4">
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                  {coverUrl ? (
                    <Image src={coverUrl} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/katalog/${item.slug}`} className="font-semibold hover:text-blue-600">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {item.shortDescription}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600">
                      {item.price.toFixed(2)} zł
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.ebookId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Podsumowanie</h2>
            <div className="flex justify-between text-sm">
              <span>Liczba ebooków:</span>
              <span>{totalItems()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Łącznie:</span>
              <span className="text-blue-600">{totalPrice().toFixed(2)} zł</span>
            </div>
            <p className="text-xs text-gray-500">Ceny zawierają VAT</p>
            <Button asChild className="w-full" size="lg">
              <Link href="/checkout">Przejdź do kasy</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/katalog">Kontynuuj zakupy</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
