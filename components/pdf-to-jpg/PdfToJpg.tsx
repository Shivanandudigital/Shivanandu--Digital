"use client";
/* eslint-disable @next/next/no-img-element -- Generated PDF page Data URLs require native img elements. */

import { ChangeEvent, useState } from "react";

type RenderedPage = {
  pageNumber: number;
  dataUrl: string;
};

type JpgQuality = "standard" | "high" | "maximum";

const qualityOptions: Record<
  JpgQuality,
  { label: string; value: number; description: string }
> = {
  standard: {
    label: "Standard (85%)",
    value: 0.85,
    description: "Smaller files for quick sharing",
  },
  high: {
    label: "High Quality (92%)",
    value: 0.92,
    description: "Best balance of clarity and file size",
  },
  maximum: {
    label: "Maximum Quality (100%)",
    value: 1,
    description: "Largest files with maximum JPG quality",
  },
};

export default function PdfToJpg() {
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [fileName, setFileName] = useState("document");
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState<JpgQuality>("high");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      setPages([]);
      setSelectedPage(null);
      setProgress(5);
      setFileName(file.name.replace(/\.pdf$/i, "") || "document");

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const pdfDocument = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const renderedPages: RenderedPage[] = [];

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.75 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas is not available");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        renderedPages.push({
          pageNumber,
          dataUrl: canvas.toDataURL("image/jpeg", qualityOptions[quality].value),
        });
        setProgress(Math.round((pageNumber / pdfDocument.numPages) * 100));
      }

      setPages(renderedPages);
      setSelectedPage(renderedPages[0]?.pageNumber ?? null);
      await pdfDocument.cleanup();
    } catch (cause) {
      console.error(cause);
      setError("This PDF could not be converted. It may be password protected or invalid.");
      setProgress(0);
    } finally {
      setIsConverting(false);
    }
  }

  function downloadPage(page: RenderedPage) {
    const link = document.createElement("a");
    link.href = page.dataUrl;
    link.download = `${fileName}-page-${page.pageNumber}.jpg`;
    link.click();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Convert PDF pages to JPG</h2>
          <p className="mt-1 text-sm text-slate-500">Render crisp JPGs directly from your PDF pages.</p>
        </div>
        <label className="cursor-pointer self-start rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700">
          Choose PDF
          <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
        </label>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,260px)_1fr] sm:items-end">
          <label className="block text-sm font-semibold text-slate-700">
            JPG quality
            <select
              value={quality}
              disabled={isConverting}
              onChange={(event) => {
                setQuality(event.target.value as JpgQuality);
                setPages([]);
                setSelectedPage(null);
                setProgress(0);
                setError(null);
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-800 disabled:cursor-wait disabled:opacity-60"
            >
              {(Object.keys(qualityOptions) as JpgQuality[]).map((option) => (
                <option key={option} value={option}>
                  {qualityOptions[option].label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">
              {qualityOptions[quality].description}
            </p>
            <p className="mt-1">
              Choose the quality before uploading. Changing it clears the current conversion.
            </p>
          </div>
        </div>
      </div>

      {!pages.length && !isConverting ? (
        <label className="mt-7 flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/60 p-8 text-center hover:border-orange-500">
          <span className="text-5xl" aria-hidden="true">▤</span>
          <span className="mt-5 text-xl font-bold text-slate-800">Upload a PDF file</span>
          <span className="mt-2 text-sm text-slate-500">Every page will be prepared as a high-quality JPG.</span>
          <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={handleFileChange} />
        </label>
      ) : null}

      {isConverting && (
        <div className="mt-7 rounded-2xl bg-orange-50 p-6" role="status">
          <div className="flex justify-between text-sm font-semibold text-orange-900"><span>Rendering PDF pages…</span><span>{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-200"><div className="h-full rounded-full bg-orange-600 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {pages.length > 0 && (
        <div className="mt-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">{pages.length} page{pages.length === 1 ? "" : "s"} ready at {qualityOptions[quality].label}. Select a page to download.</p>
            <button type="button" onClick={() => { const page = pages.find((item) => item.pageNumber === selectedPage); if (page) downloadPage(page); }} className="self-start rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Download selected JPG</button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pages.map((page) => (
              <button key={page.pageNumber} type="button" onClick={() => setSelectedPage(page.pageNumber)} className={`overflow-hidden rounded-2xl border-2 text-left transition ${selectedPage === page.pageNumber ? "border-orange-500 ring-2 ring-orange-200" : "border-slate-200 hover:border-orange-300"}`}>
                <img src={page.dataUrl} alt={`PDF page ${page.pageNumber}`} className="aspect-[3/4] w-full bg-slate-100 object-contain" />
                <span className="flex items-center justify-between bg-white px-4 py-3 text-sm font-semibold text-slate-700"><span>Page {page.pageNumber}</span><span className={selectedPage === page.pageNumber ? "text-orange-600" : "text-slate-400"}>{selectedPage === page.pageNumber ? "Selected" : "Select"}</span></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
