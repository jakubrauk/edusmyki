"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LogowaniePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-3">
            <div className="text-4xl">📬</div>
            <p className="text-lg font-semibold">Sprawdź skrzynkę!</p>
            <p className="text-gray-500 text-sm">
              Wysłaliśmy link logowania na <strong>{email}</strong>.<br />
              Link jest ważny przez 15 minut.
            </p>
            <p className="text-xs text-gray-400">Nie widzisz? Sprawdź folder SPAM.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center mb-2">
            <Image src="/logo.jpeg" alt="EduSmyki" width={56} height={56} className="rounded-full" />
          </Link>
          <CardTitle>Zaloguj się do EduSmyki</CardTitle>
          <p className="text-sm text-gray-500">
            Wpisz email użyty przy zakupie — wyślemy Ci link logowania.
          </p>
        </CardHeader>
        <CardContent>
          {error === "invalid_token" && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              Link wygasł lub był już użyty. Poproś o nowy poniżej.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#F5A623] hover:bg-[#e09410]"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Wyślij link logowania"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
