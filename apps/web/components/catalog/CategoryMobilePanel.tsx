"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { buildDisplayOrder } from "@/lib/category-utils";
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

  const items = buildDisplayOrder(categories);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
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
          <ul className="space-y-0.5">
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
            {items.map(({ category, depth }) => (
              <li key={category.id}>
                <button
                  onClick={() => handleSelect(category.slug)}
                  className="w-full rounded py-2 text-left text-sm transition-colors"
                  style={{
                    paddingLeft: `${12 + depth * 12}px`,
                    paddingRight: "12px",
                    ...(selected === category.slug
                      ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                      : { color: "#374151" }),
                  }}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
