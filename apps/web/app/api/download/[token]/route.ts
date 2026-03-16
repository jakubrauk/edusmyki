import { NextRequest, NextResponse } from "next/server";
import { getDownloadToken, incrementDownloadCount } from "@/lib/strapi";
import { STRAPI_URL } from "@/lib/strapi";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Brak tokenu" }, { status: 400 });
  }

  try {
    const downloadToken = await getDownloadToken(token);

    if (!downloadToken) {
      return new NextResponse("Link jest nieprawidłowy lub wygasł.", {
        status: 404,
      });
    }

    // Check expiry
    if (new Date(downloadToken.expiresAt) < new Date()) {
      return new NextResponse("Link do pobrania wygasł.", { status: 410 });
    }

    // Check download limit
    if (downloadToken.downloadCount >= downloadToken.maxDownloads) {
      return new NextResponse(
        `Przekroczono limit pobrań (max ${downloadToken.maxDownloads}).`,
        { status: 429 }
      );
    }

    const pdfFile = downloadToken.ebook?.pdfFile;
    if (!pdfFile) {
      return new NextResponse("Plik ebooka jest niedostępny.", { status: 404 });
    }

    // Log download
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await incrementDownloadCount(String(downloadToken.id), ip);

    // Build file URL — for Strapi local uploads, prepend STRAPI_URL
    const fileUrl = pdfFile.url.startsWith("http")
      ? pdfFile.url
      : `${STRAPI_URL}${pdfFile.url}`;

    // Redirect to the file (Strapi serves it, or R2 presigned URL)
    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Wystąpił błąd podczas pobierania.", {
      status: 500,
    });
  }
}
