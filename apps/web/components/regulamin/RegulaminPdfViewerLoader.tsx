"use client";

import dynamic from "next/dynamic";

// pdfjs-dist uzywa API niedostepnego w Node < 22 przy SSR, wiec ladujemy tylko w przegladarce
const RegulaminPdfViewer = dynamic(() => import("./RegulaminPdfViewer"), {
  ssr: false,
});

export default RegulaminPdfViewer;
