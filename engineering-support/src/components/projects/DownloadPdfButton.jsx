"use client";

import { ENDPOINTS } from "@/lib/endpoints";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DownloadPdfButton({ projectId, projectName = "project" }) {
  async function handleDownloadPdfClick() {
    const pdfEndpointPath = ENDPOINTS.PROJECTS.PDF(projectId);
    const pdfRequestUrl = `${API_BASE_URL}${pdfEndpointPath}`;

    const pdfDownloadResponse = await fetch(pdfRequestUrl, {
      method: "GET",
      credentials: "include"
    });

    if (!pdfDownloadResponse.ok) {
      alert("Download PDF fallito: il server non ha restituito un file valido.");
      return;
    }

    const pdfBlob = await pdfDownloadResponse.blob();
    const pdfObjectUrl = window.URL.createObjectURL(pdfBlob);

    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = pdfObjectUrl;
    downloadAnchor.download = `${projectName}.pdf`;
    downloadAnchor.click();

    window.URL.revokeObjectURL(pdfObjectUrl);
  }

  return (
    <button onClick={handleDownloadPdfClick} style={{ marginTop: 12 }}>
      Download documentation (PDF)
    </button>
  );
}
