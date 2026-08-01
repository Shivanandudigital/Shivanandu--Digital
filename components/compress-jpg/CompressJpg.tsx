"use client";

import { ChangeEvent, useEffect, useState } from "react";

const MIN_TARGET_KB = 10;
const MAX_FILE_MB = 30;
const MIN_QUALITY = 0.35;
const MAX_QUALITY = 0.98;
const SEARCH_STEPS = 9;
const SIZE_SCALES = [1, 0.94, 0.88, 0.82, 0.75, 0.68, 0.6, 0.52, 0.44, 0.36];

type CompressionResult = {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not create a JPG file."));
      },
      "image/jpeg",
      quality,
    );
  });
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

export default function CompressJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState("100");
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [targetReached, setTargetReached] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  function clearResult() {
    setResultUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setResult(null);
    setTargetReached(false);
    setProgress(0);
    setError(null);
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    event.target.value = "";
    if (!nextFile) return;

    const isJpeg =
      nextFile.type === "image/jpeg" || /\.jpe?g$/i.test(nextFile.name);
    if (!isJpeg) {
      setError("Please select a JPG or JPEG image.");
      return;
    }

    if (nextFile.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Please select an image smaller than ${MAX_FILE_MB} MB.`);
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setFile(nextFile);
    setSourceUrl(URL.createObjectURL(nextFile));
    setTargetKb(String(Math.max(MIN_TARGET_KB, Math.min(200, Math.floor(nextFile.size / 2048)))));
    clearResult();
  }

  async function compressJpg() {
    if (!file) return;

    const requestedKb = Number(targetKb);
    if (!Number.isFinite(requestedKb) || requestedKb < MIN_TARGET_KB) {
      setError(`Enter a target size of at least ${MIN_TARGET_KB} KB.`);
      return;
    }

    try {
      setIsCompressing(true);
      clearResult();
      setProgress(3);

      const targetBytes = Math.round(requestedKb * 1024);
      const image = await loadImage(file);
      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;

      if (!originalWidth || !originalHeight) {
        throw new Error("The image has invalid dimensions.");
      }

      if (file.size <= targetBytes) {
        const originalResult = {
          blob: file,
          width: originalWidth,
          height: originalHeight,
          quality: 1,
        };
        setResult(originalResult);
        setResultUrl(URL.createObjectURL(file));
        setTargetReached(true);
        setProgress(100);
        return;
      }

      let best: CompressionResult | null = null;
      let smallest: CompressionResult | null = null;

      for (let scaleIndex = 0; scaleIndex < SIZE_SCALES.length; scaleIndex += 1) {
        const scale = SIZE_SCALES[scaleIndex];
        const width = Math.max(1, Math.round(originalWidth * scale));
        const height = Math.max(1, Math.round(originalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas is not available.");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, width, height);

        let low = MIN_QUALITY;
        let high = MAX_QUALITY;

        for (let step = 0; step < SEARCH_STEPS; step += 1) {
          const quality = (low + high) / 2;
          const blob = await canvasToJpeg(canvas, quality);
          const candidate = { blob, width, height, quality };

          if (!smallest || blob.size < smallest.blob.size) smallest = candidate;

          if (blob.size <= targetBytes) {
            if (!best || blob.size > best.blob.size) best = candidate;
            low = quality;
          } else {
            high = quality;
          }
        }

        canvas.width = 1;
        canvas.height = 1;
        setProgress(Math.round(((scaleIndex + 1) / SIZE_SCALES.length) * 96));

        if (best && best.blob.size >= targetBytes * 0.94) break;
      }

      const finalResult = best ?? smallest;
      if (!finalResult) throw new Error("Compression did not create an image.");

      setResult(finalResult);
      setResultUrl(URL.createObjectURL(finalResult.blob));
      setTargetReached(finalResult.blob.size <= targetBytes);
      setProgress(100);
    } catch (cause) {
      console.error(cause);
      setError("This JPG could not be compressed. Please try another image.");
      setProgress(0);
    } finally {
      setIsCompressing(false);
    }
  }

  function downloadResult() {
    if (!resultUrl || !file) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${file.name.replace(/\.jpe?g$/i, "")}-compressed.jpg`;
    link.click();
  }

  const reduction = file && result
    ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
    : null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compress JPG</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose the required KB. The tool keeps the clearest image possible within your target.
          </p>
        </div>
        <label className="cursor-pointer self-start rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">
          Choose JPG
          <input className="sr-only" type="file" accept="image/jpeg,.jpg,.jpeg" onChange={selectFile} />
        </label>
      </div>

      {!file ? (
        <label className="mt-7 flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 p-8 text-center hover:border-violet-500">
          <span className="text-5xl" aria-hidden="true">▣</span>
          <span className="mt-5 text-xl font-bold text-slate-800">Upload a JPG to compress</span>
          <span className="mt-2 text-sm text-slate-500">Ideal for online forms, applications and document uploads.</span>
          <input className="sr-only" type="file" accept="image/jpeg,.jpg,.jpeg" onChange={selectFile} />
        </label>
      ) : (
        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="break-all font-bold text-slate-900">{file.name}</p>
              <p className="mt-1 text-sm text-slate-500">Original size: {formatBytes(file.size)}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <p className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-bold">Original</p>
                {sourceUrl && <img src={sourceUrl} alt="Original JPG preview" className="h-72 w-full object-contain p-3" />}
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <p className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-bold">Compressed preview</p>
                {resultUrl ? (
                  <img src={resultUrl} alt="Compressed JPG preview" className="h-72 w-full object-contain p-3" />
                ) : (
                  <div className="flex h-72 items-center justify-center p-6 text-center text-sm text-slate-400">Your compressed preview will appear here.</div>
                )}
              </div>
            </div>

            {result && (
              <div className={`rounded-2xl p-5 ${targetReached ? "bg-emerald-50" : "bg-amber-50"}`}>
                <p className={`font-bold ${targetReached ? "text-emerald-800" : "text-amber-900"}`}>
                  {targetReached ? "Target reached with the best available clarity" : "Closest clear result created"}
                </p>
                <p className={`mt-1 text-sm ${targetReached ? "text-emerald-700" : "text-amber-800"}`}>
                  New size: {formatBytes(result.blob.size)}{reduction !== null && ` (${reduction}% smaller)`}
                </p>
                <p className="mt-1 text-sm text-slate-600">Output: {result.width} × {result.height} px</p>
                <button type="button" onClick={downloadResult} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                  Download compressed JPG
                </button>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">Required file size</h3>
            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Target size (KB)
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
                <input
                  type="number"
                  min={MIN_TARGET_KB}
                  step="5"
                  inputMode="numeric"
                  value={targetKb}
                  disabled={isCompressing}
                  onChange={(event) => { setTargetKb(event.target.value); clearResult(); }}
                  className="min-w-0 flex-1 px-4 py-3 text-lg font-bold outline-none disabled:opacity-60"
                />
                <span className="flex items-center bg-slate-100 px-4 font-semibold text-slate-600">KB</span>
              </div>
            </label>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              The compressor tests image quality and dimensions to find the clearest result close to your target.
            </p>
            <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              Quality protection is always active. Original proportions are preserved and the image is never cropped.
            </div>
            <button type="button" onClick={compressJpg} disabled={isCompressing} className="mt-6 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">
              {isCompressing ? "Finding best quality…" : "Compress to target size"}
            </button>
          </aside>
        </div>
      )}

      {isCompressing && (
        <div className="mt-6 rounded-xl bg-violet-50 p-4" role="status">
          <div className="flex justify-between text-sm font-semibold text-violet-900"><span>Testing the clearest compression…</span><span>{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-200"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700" role="alert">{error}</div>}
    </section>
  );
}
