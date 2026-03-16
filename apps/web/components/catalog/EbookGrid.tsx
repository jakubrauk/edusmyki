import Link from "next/link";
import { EbookCard } from "./EbookCard";
import { Button } from "@/components/ui/button";
import type { Ebook } from "@/types";

interface EbookGridProps {
  ebooks: Ebook[];
  pagination?: {
    page: number;
    pageCount: number;
    total: number;
  };
}

export function EbookGrid({ ebooks, pagination }: EbookGridProps) {
  if (ebooks.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="text-lg">Nie znaleziono ebooków</p>
        <p className="mt-2 text-sm">Spróbuj zmienić filtry wyszukiwania</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {ebooks.map((ebook) => (
          <EbookCard key={ebook.id} ebook={ebook} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pageCount > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {pagination.page > 1 && (
            <Button asChild variant="outline">
              <Link href={`?strona=${pagination.page - 1}`}>Poprzednia</Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-gray-600">
            Strona {pagination.page} z {pagination.pageCount}
          </span>
          {pagination.page < pagination.pageCount && (
            <Button asChild variant="outline">
              <Link href={`?strona=${pagination.page + 1}`}>Następna</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
