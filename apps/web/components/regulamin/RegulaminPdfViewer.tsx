"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MAX_WIDTH = 800;

export default function RegulaminPdfViewer({ file }: { file: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(MAX_WIDTH);
  const [numPages, setNumPages] = useState<number>(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(Math.min(entry.contentRect.width, MAX_WIDTH));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (error) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nie udało się wczytać podglądu regulaminu.{" "}
        <a href={file} download className="text-[#4BBFCA] underline">
          Pobierz regulamin (PDF)
        </a>
        .
      </p>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-[800px]">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={() => setError(true)}
        loading={
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Wczytywanie regulaminu…
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={width}
            className="mb-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm last:mb-0"
          />
        ))}
      </Document>
    </div>
  );
}
