"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm overflow-visible">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo_noback.png"
            alt="EduSmyk logo"
            width={110}
            height={110}
            className="object-contain relative z-10"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/katalog"
            className="text-sm font-medium text-gray-700 hover:text-[#4BBFCA] transition-colors"
          >
            Katalog
          </Link>
          <Link
            href="/konto"
            className="text-sm font-medium text-gray-700 hover:text-[#4BBFCA] transition-colors flex items-center gap-1"
          >
            <User className="h-4 w-4" />
            Konto
          </Link>
          <Button asChild variant="ghost" size="icon" className="relative hover:text-[#F5A623]">
            <Link href="/koszyk">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#F5A623] text-white border-0">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Koszyk</span>
            </Link>
          </Button>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/koszyk">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#F5A623] text-white border-0">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger className="rounded-lg p-2 hover:bg-muted">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent className="flex flex-col p-0">
              <div className="flex items-center gap-2 px-6 pt-6 pb-4 border-b">
                <Image src="/logo_noback.png" alt="EduSmyk" width={44} height={44} className="object-contain" />
                <span className="font-bold text-lg" style={{ color: "#F5A623" }}>edusmyki.pl</span>
              </div>
              <nav className="flex flex-col gap-1 px-3 py-4">
                <Link
                  href="/katalog"
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-[#4BBFCA]/10 hover:text-[#4BBFCA]"
                >
                  <LayoutGrid className="h-5 w-5 text-gray-400 transition-colors group-hover:text-[#4BBFCA]" />
                  Katalog
                </Link>
                <Link
                  href="/konto"
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-[#4BBFCA]/10 hover:text-[#4BBFCA]"
                >
                  <User className="h-5 w-5 text-gray-400 transition-colors group-hover:text-[#4BBFCA]" />
                  Konto
                </Link>
                <Link
                  href="/koszyk"
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-gray-800 transition-colors hover:bg-[#4BBFCA]/10 hover:text-[#4BBFCA]"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-400 transition-colors group-hover:text-[#4BBFCA]" />
                  Koszyk
                  {mounted && totalItems > 0 && (
                    <Badge className="ml-auto h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#F5A623] text-white border-0">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              </nav>
              <div className="mt-auto p-4 border-t">
                <Button
                  asChild
                  className="w-full gap-2 bg-[#F5A623] hover:bg-[#e0951d] text-white"
                >
                  <Link href="/katalog">
                    Przeglądaj katalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
