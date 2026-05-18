"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  ebookDocumentId: string;
  ebookTitle: string;
  /** Guest mode — base64url-encoded email */
  guestEmail?: string;
  /** Guest mode — HMAC-SHA256 signature */
  guestSig?: string;
  /** Render form directly without dialog trigger (for /opinia page) */
  inline?: boolean;
}

type FormStatus = "idle" | "loading" | "success" | "duplicate" | "error";

function ReviewFormFields({
  ebookDocumentId,
  ebookTitle,
  guestEmail,
  guestSig,
  onSuccess,
}: ReviewFormProps & { onSuccess?: () => void }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg("Wybierz ocenę gwiazdkową.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const body: Record<string, unknown> = {
      ebookDocumentId,
      rating,
      content,
      authorName,
      ...(authorRole && { authorRole }),
      ...(guestEmail && { guestEmail }),
      ...(guestSig && { guestSig }),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setErrorMsg(data.error || "Wystąpił błąd. Spróbuj ponownie.");
        setStatus("error");
        return;
      }

      setStatus("success");
      onSuccess?.();
    } catch {
      setErrorMsg("Błąd połączenia. Spróbuj ponownie.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="py-6 text-center space-y-2">
        <p className="text-lg font-semibold" style={{ color: "#7BC44C" }}>
          Dziękujemy za opinię!
        </p>
        <p className="text-sm text-gray-500">
          Opinia czeka na moderację i pojawi się wkrótce na stronie.
        </p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-600">
          Już dodałeś/aś opinię do ebooka <strong>{ebookTitle}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block text-sm font-medium">Ocena *</Label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <Label htmlFor="review-content" className="mb-1 block text-sm font-medium">
          Treść opinii *{" "}
          <span className="font-normal text-gray-400">({content.length}/500)</span>
        </Label>
        <textarea
          id="review-content"
          required
          maxLength={500}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 resize-none"
          style={{ "--tw-ring-color": "#F5A623" } as React.CSSProperties}
          placeholder="Opisz swoje doświadczenie z tym materiałem..."
        />
      </div>

      <div>
        <Label htmlFor="review-name" className="mb-1 block text-sm font-medium">
          Imię lub pseudonim *
        </Label>
        <Input
          id="review-name"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="np. Anna K."
        />
      </div>

      <div>
        <Label htmlFor="review-role" className="mb-1 block text-sm font-medium">
          Rola / stanowisko{" "}
          <span className="font-normal text-gray-400">(opcjonalne)</span>
        </Label>
        <Input
          id="review-role"
          value={authorRole}
          onChange={(e) => setAuthorRole(e.target.value)}
          placeholder="np. Właścicielka żłobka, Warszawa"
        />
      </div>

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 w-full rounded-full text-white font-semibold"
        style={{ backgroundColor: "#F5A623" }}
      >
        {status === "loading" ? "Wysyłanie..." : "Wyślij opinię"}
      </Button>
    </form>
  );
}

export function ReviewForm(props: ReviewFormProps) {
  const [open, setOpen] = useState(false);

  if (props.inline) {
    return <ReviewFormFields {...props} />;
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="rounded-full border-2 font-semibold"
        style={{ borderColor: "#F5A623", color: "#F5A623" }}
      >
        <Star className="mr-2 h-4 w-4" />
        Dodaj opinię
      </Button>
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold leading-snug">
              Opinia o: {props.ebookTitle}
            </DialogTitle>
          </DialogHeader>
          <ReviewFormFields
            {...props}
            onSuccess={() => setTimeout(() => setOpen(false), 2000)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
