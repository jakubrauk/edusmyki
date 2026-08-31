"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CategoryTree } from "@/components/catalog/CategoryTree";
import type { Category } from "@/types";

interface CategorySidebarProps {
  categories: Category[];
  selected?: string;
}

export function CategorySidebar({ categories, selected }: CategorySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = selected ?? null;

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!slug) {
      params.delete("kategoria");
    } else {
      params.set("kategoria", slug);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav aria-label="Kategorie">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Kategorie
      </p>
      <ul className="space-y-0.5 mb-1">
        <li>
          <button
            onClick={() => handleSelect(null)}
            className="w-full rounded px-2 py-1.5 text-left text-sm transition-colors"
            style={
              !activeSlug
                ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                : { color: "#374151" }
            }
          >
            Wszystkie kategorie
          </button>
        </li>
      </ul>
      <CategoryTree categories={categories} selected={selected} onSelect={handleSelect} />
    </nav>
  );
}
