import { v4 as uuidv4 } from "uuid";
import { addDays } from "date-fns";
import { createDownloadToken } from "./strapi";
import type { Order, DownloadToken } from "@/types";

const EXPIRY_DAYS = Number(process.env.DOWNLOAD_TOKEN_EXPIRY_DAYS ?? 30);
const MAX_DOWNLOADS = Number(process.env.DOWNLOAD_MAX_COUNT ?? 5);

export async function generateDownloadTokensForOrder(order: Order): Promise<DownloadToken[]> {
  const email = order.guestEmail!;
  const results: DownloadToken[] = [];

  for (const item of order.items) {
    const token = uuidv4();
    const expiresAt = addDays(new Date(), EXPIRY_DAYS).toISOString();

    const created = await createDownloadToken({
      token,
      order: order.id,
      ebook: item.ebook.id,
      email,
      expiresAt,
      maxDownloads: MAX_DOWNLOADS,
    });

    // Merge with ebook data already populated from order — avoids a separate
    // re-fetch that could return a cached (stale) response.
    results.push({ ...created, ebook: item.ebook });
  }

  return results;
}
