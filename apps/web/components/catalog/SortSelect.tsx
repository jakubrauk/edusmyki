"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  value?: string;
}

const SORT_OPTIONS = [
  { value: "najnowsze", label: "Najnowsze" },
  { value: "cena-rosnaco", label: "Cena rosnąco" },
  { value: "cena-malejaco", label: "Cena malejąco" },
  { value: "alfabetycznie", label: "Alfabetycznie A–Z" },
] as const;

export function SortSelect({ value }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(val: string | null) {
    if (!val) return;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "najnowsze") {
      params.delete("sortowanie");
    } else {
      params.set("sortowanie", val);
    }
    params.delete("strona");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={value ?? "najnowsze"} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Sortowanie" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
