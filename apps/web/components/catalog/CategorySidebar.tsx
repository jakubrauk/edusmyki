"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { buildDisplayOrder } from "@/lib/category-utils";
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

  const items = buildDisplayOrder(categories);

  return (
    <nav aria-label="Kategorie">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Kategorie
      </p>
      <ul className="space-y-0.5">
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
        {items.map(({ category, depth }) => (
          <li key={category.id}>
            <button
              onClick={() => handleSelect(category.slug)}
              className="w-full rounded px-2 py-1.5 text-left text-sm transition-colors"
              style={{
                paddingLeft: `${8 + depth * 12}px`,
                ...(activeSlug === category.slug
                  ? { backgroundColor: "#E2F7FA", color: "#4BBFCA", fontWeight: 600 }
                  : { color: "#374151" }),
              }}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
