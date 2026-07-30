"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { jsPDF } from "jspdf";

type Quality = "smaller" | "balanced" | "higher";

const qualitySettings: Record<Quality, { label: string; scale: number; jpegQuality: number; description: string }> = {
  smaller: { label: "Smaller file", scale: 1, jpegQuality: 0.6, description: "Best for sharing and email" },
  balanced: { label: "Balanced", scale: 1.35, jpegQuality: 0.76, description: "Good quality with a smaller file" },
  higher: { label: "Higher quality", scale: 1.8, jpegQuality: 0.88, description: "Best for printing and clarity" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>("balanced");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (!nextFile) return;
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    setFile(nextFile);
    setResultUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    setResultSize(null);
    setProgress(0);
    setError(null);
  }

  async function compressPdf() {
    if (!file) return;
    try {
      setIsCompressing(true);
      setProgress(3);
      setError(null);

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      const source = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const settings = qualitySettings[quality];
      let output: jsPDF | null = null;

      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
        const page = await source.getPage(pageNumber);
        const printableViewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale: settings.scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas is not available");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: context, viewport: renderViewport }).promise;

        const pageFormat: [number, number] = [printableViewport.width, printableViewport.height];
        if (!output) {
          output = new jsPDF({ unit: "pt", format: pageFormat, compress: true });
        } else {
          output.addPage(pageFormat);
        }
        output.addImage(canvas.toDataURL("image/jpeg", settings.jpegQuality), "JPEG", 0, 0, printableViewport.width, printableViewport.height, undefined, "FAST");
        setProgress(Math.round((pageNumber / source.numPages) * 100));
      }

      await source.cleanup();
      if (!output) throw new Error("No pages found");
      const blob = output.output("blob");
      const nextUrl = URL.createObjectURL(blob);
      setResultUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextUrl;
      });
      setResultSize(blob.size);
    } catch (cause) {
      console.error(cause);
      setError("This PDF could not be compressed. It may be password protected or invalid.");
      setProgress(0);
    } finally {
      setIsCompressing(false);
    }
  }

  function downloadResult() {
    if (!resultUrl || !file) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`;
    link.click();
  }

  const reduction = file && resultSize ? Math.round((1 - resultSize / file.size) * 100) : null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Compress PDF</h2><p className="mt-1 text-sm text-slate-500">Optimise PDF pages for a smaller, easier-to-share file.</p></div>
        <label className="cursor-pointer self-start rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700">Choose PDF<input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={selectFile} /></label>
      </div>

      {!file ? (
        <label className="mt-7 flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/60 p-8 text-center hover:border-rose-500"><span className="text-5xl" aria-hidden="true">▧</span><span className="mt-5 text-xl font-bold text-slate-800">Upload a PDF to compress</span><span className="mt-2 text-sm text-slate-500">Choose a quality level before creating the smaller file.</span><input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={selectFile} /></label>
      ) : (
        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><p className="text-sm text-slate-500">Selected PDF</p><p className="mt-1 break-all text-lg font-bold text-slate-900">{file.name}</p><p className="mt-2 text-sm text-slate-500">Original size: {formatBytes(file.size)}</p>{resultSize && <div className="mt-6 rounded-xl bg-emerald-50 p-4"><p className="font-semibold text-emerald-800">Compression complete</p><p className="mt-1 text-sm text-emerald-700">New size: {formatBytes(resultSize)}{reduction !== null && ` (${reduction >= 0 ? reduction : 0}% smaller)`}</p><button type="button" onClick={downloadResult} className="mt-4 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Download compressed PDF</button></div>}</div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">Compression quality</h3><div className="mt-4 space-y-3">{(Object.keys(qualitySettings) as Quality[]).map((level) => <label key={level} className={`block cursor-pointer rounded-xl border p-4 ${quality === level ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}><input className="sr-only" type="radio" name="quality" checked={quality === level} onChange={() => setQuality(level)} /><span className="block font-semibold text-slate-800">{qualitySettings[level].label}</span><span className="mt-1 block text-sm text-slate-500">{qualitySettings[level].description}</span></label>)}</div><button type="button" onClick={compressPdf} disabled={isCompressing} className="mt-6 w-full rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60">{isCompressing ? "Compressing…" : "Compress PDF"}</button></aside>
        </div>
      )}

      {isCompressing && <div className="mt-6 rounded-xl bg-rose-50 p-4" role="status"><div className="flex justify-between text-sm font-semibold text-rose-900"><span>Optimising pages…</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-200"><div className="h-full rounded-full bg-rose-600 transition-all" style={{ width: `${progress}%` }} /></div></div>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
