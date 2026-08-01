"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

const MIN_TARGET_KB = 50;
const MAX_ATTEMPTS = 5;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState("500");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [targetReached, setTargetReached] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function resetResult() {
    setResultUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    setResultSize(null);
    setTargetReached(false);
    setProgress(0);
    setError(null);
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (!nextFile) return;

    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return;
    }

    setFile(nextFile);
    const suggestedTarget = Math.max(
      MIN_TARGET_KB,
      Math.min(500, Math.floor(nextFile.size / 1024 * 0.8)),
    );
    setTargetKb(String(suggestedTarget));
    resetResult();
  }

  async function buildPdf(
    source: PDFDocumentProxy,
    scale: number,
    jpegQuality: number,
    attempt: number,
  ) {
    let output: jsPDF | null = null;

    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      const page = await source.getPage(pageNumber);
      const printableViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(renderViewport.width);
      canvas.height = Math.ceil(renderViewport.height);

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas is not available");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: context, viewport: renderViewport })
        .promise;

      const pageFormat: [number, number] = [
        printableViewport.width,
        printableViewport.height,
      ];

      if (!output) {
        output = new jsPDF({ unit: "pt", format: pageFormat, compress: true });
      } else {
        output.addPage(pageFormat);
      }

      output.addImage(
        canvas.toDataURL("image/jpeg", jpegQuality),
        "JPEG",
        0,
        0,
        printableViewport.width,
        printableViewport.height,
        undefined,
        "FAST",
      );

      canvas.width = 1;
      canvas.height = 1;
      page.cleanup();

      const completedWork =
        attempt * source.numPages + pageNumber;
      const totalWork = MAX_ATTEMPTS * source.numPages;
      setProgress(Math.min(96, Math.round((completedWork / totalWork) * 100)));
    }

    if (!output) throw new Error("No pages found");
    return output.output("blob");
  }

  async function compressPdf() {
    if (!file) return;

    const requestedKb = Number(targetKb);
    if (!Number.isFinite(requestedKb) || requestedKb < MIN_TARGET_KB) {
      setError(`Enter a target size of at least ${MIN_TARGET_KB} KB.`);
      return;
    }

    try {
      setIsCompressing(true);
      resetResult();
      setProgress(2);

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const source = await pdfjs.getDocument({
        data: await file.arrayBuffer(),
      }).promise;
      const targetBytes = Math.round(requestedKb * 1024);
      const initialRatio = clamp(targetBytes / file.size, 0.02, 1);

      let scale = clamp(1.8 * Math.sqrt(initialRatio * 1.4), 0.8, 1.8);
      let jpegQuality = clamp(0.9 * Math.pow(initialRatio * 2.5, 0.22), 0.5, 0.9);
      let bestBlob: Blob | null = null;
      let smallestBlob: Blob | null = null;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const blob = await buildPdf(source, scale, jpegQuality, attempt);

        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob;
        }

        if (blob.size <= targetBytes) {
          bestBlob = blob;
          break;
        }

        const adjustment = clamp(Math.sqrt(targetBytes / blob.size) * 0.97, 0.62, 0.92);
        scale = clamp(scale * adjustment, 0.68, 1.8);
        jpegQuality = clamp(jpegQuality * adjustment, 0.42, 0.9);
      }

      await source.cleanup();
      const finalBlob = bestBlob ?? smallestBlob;
      if (!finalBlob) throw new Error("Compression did not create a file");

      const nextUrl = URL.createObjectURL(finalBlob);
      setResultUrl(nextUrl);
      setResultSize(finalBlob.size);
      setTargetReached(finalBlob.size <= targetBytes);
      setProgress(100);
    } catch (cause) {
      console.error(cause);
      setError(
        "This PDF could not be compressed. It may be password protected, invalid, or too large for this device.",
      );
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

  const reduction =
    file && resultSize
      ? Math.round((1 - resultSize / file.size) * 100)
      : null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compress PDF</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose the required file size. The tool protects clarity while reducing the PDF.
          </p>
        </div>
        <label className="cursor-pointer self-start rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700">
          Choose PDF
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            onChange={selectFile}
          />
        </label>
      </div>

      {!file ? (
        <label className="mt-7 flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/60 p-8 text-center hover:border-rose-500">
          <span className="text-5xl" aria-hidden="true">▧</span>
          <span className="mt-5 text-xl font-bold text-slate-800">
            Upload a PDF to compress
          </span>
          <span className="mt-2 text-sm text-slate-500">
            Set the required size in KB and keep the best achievable clarity.
          </span>
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            onChange={selectFile}
          />
        </label>
      ) : (
        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Selected PDF</p>
            <p className="mt-1 break-all text-lg font-bold text-slate-900">
              {file.name}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Original size: {formatBytes(file.size)}
            </p>

            {resultSize && (
              <div
                className={`mt-6 rounded-xl p-4 ${
                  targetReached ? "bg-emerald-50" : "bg-amber-50"
                }`}
              >
                <p
                  className={`font-semibold ${
                    targetReached ? "text-emerald-800" : "text-amber-900"
                  }`}
                >
                  {targetReached
                    ? "Target reached with the best available clarity"
                    : "Closest clear result created"}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    targetReached ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  New size: {formatBytes(resultSize)}
                  {reduction !== null && ` (${Math.max(0, reduction)}% smaller)`}
                </p>
                {!targetReached && (
                  <p className="mt-2 text-sm text-amber-800">
                    The requested size was too low to reach without excessive quality loss.
                  </p>
                )}
                <button
                  type="button"
                  onClick={downloadResult}
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Download compressed PDF
                </button>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">Required file size</h3>
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Target size (KB)
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100">
                <input
                  type="number"
                  min={MIN_TARGET_KB}
                  step="10"
                  inputMode="numeric"
                  value={targetKb}
                  disabled={isCompressing}
                  onChange={(event) => {
                    setTargetKb(event.target.value);
                    resetResult();
                  }}
                  className="min-w-0 flex-1 px-4 py-3 text-lg font-bold text-slate-900 outline-none disabled:opacity-60"
                  aria-describedby="target-size-help"
                />
                <span className="flex items-center bg-slate-100 px-4 font-semibold text-slate-600">
                  KB
                </span>
              </div>
            </label>
            <p id="target-size-help" className="mt-3 text-sm leading-6 text-slate-500">
              The compressor automatically tests multiple settings and keeps the clearest result within your target whenever possible.
            </p>
            <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              Quality protection is always on. If the target is too small, the tool warns you instead of hiding severe quality loss.
            </div>
            <button
              type="button"
              onClick={compressPdf}
              disabled={isCompressing}
              className="mt-6 w-full rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isCompressing ? "Finding best quality…" : "Compress to target size"}
            </button>
          </aside>
        </div>
      )}

      {isCompressing && (
        <div className="mt-6 rounded-xl bg-rose-50 p-4" role="status">
          <div className="flex justify-between text-sm font-semibold text-rose-900">
            <span>Testing the clearest compression…</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-200">
            <div
              className="h-full rounded-full bg-rose-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
