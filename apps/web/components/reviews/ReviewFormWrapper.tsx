"use client";

import { useEffect, useState } from "react";
import { ReviewForm } from "./ReviewForm";

interface Props {
  ebookDocumentId: string;
  ebookTitle: string;
}

export function ReviewFormWrapper({ ebookDocumentId, ebookTitle }: Props) {
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetch("/api/user/purchases")
      .then((r) => r.json())
      .then((data: { ebookDocumentIds: string[] }) => {
        setHasPurchased(data.ebookDocumentIds.includes(ebookDocumentId));
      })
      .catch(() => {});
  }, [ebookDocumentId]);

  if (!hasPurchased) return null;

  return <ReviewForm ebookDocumentId={ebookDocumentId} ebookTitle={ebookTitle} />;
}
