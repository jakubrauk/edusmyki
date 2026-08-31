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

export interface CategoryTreeNode {
  category: Category;
  depth: number;
  children: CategoryTreeNode[];
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const childrenMap = buildChildrenMap(categories);
  const roots = categories
    .filter((c) => !c.parent)
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));

  function build(cat: Category, depth: number): CategoryTreeNode {
    const children = (childrenMap.get(cat.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "pl")
    );
    return {
      category: cat,
      depth,
      children: children.map((child) => build(child, depth + 1)),
    };
  }

  return roots.map((root) => build(root, 0));
}

export function getAncestorIds(categories: Category[], slug: string): number[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const start = categories.find((c) => c.slug === slug);
  if (!start) return [];

  const result: number[] = [];
  let current = start.parent?.id != null ? byId.get(start.parent.id) : undefined;
  while (current) {
    result.push(current.id);
    current = current.parent?.id != null ? byId.get(current.parent.id) : undefined;
  }
  return result;
}
