"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface CategoryChipsProps {
  categories: Category[];
  selected?: string;
}

export function CategoryChips({ categories, selected }: CategoryChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug || slug === "wszystkie") {
      params.delete("kategoria");
    } else {
      params.set("kategoria", slug);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeSlug = selected ?? "wszystkie";

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      <button
        onClick={() => handleSelect(null)}
        className="shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors"
        style={
          activeSlug === "wszystkie"
            ? { borderColor: "#4BBFCA", backgroundColor: "#E2F7FA", color: "#4BBFCA" }
            : { borderColor: "#e5e7eb", backgroundColor: "white", color: "#6b7280" }
        }
      >
        Wszystkie
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.slug)}
          className="shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors"
          style={
            activeSlug === cat.slug
              ? { borderColor: "#4BBFCA", backgroundColor: "#E2F7FA", color: "#4BBFCA" }
              : { borderColor: "#e5e7eb", backgroundColor: "white", color: "#6b7280" }
          }
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
