import { getEbooks, getCategories } from "@/lib/strapi";

export const revalidate = 3600;

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

  const [ebooksRes, categories] = await Promise.all([
    getEbooks({ pageSize: 200 }).catch(() => ({ data: [] as Awaited<ReturnType<typeof getEbooks>>["data"] })),
    getCategories().catch(() => [] as Awaited<ReturnType<typeof getCategories>>),
  ]);

  const lines: string[] = [
    `# edusmyki.pl`,
    ``,
    `> Gotowe materiały PDF dla żłobków i przedszkoli – procedury, regulaminy, scenariusze zajęć i dokumentacja.`,
    ``,
    `## Sklep`,
    ``,
    `- [Strona główna](${BASE_URL}): Wyróżnione materiały i kategorie`,
    `- [Katalog](${BASE_URL}/katalog): Wszystkie dostępne materiały`,
    ``,
  ];

  if (categories.length > 0) {
    lines.push(`## Kategorie`, ``);
    for (const cat of categories) {
      lines.push(`- [${cat.name}](${BASE_URL}/katalog?kategoria=${cat.slug})`);
    }
    lines.push(``);
  }

  if (ebooksRes.data.length > 0) {
    lines.push(`## Materiały`, ``);
    for (const ebook of ebooksRes.data) {
      const desc = ebook.shortDescription?.trim().replace(/\n/g, " ") ?? "";
      lines.push(`- [${ebook.title}](${BASE_URL}/katalog/${ebook.slug})${desc ? `: ${desc}` : ""}`);
    }
    lines.push(``);
  }

  lines.push(
    `## Informacje`,
    ``,
    `- Płatności: Przelewy24 (BLIK, karta, przelew)`,
    `- Format plików: PDF do pobrania`,
    `- Dostęp po zakupie: link do pobrania wysyłany na email`,
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
