"use client";
/* eslint-disable @next/next/no-img-element -- User-generated Blob URL previews require native img elements. */

import { ChangeEvent, useEffect, useState } from "react";
import { removeBackground } from "@imgly/background-removal";

export default function BackgroundRemoverTool() {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("background-removed.png");
  const [progress, setProgress] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    const nextSourceUrl = URL.createObjectURL(file);
    setSourceUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return nextSourceUrl;
    });
    setResultUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
    setFileName(`${file.name.replace(/\.[^/.]+$/, "") || "photo"}-transparent.png`);
    setProgress(0);
    setError(null);
    event.target.value = "";
  }

  async function handleRemoveBackground() {
    if (!sourceUrl) return;

    try {
      setIsRemoving(true);
      setError(null);
      setProgress(3);

      const response = await fetch(sourceUrl);
      const imageBlob = await response.blob();
      const output = await removeBackground(imageBlob, {
        progress: (_key, current, total) => {
          if (total > 0) setProgress(Math.max(3, Math.round((current / total) * 100)));
        },
      });

      const nextResultUrl = URL.createObjectURL(output);
      setResultUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextResultUrl;
      });
      setProgress(100);
    } catch (cause) {
      console.error(cause);
      setError("Background removal could not finish. Please try another image.");
      setProgress(0);
    } finally {
      setIsRemoving(false);
    }
  }

  function downloadResult() {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = fileName;
    link.click();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      {!sourceUrl ? (
        <label className="flex min-h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/70 p-8 text-center transition hover:border-violet-500 hover:bg-violet-50">
          <span className="text-5xl" aria-hidden="true">◌</span>
          <span className="mt-5 text-xl font-bold text-slate-800">Upload an image</span>
          <span className="mt-2 max-w-md text-sm text-slate-500">We will isolate the person or main subject and return a transparent PNG.</span>
          <span className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white">Choose image</span>
          <input className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="space-y-7">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Remove background</h2>
              <p className="mt-1 text-sm text-slate-500">The final PNG preserves transparent areas for easy reuse.</p>
            </div>
            <label className="cursor-pointer self-start rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-violet-500 hover:text-violet-700">
              Choose another image
              <input className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Preview imageUrl={sourceUrl} label="Original" />
            <Preview imageUrl={resultUrl} label="Transparent result" emptyText="Your transparent result will appear here." checkerboard />
          </div>

          {isRemoving && (
            <div className="rounded-xl bg-violet-50 p-4" role="status">
              <div className="flex justify-between text-sm font-medium text-violet-900"><span>Removing background…</span><span>{progress}%</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-200"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleRemoveBackground} disabled={isRemoving} className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">
              {isRemoving ? "Working…" : resultUrl ? "Remove again" : "Remove background"}
            </button>
            {resultUrl && <button type="button" onClick={downloadResult} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">Download transparent PNG</button>}
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}

function Preview({ imageUrl, label, emptyText, checkerboard = false }: { imageUrl: string | null; label: string; emptyText?: string; checkerboard?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{label}</div>
      <div className={`flex min-h-80 items-center justify-center p-4 ${checkerboard ? "bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%,transparent_75%,#e2e8f0_75%),linear-gradient(45deg,#e2e8f0_25%,transparent_25%,transparent_75%,#e2e8f0_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px]" : "bg-slate-100"}`}>
        {imageUrl ? <img src={imageUrl} alt={label} className="max-h-[480px] w-full rounded-lg object-contain" /> : <p className="max-w-xs text-center text-sm text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}
