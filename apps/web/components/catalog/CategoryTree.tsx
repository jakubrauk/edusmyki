"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { buildCategoryTree, getAncestorIds, type CategoryTreeNode } from "@/lib/category-utils";
import type { Category } from "@/types";

interface CategoryTreeProps {
  categories: Category[];
  selected?: string;
  onSelect: (slug: string | null) => void;
}

export function CategoryTree({ categories, selected, onSelect }: CategoryTreeProps) {
  const activeSlug = selected ?? null;
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set(activeSlug ? getAncestorIds(categories, activeSlug) : [])
  );

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const tree = buildCategoryTree(categories);

  return (
    <ul className="space-y-0.5">
      {tree.map((node) => (
        <CategoryTreeItem
          key={node.category.id}
          node={node}
          activeSlug={activeSlug}
          expanded={expanded}
          onToggle={toggle}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

interface CategoryTreeItemProps {
  node: CategoryTreeNode;
  activeSlug: string | null;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  onSelect: (slug: string | null) => void;
}

function CategoryTreeItem({ node, activeSlug, expanded, onToggle, onSelect }: CategoryTreeItemProps) {
  const { category, depth, children } = node;
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(category.id);
  const isActive = activeSlug === category.slug;

  return (
    <li>
      <div
        className="flex items-center rounded transition-colors"
        style={{
          paddingLeft: `${8 + depth * 12}px`,
          ...(isActive ? { backgroundColor: "#E2F7FA" } : {}),
        }}
      >
        <button
          onClick={() => onSelect(category.slug)}
          className="flex-1 py-1.5 text-left text-sm"
          style={{
            color: isActive ? "#4BBFCA" : depth === 0 ? "#111827" : "#374151",
            fontWeight: isActive ? 600 : depth === 0 ? 600 : 400,
          }}
        >
          {category.name}
        </button>
        {hasChildren && (
          <button
            onClick={() => onToggle(category.id)}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Zwiń ${category.name}` : `Rozwiń ${category.name}`}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            <ChevronRight
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="space-y-0.5">
          {children.map((child) => (
            <CategoryTreeItem
              key={child.category.id}
              node={child}
              activeSlug={activeSlug}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
