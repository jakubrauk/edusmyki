import type { Category } from "@/types";

function buildChildrenMap(categories: Category[]): Map<number, Category[]> {
  const map = new Map<number, Category[]>();
  for (const cat of categories) {
    if (cat.parent?.id != null) {
      const existing = map.get(cat.parent.id) ?? [];
      map.set(cat.parent.id, [...existing, cat]);
    }
  }
  return map;
}

export function getCategorySubtreeIds(
  categories: Category[],
  slug: string
): number[] {
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [];

  const childrenMap = buildChildrenMap(categories);
  const result: number[] = [];
  const queue: number[] = [root.id];

  while (queue.length > 0) {
    const id = queue.shift()!;
    result.push(id);
    const children = childrenMap.get(id) ?? [];
    queue.push(...children.map((c) => c.id));
  }

  return result;
}

export function buildDisplayOrder(
  categories: Category[]
): Array<{ category: Category; depth: number }> {
  const childrenMap = buildChildrenMap(categories);
  const roots = categories
    .filter((c) => !c.parent)
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));

  const result: Array<{ category: Category; depth: number }> = [];

  function dfs(cat: Category, depth: number) {
    result.push({ category: cat, depth });
    const children = (childrenMap.get(cat.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "pl")
    );
    for (const child of children) {
      dfs(child, depth + 1);
    }
  }

  for (const root of roots) {
    dfs(root, 0);
  }

  return result;
}
