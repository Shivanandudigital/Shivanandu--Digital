"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import NextImage from "next/image";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

type ResizeResult = {
  blob: Blob;
  width: number;
  height: number;
};

const MAX_FILE_MB = 30;
const MAX_DIMENSION = 12000;

const presets = [
  { label: "Passport 35×45", width: 413, height: 531 },
  { label: "Signature", width: 600, height: 200 },
  { label: "Aadhaar / ID", width: 600, height: 400 },
  { label: "Instagram Square", width: 1080, height: 1080 },
  { label: "YouTube Thumbnail", width: 1280, height: 720 },
  { label: "Full HD", width: 1920, height: 1080 },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extensionFor(format: OutputFormat) {
  if (format === "image/png") return "png";
  if (format === "image/webp") return "webp";
  return "jpg";
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The selected image could not be opened."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The browser could not create the image."))),
      format,
      format === "image/png" ? undefined : quality,
    );
  });
}

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState("1200");
  const [height, setHeight] = useState("800");
  const [percentage, setPercentage] = useState("100");
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [targetKb, setTargetKb] = useState("");
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  const ratio = originalWidth && originalHeight ? originalWidth / originalHeight : 1;

  const reduction = useMemo(() => {
    if (!file || !result) return null;
    return Math.round((1 - result.blob.size / file.size) * 100);
  }, [file, result]);

  function clearResult() {
    setResultUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setResult(null);
    setError(null);
  }

  async function acceptFile(nextFile: File) {
    const allowed = /^image\/(jpeg|png|webp)$/i.test(nextFile.type) || /\.(jpe?g|png|webp)$/i.test(nextFile.name);
    if (!allowed) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }
    if (nextFile.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Please select an image smaller than ${MAX_FILE_MB} MB.`);
      return;
    }

    try {
      const image = await loadImage(nextFile);
      if (!image.naturalWidth || !image.naturalHeight) throw new Error("Invalid dimensions");
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      setFile(nextFile);
      setSourceUrl(URL.createObjectURL(nextFile));
      setOriginalWidth(image.naturalWidth);
      setOriginalHeight(image.naturalHeight);
      setWidth(String(image.naturalWidth));
      setHeight(String(image.naturalHeight));
      setPercentage("100");
      clearResult();
    } catch {
      setError("This image could not be opened. Please try another file.");
    }
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (nextFile) void acceptFile(nextFile);
  }

  function dropFile(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void acceptFile(nextFile);
  }

  function changeWidth(value: string) {
    setWidth(value);
    const nextWidth = Number(value);
    if (lockRatio && nextWidth > 0) setHeight(String(Math.max(1, Math.round(nextWidth / ratio))));
    clearResult();
  }

  function changeHeight(value: string) {
    setHeight(value);
    const nextHeight = Number(value);
    if (lockRatio && nextHeight > 0) setWidth(String(Math.max(1, Math.round(nextHeight * ratio))));
    clearResult();
  }

  function applyPercentage(value: string) {
    setPercentage(value);
    const percent = Number(value);
    if (originalWidth && originalHeight && percent > 0) {
      setWidth(String(Math.max(1, Math.round(originalWidth * percent / 100))));
      setHeight(String(Math.max(1, Math.round(originalHeight * percent / 100))));
    }
    clearResult();
  }

  function applyPreset(nextWidth: number, nextHeight: number) {
    setWidth(String(nextWidth));
    setHeight(String(nextHeight));
    setPercentage("");
    setLockRatio(false);
    clearResult();
  }

  async function resizeImage() {
    if (!file) return;
    const outputWidth = Math.round(Number(width));
    const outputHeight = Math.round(Number(height));
    if (!outputWidth || !outputHeight || outputWidth < 1 || outputHeight < 1) {
      setError("Enter a valid width and height.");
      return;
    }
    if (outputWidth > MAX_DIMENSION || outputHeight > MAX_DIMENSION) {
      setError(`Width and height must not exceed ${MAX_DIMENSION} pixels.`);
      return;
    }

    try {
      setIsProcessing(true);
      clearResult();
      const image = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d", { alpha: format !== "image/jpeg" });
      if (!context) throw new Error("Canvas is unavailable");
      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, outputWidth, outputHeight);
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, outputWidth, outputHeight);

      let blob = await canvasToBlob(canvas, format, quality / 100);
      const requestedKb = Number(targetKb);
      if (targetKb && format !== "image/png" && Number.isFinite(requestedKb) && requestedKb >= 5) {
        const targetBytes = requestedKb * 1024;
        let low = 0.1;
let high = 1;
        let best: Blob | null = blob.size <= targetBytes ? blob : null;
        for (let step = 0; step < 10; step += 1) {
          const candidateQuality = (low + high) / 2;
          const candidate = await canvasToBlob(canvas, format, candidateQuality);
          if (candidate.size <= targetBytes) {
            best = candidate;
            low = candidateQuality;
          } else {
            high = candidateQuality;
          }
        }
        if (best) blob = best;
      }

      canvas.width = 1;
      canvas.height = 1;
      setResult({ blob, width: outputWidth, height: outputHeight });
      setResultUrl(URL.createObjectURL(blob));
    } catch (cause) {
      console.error(cause);
      setError("The image could not be resized. Please try another image or smaller dimensions.");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadResult() {
    if (!file || !resultUrl) return;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${baseName}-${result?.width}x${result?.height}.${extensionFor(format)}`;
    link.click();
  }

  function startOver() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setFile(null);
    setSourceUrl(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    clearResult();
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 bg-gradient-to-r from-[#29205F] to-[#009B83] px-5 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Professional Image Resizer</h2>
            <p className="mt-2 text-sm text-white/80">Resize photos for online forms, IDs, websites and social media—privately in your browser.</p>
          </div>
          <span className="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">No upload to server</span>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {!file ? (
          <label
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={dropFile}
            className={`flex min-h-96 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${isDragging ? "border-[#009B83] bg-emerald-50" : "border-violet-300 bg-violet-50/50 hover:border-[#009B83] hover:bg-emerald-50/50"}`}
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-md" aria-hidden="true">🖼️</span>
            <span className="mt-6 text-2xl font-extrabold text-slate-900">Select or drag &amp; drop an image</span>
            <span className="mt-2 text-sm leading-6 text-slate-500">JPG, PNG or WebP • Maximum {MAX_FILE_MB} MB</span>
            <span className="mt-6 rounded-xl bg-[#29205F] px-6 py-3 font-bold text-white">Choose Image</span>
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={selectFile} />
          </label>
        ) : (
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{file.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{originalWidth} × {originalHeight} px • {formatBytes(file.size)}</p>
                </div>
                <button type="button" onClick={startOver} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-red-300 hover:text-red-600">Change image</button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <p className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-bold">Original</p>
                  {sourceUrl && <div className="relative h-80 w-full"><NextImage src={sourceUrl} alt="Original preview" fill unoptimized className="object-contain p-3" /></div>}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <p className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-bold">Resized preview</p>
                  {resultUrl ? <div className="relative h-80 w-full"><NextImage src={resultUrl} alt="Resized preview" fill unoptimized className="object-contain p-3" /></div> : <div className="flex h-80 items-center justify-center p-8 text-center text-sm text-slate-400">Choose your settings and click Resize Image.</div>}
                </div>
              </div>

              {result && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-extrabold text-emerald-900">Your resized image is ready</p>
                      <p className="mt-1 text-sm text-emerald-800">{result.width} × {result.height} px • {formatBytes(result.blob.size)}{reduction !== null && ` • ${reduction >= 0 ? `${reduction}% smaller` : `${Math.abs(reduction)}% larger`}`}</p>
                    </div>
                    <button type="button" onClick={downloadResult} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Download Image</button>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Resize settings</h3>
                <p className="mt-1 text-sm text-slate-500">Enter exact pixel dimensions or use a preset.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-bold text-slate-700">Width (px)<input type="number" min="1" max={MAX_DIMENSION} value={width} onChange={(event) => changeWidth(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-base font-bold outline-none focus:border-[#009B83] focus:ring-2 focus:ring-emerald-100" /></label>
                <label className="text-sm font-bold text-slate-700">Height (px)<input type="number" min="1" max={MAX_DIMENSION} value={height} onChange={(event) => changeHeight(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-base font-bold outline-none focus:border-[#009B83] focus:ring-2 focus:ring-emerald-100" /></label>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700"><span>🔗 Lock aspect ratio</span><input type="checkbox" checked={lockRatio} onChange={(event) => setLockRatio(event.target.checked)} className="h-5 w-5 accent-[#009B83]" /></label>

              <label className="block text-sm font-bold text-slate-700">Resize by percentage<input type="number" min="1" max="500" value={percentage} onChange={(event) => applyPercentage(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-[#009B83]" placeholder="e.g. 50" /></label>

              <div>
                <p className="text-sm font-bold text-slate-700">Popular presets</p>
                <div className="mt-2 grid grid-cols-2 gap-2">{presets.map((preset) => <button type="button" key={preset.label} onClick={() => applyPreset(preset.width, preset.height)} className="rounded-lg border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 hover:border-[#009B83] hover:bg-emerald-50 hover:text-emerald-800">{preset.label}</button>)}</div>
              </div>

              <label className="block text-sm font-bold text-slate-700">Output format<select value={format} onChange={(event) => { setFormat(event.target.value as OutputFormat); clearResult(); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#009B83]"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>

              {format !== "image/png" && <label className="block text-sm font-bold text-slate-700">Quality: {quality}%<input type="range" min="10" max="100" value={quality} onChange={(event) => { setQuality(Number(event.target.value)); clearResult(); }} className="mt-3 w-full accent-[#009B83]" /></label>}

              <label className="block text-sm font-bold text-slate-700">Target size in KB <span className="font-normal text-slate-400">(optional)</span><input type="number" min="5" value={targetKb} disabled={format === "image/png"} onChange={(event) => { setTargetKb(event.target.value); clearResult(); }} placeholder={format === "image/png" ? "Not available for PNG" : "e.g. 50"} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#009B83]" /></label>

              {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
              <button type="button" disabled={isProcessing} onClick={resizeImage} className="w-full rounded-xl bg-gradient-to-r from-[#29205F] to-[#009B83] px-5 py-4 font-extrabold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{isProcessing ? "Resizing image…" : "Resize Image"}</button>
            </aside>
          </div>
        )}

        {!file && error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-8 grid gap-4 border-t border-slate-100 pt-7 sm:grid-cols-3">
          {[['🔒', 'Private processing', 'Your image stays inside your browser.'], ['⚡', 'Fast and free', 'No signup, watermark or waiting.'], ['🎯', 'Exact dimensions', 'Resize for forms, documents and social media.']].map(([icon, title, text]) => <div key={title} className="rounded-2xl bg-slate-50 p-4"><span className="text-2xl" aria-hidden="true">{icon}</span><p className="mt-2 font-bold text-slate-900">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}
