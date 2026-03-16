import type { Ebook, Category, Order, DownloadToken, StrapiResponse } from "@/types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${STRAPI_URL}/api${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Strapi API error ${res.status}: ${error}`);
  }

  return res.json();
}

// ── Ebooks ──────────────────────────────────────────────────────────────────

export async function getEbooks(params?: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  search?: string;
  featured?: boolean;
}): Promise<StrapiResponse<Ebook[]>> {
  const qs = new URLSearchParams({
    "populate[coverImage]": "true",
    "populate[categories]": "true",
    "pagination[page]": String(params?.page ?? 1),
    "pagination[pageSize]": String(params?.pageSize ?? 12),
    "sort": "createdAt:desc",
  });

  if (params?.categorySlug) {
    qs.set("filters[categories][slug][$eq]", params.categorySlug);
  }

  if (params?.search) {
    qs.set("filters[$or][0][title][$containsi]", params.search);
    qs.set("filters[$or][1][shortDescription][$containsi]", params.search);
  }

  if (params?.featured) {
    qs.set("filters[isFeatured][$eq]", "true");
  }

  return strapiRequest<StrapiResponse<Ebook[]>>(`/ebooks?${qs}`);
}

export async function getEbookBySlug(slug: string): Promise<Ebook | null> {
  const qs = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate[coverImage]": "true",
    "populate[categories]": "true",
  });

  const res = await strapiRequest<StrapiResponse<Ebook[]>>(`/ebooks?${qs}`);
  return res.data[0] ?? null;
}

export async function getEbooksByIds(ids: number[]): Promise<Ebook[]> {
  if (ids.length === 0) return [];

  const qs = new URLSearchParams({
    "populate[coverImage]": "true",
  });
  ids.forEach((id, i) => {
    qs.set(`filters[id][$in][${i}]`, String(id));
  });

  const res = await strapiRequest<StrapiResponse<Ebook[]>>(`/ebooks?${qs}`);
  return res.data;
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await strapiRequest<StrapiResponse<Category[]>>(
    "/categories?sort=name:asc"
  );
  return res.data;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  orderNumber: string;
  status: "pending";
  items: Array<{ ebook: number; ebookTitle: string; price: number }>;
  totalAmount: number;
  guestEmail: string;
  guestFirstName: string;
  guestLastName: string;
  invoiceRequested: boolean;
  invoiceData?: object;
  p24TransactionId: string;
}): Promise<Order> {
  const res = await strapiRequest<{ data: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify({ data }),
    next: { revalidate: 0 },
  });
  return res.data;
}

export async function updateOrderStatus(
  documentId: string,
  status: "paid" | "cancelled" | "refunded",
  p24OrderId?: string
): Promise<Order> {
  const res = await strapiRequest<{ data: Order }>(`/orders/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        status,
        ...(status === "paid" && { paidAt: new Date().toISOString() }),
        ...(p24OrderId && { p24OrderId }),
      },
    }),
    next: { revalidate: 0 },
  });
  return res.data;
}

export async function getOrderByP24SessionId(sessionId: string): Promise<Order | null> {
  const qs = new URLSearchParams({
    "filters[p24TransactionId][$eq]": sessionId,
    "populate[items][populate][ebook]": "true",
  });

  const res = await strapiRequest<StrapiResponse<Order[]>>(`/orders?${qs}`);
  return res.data[0] ?? null;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const qs = new URLSearchParams({
    "filters[guestEmail][$eq]": email,
    "populate[items][populate][ebook][populate][coverImage]": "true",
    "sort": "createdAt:desc",
  });

  const res = await strapiRequest<StrapiResponse<Order[]>>(`/orders?${qs}`);
  return res.data;
}

// ── Download Tokens ───────────────────────────────────────────────────────────

export async function createDownloadToken(data: {
  token: string;
  order: number;
  ebook: number;
  email: string;
  expiresAt: string;
  maxDownloads: number;
}): Promise<DownloadToken> {
  const res = await strapiRequest<{ data: DownloadToken }>("/download-tokens", {
    method: "POST",
    body: JSON.stringify({ data }),
    next: { revalidate: 0 },
  });
  return res.data;
}

export async function getDownloadToken(token: string): Promise<DownloadToken | null> {
  const qs = new URLSearchParams({
    "filters[token][$eq]": token,
    "populate[ebook][populate][pdfFile]": "true",
    "populate[order]": "true",
  });

  const res = await strapiRequest<StrapiResponse<DownloadToken[]>>(
    `/download-tokens?${qs}`
  );
  return res.data[0] ?? null;
}

export async function incrementDownloadCount(
  documentId: string,
  ipAddress: string
): Promise<void> {
  const token = await strapiRequest<{ data: DownloadToken }>(
    `/download-tokens/${documentId}`
  );
  const currentCount = (token.data as DownloadToken).downloadCount ?? 0;

  await strapiRequest(`/download-tokens/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        downloadCount: currentCount + 1,
        lastDownloadedAt: new Date().toISOString(),
        ipAddress,
      },
    }),
    next: { revalidate: 0 },
  });
}

export async function getDownloadTokensByEmail(email: string): Promise<DownloadToken[]> {
  const qs = new URLSearchParams({
    "filters[email][$eq]": email,
    "populate[ebook][populate][coverImage]": "true",
    "sort": "createdAt:desc",
  });

  const res = await strapiRequest<StrapiResponse<DownloadToken[]>>(
    `/download-tokens?${qs}`
  );
  return res.data;
}

export { STRAPI_URL };
