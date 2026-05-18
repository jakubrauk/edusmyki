import { StarRating } from "./StarRating";
import type { Review } from "@/types";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-4">
        Brak opinii. Bądź pierwszy!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
        >
          <StarRating value={review.rating} size="sm" />
          <p className="mt-3 text-gray-700 leading-relaxed text-sm">
            &ldquo;{review.content}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: "#F5A623" }}
            >
              {review.authorName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {review.authorName}
              </p>
              {review.authorRole && (
                <p className="text-xs text-gray-400">{review.authorRole}</p>
              )}
            </div>
            <span className="ml-auto shrink-0 text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString("pl-PL", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
