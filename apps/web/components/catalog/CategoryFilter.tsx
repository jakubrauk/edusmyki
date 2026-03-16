"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selected?: string;
}

export function CategoryFilter({ categories, selected }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "wszystkie") {
      params.delete("kategoria");
    } else {
      params.set("kategoria", value);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={selected ?? "wszystkie"} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Kategoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="wszystkie">Wszystkie kategorie</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.slug}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
