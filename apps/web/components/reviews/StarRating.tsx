"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, max = 5, size = "md" }: StarRatingProps) {
  const isInteractive = !!onChange;
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={!isInteractive}
            onClick={() => onChange?.(starValue)}
            className={
              isInteractive
                ? "cursor-pointer transition-transform hover:scale-110"
                : "cursor-default"
            }
            aria-label={isInteractive ? `Ocena ${starValue} z ${max}` : undefined}
          >
            <Star
              className={`${iconClass} ${filled ? "fill-current" : ""}`}
              style={{ color: "#F5A623" }}
            />
          </button>
        );
      })}
    </div>
  );
}
