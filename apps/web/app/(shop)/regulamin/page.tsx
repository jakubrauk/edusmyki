import type { Metadata } from "next";

import RegulaminPdfViewer from "@/components/regulamin/RegulaminPdfViewerLoader";

export const metadata: Metadata = {
  title: "Regulamin",
  description: "Regulamin sklepu internetowego edusmyki.pl",
};

export default function RegulaminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: "#F5A623" }}>
        Regulamin sklepu
      </h1>
      <RegulaminPdfViewer file="/regulamin.pdf" />
      <p className="mt-4 text-center text-sm text-gray-500">
        Jeśli dokument nie wyświetla się poprawnie w przeglądarce,{" "}
        <a href="/regulamin.pdf" download className="text-[#4BBFCA] underline">
          pobierz regulamin (PDF)
        </a>.
      </p>
    </div>
  );
}
