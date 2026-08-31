"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CategoryTree } from "@/components/catalog/CategoryTree";
import type { Category } from "@/types";

interface CategoryMobilePanelProps {
  categories: Category[];
  selected?: string;
}

export function CategoryMobilePanel({ categories, selected }: CategoryMobilePanelProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = categories.find((c) => c.slug === selected);
  const activeLabel = activeCategory?.name ?? "Wszystkie kategorie";

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug) {
      params.delete("kategoria");
    } else {
      params.set("kategoria", slug);
    }
    params.delete("strona");
    setOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
      >
        <span>
          Kategoria: <span style={{ color: "#4BBFCA" }}>{activeLabel}</span>
        </span>
        <ChevronDown
          className="h-4 w-4 text-gray-400 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-md">
          <ul className="space-y-0.5 mb-1">
            <li>
              <button
                onClick={() => handleSelect(null)}
                className="w-full rounded px-3 py-2 text-left text-sm transition-colors"
                style={
                  !selected
                    ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                    : { color: "#374151" }
                }
              >
                Wszystkie kategorie
              </button>
            </li>
          </ul>
          <CategoryTree categories={categories} selected={selected} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}
