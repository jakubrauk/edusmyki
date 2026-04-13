"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const checkoutSchema = z.object({
  email: z.string().email("Podaj prawidłowy adres email"),
  firstName: z.string().min(2, "Imię jest za krótkie").max(50),
  lastName: z.string().min(2, "Nazwisko jest za krótkie").max(50),
  invoiceRequested: z.boolean(),
  companyName: z.string().optional(),
  nip: z
    .string()
    .regex(/^\d{10}$/, "NIP musi mieć 10 cyfr")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z
    .string()
    .regex(/^\d{2}-\d{3}$/, "Format: XX-XXX")
    .optional()
    .or(z.literal("")),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "Musisz zaakceptować regulamin"),
  digitalDeliveryConsent: z
    .boolean()
    .refine(
      (val) => val === true,
      "Zgoda na dostarczenie treści cyfrowej jest wymagana"
    ),
  marketingConsent: z.boolean().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      invoiceRequested: false,
      termsAccepted: undefined,
      digitalDeliveryConsent: undefined,
    },
  });

  const invoiceRequested = watch("invoiceRequested");

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="mb-4 text-gray-500">Twój koszyk jest pusty.</p>
        <Button asChild>
          <Link href="/katalog">Wróć do katalogu</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(data: CheckoutFormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookIds: items.map((i) => i.ebookId),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          invoiceRequested: data.invoiceRequested,
          ...(data.invoiceRequested && {
            invoiceData: {
              companyName: data.companyName,
              nip: data.nip,
              address: data.address,
              city: data.city,
              postalCode: data.postalCode,
              country: "PL",
            },
          }),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Błąd serwera");
      }

      clearCart();
      router.push(json.paymentUrl);
    } catch (error) {
      toast.error("Błąd podczas składania zamówienia", {
        description: error instanceof Error ? error.message : "Spróbuj ponownie",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">Przekierowywanie do płatności...</p>
        <p className="text-sm text-gray-500">Za chwilę zostaniesz przeniesiony na stronę Przelewy24.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact data */}
          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.pl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Imię *</Label>
                  <Input id="firstName" {...register("firstName")} />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Nazwisko *</Label>
                  <Input id="lastName" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice */}
          <Card>
            <CardHeader>
              <CardTitle>Faktura VAT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="invoiceRequested"
                  {...register("invoiceRequested")}
                  className="h-4 w-4"
                />
                <Label htmlFor="invoiceRequested" className="cursor-pointer">
                  Chcę otrzymać fakturę VAT
                </Label>
              </div>

              {invoiceRequested && (
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="companyName">Nazwa firmy</Label>
                    <Input id="companyName" {...register("companyName")} />
                  </div>
                  <div>
                    <Label htmlFor="nip">NIP (10 cyfr)</Label>
                    <Input id="nip" placeholder="1234567890" {...register("nip")} />
                    {errors.nip && (
                      <p className="mt-1 text-sm text-red-500">{errors.nip.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input id="address" {...register("address")} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="postalCode">Kod pocztowy</Label>
                      <Input id="postalCode" placeholder="00-000" {...register("postalCode")} />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">Miasto</Label>
                      <Input id="city" {...register("city")} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle>Zgody</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  {...register("termsAccepted")}
                  className="mt-0.5 h-4 w-4"
                />
                <Label htmlFor="termsAccepted" className="cursor-pointer text-sm leading-relaxed">
                  Akceptuję{" "}
                  <Link href="/regulamin" className="text-blue-600 underline" target="_blank">
                    regulamin
                  </Link>{" "}
                  i{" "}
                  <Link href="/polityka-prywatnosci" className="text-blue-600 underline" target="_blank">
                    politykę prywatności
                  </Link>{" "}
                  *
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="digitalDeliveryConsent"
                  {...register("digitalDeliveryConsent")}
                  className="mt-0.5 h-4 w-4"
                />
                <Label htmlFor="digitalDeliveryConsent" className="cursor-pointer text-sm leading-relaxed">
                  Wyrażam zgodę na natychmiastowe dostarczenie treści cyfrowej i potwierdzam
                  utratę prawa do odstąpienia od umowy po dostarczeniu pliku. *
                </Label>
              </div>
              {errors.digitalDeliveryConsent && (
                <p className="text-sm text-red-500">{errors.digitalDeliveryConsent.message}</p>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  {...register("marketingConsent")}
                  className="mt-0.5 h-4 w-4"
                />
                <Label htmlFor="marketingConsent" className="cursor-pointer text-sm leading-relaxed">
                  Wyrażam zgodę na otrzymywanie informacji marketingowych drogą elektroniczną.
                  (opcjonalne)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Twoje zamówienie</h2>
              {items.map((item) => (
                <div key={item.ebookId} className="flex justify-between text-sm">
                  <span className="text-gray-700 pr-4 line-clamp-2">{item.title}</span>
                  <span className="shrink-0 font-medium">{item.price.toFixed(2)} zł</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Łącznie:</span>
                <span className="text-blue-600">{totalPrice().toFixed(2)} zł</span>
              </div>
              <p className="text-xs text-gray-500">
                Płatność obsługiwana przez Przelewy24 (BLIK, karta, przelew)
              </p>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Przekierowywanie...
                  </>
                ) : (
                  "Zapłać i pobierz"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
