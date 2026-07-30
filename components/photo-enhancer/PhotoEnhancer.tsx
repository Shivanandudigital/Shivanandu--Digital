"use client";
/* eslint-disable @next/next/no-img-element -- User-generated Blob/Data URL previews require native img elements. */

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
};

const initialAdjustments: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

function makeFilter({ brightness, contrast, saturation }: Adjustments) {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

export default function PhotoEnhancer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("enhanced-photo.jpg");
  const [adjustments, setAdjustments] = useState<Adjustments>(initialAdjustments);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const filter = useMemo(() => makeFilter(adjustments), [adjustments]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, WebP, or another image file.");
      event.target.value = "";
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setImageUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return nextUrl;
    });
    setFileName(`${file.name.replace(/\.[^/.]+$/, "") || "enhanced-photo"}.jpg`);
    setAdjustments(initialAdjustments);
    setError(null);
    event.target.value = "";
  }

  function updateAdjustment(key: keyof Adjustments, value: number) {
    setAdjustments((current) => ({ ...current, [key]: value }));
  }

  function applyAutoEnhance() {
    setAdjustments({ brightness: 106, contrast: 112, saturation: 108 });
  }

  async function downloadEnhancedPhoto() {
    if (!imageUrl) return;

    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.filter = filter;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const downloadUrl = canvas.toDataURL("image/jpeg", 0.95);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      {!imageUrl ? (
        <label className="flex min-h-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50">
          <span className="text-5xl" aria-hidden="true">✦</span>
          <span className="mt-5 text-xl font-bold text-slate-800">Upload a photo to enhance</span>
          <span className="mt-2 max-w-md text-sm text-slate-500">Adjust brightness, contrast, and colour naturally in your browser. Your image stays on this device.</span>
          <span className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Choose photo</span>
          <input className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="space-y-7">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Enhance your photo</h2>
              <p className="mt-1 text-sm text-slate-500">Fine-tune the result, then download your enhanced JPG.</p>
            </div>
            <label className="cursor-pointer self-start rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-700">
              Choose another photo
              <input className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5 md:grid-cols-2">
              <ImagePreview imageUrl={imageUrl} label="Original" />
              <ImagePreview imageUrl={imageUrl} label="Enhanced preview" filter={filter} />
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-slate-900">Adjustments</h3>
                <button type="button" onClick={applyAutoEnhance} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Auto enhance</button>
              </div>

              <div className="mt-6 space-y-5">
                <AdjustmentControl label="Brightness" value={adjustments.brightness} min={60} max={140} onChange={(value) => updateAdjustment("brightness", value)} />
                <AdjustmentControl label="Contrast" value={adjustments.contrast} min={60} max={150} onChange={(value) => updateAdjustment("contrast", value)} />
                <AdjustmentControl label="Colour" value={adjustments.saturation} min={0} max={170} onChange={(value) => updateAdjustment("saturation", value)} />
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setAdjustments(initialAdjustments)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">Reset</button>
                <button type="button" onClick={downloadEnhancedPhoto} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Download JPG</button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}

function ImagePreview({ imageUrl, label, filter }: { imageUrl: string; label: string; filter?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="flex items-center justify-between bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        <span>{label}</span>
        {filter && <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Live</span>}
      </div>
      <div className="flex min-h-80 items-center justify-center p-4">
        <img src={imageUrl} alt={label} className="max-h-[480px] w-full rounded-lg object-contain" style={filter ? { filter } : undefined} />
      </div>
    </div>
  );
}

function AdjustmentControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-medium text-slate-700"><span>{label}</span><span className="text-slate-500">{value}%</span></span>
      <input className="mt-2 w-full accent-blue-600" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
