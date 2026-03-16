import { Suspense } from "react";
import { getEbooks, getCategories } from "@/lib/strapi";
import { EbookGrid } from "@/components/catalog/EbookGrid";
import { CategoryFilter } from "@/components/catalog/CategoryFilter";
import { SearchBar } from "@/components/catalog/SearchBar";

interface KatalogPageProps {
  searchParams: Promise<{
    strona?: string;
    kategoria?: string;
    szukaj?: string;
  }>;
}

export const metadata = {
  title: "Katalog ebooków",
  description:
    "Przeglądaj nasze ebooki z instrukcjami dla przedszkoli i żłobków.",
};

export default async function KatalogPage({ searchParams }: KatalogPageProps) {
  const params = await searchParams;
  const page = Number(params.strona ?? 1);
  const categorySlug = params.kategoria;
  const search = params.szukaj;

  const [ebooksRes, categories] = await Promise.all([
    getEbooks({ page, pageSize: 12, categorySlug, search }),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Katalog ebooków</h1>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <SearchBar defaultValue={search} />
        <CategoryFilter categories={categories} selected={categorySlug} />
      </div>

      <Suspense fallback={<div className="py-10 text-center">Ładowanie...</div>}>
        <EbookGrid
          ebooks={ebooksRes.data}
          pagination={ebooksRes.meta.pagination}
        />
      </Suspense>
    </div>
  );
}
