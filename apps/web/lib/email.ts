import { Resend } from "resend";
import type { Order, DownloadToken } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "zamowienia@edusmyki.pl";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edusmyki.pl";

export async function sendOrderConfirmationEmail(
  order: Order,
  downloadTokens: DownloadToken[]
): Promise<void> {
  const downloadLinks = downloadTokens.map((dt) => ({
    title: dt.ebook.title,
    url: `${APP_URL}/api/download/${dt.token}`,
    expiresAt: dt.expiresAt,
    maxDownloads: dt.maxDownloads,
  }));

  await resend.emails.send({
    from: FROM,
    to: order.guestEmail!,
    subject: `Twoje zamówienie #${order.orderNumber} - edusmyki.pl`,
    html: buildOrderEmailHtml(order, downloadLinks),
  });
}

function buildOrderEmailHtml(
  order: Order,
  links: Array<{ title: string; url: string; expiresAt: string; maxDownloads: number }>
): string {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const linksHtml = links
    .map(
      (l) => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
      <p style="font-weight:600;margin:0 0 8px;">${l.title}</p>
      <a href="${l.url}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">
        Pobierz PDF
      </a>
      <p style="color:#6b7280;font-size:12px;margin:8px 0 0;">
        Link ważny do ${formatDate(l.expiresAt)} · max ${l.maxDownloads} pobrań
      </p>
    </div>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h1 style="color:#1e40af;">edusmyki.pl</h1>
      <h2>Dziękujemy za zamówienie!</h2>
      <p>Cześć ${order.guestFirstName},</p>
      <p>Twoje zamówienie nr <strong>#${order.orderNumber}</strong> zostało opłacone.</p>
      <p>Poniżej znajdziesz linki do pobrania zakupionych ebooków:</p>
      ${linksHtml}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#6b7280;font-size:12px;">
        Problemy z pobieraniem? Napisz do nas: kontakt@edusmyki.pl
      </p>
    </div>
  `;
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Witaj w edusmyki.pl!",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#1e40af;">edusmyki.pl</h1>
        <h2>Witaj, ${firstName}!</h2>
        <p>Cieszmy się, że dołączyłeś/aś do naszej społeczności.</p>
        <p>Odkryj nasze <a href="${APP_URL}/katalog">ebooki dla przedszkoli i żłobków</a>.</p>
      </div>
    `,
  });
}
