"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type Format = "image/jpeg" | "image/png" | "image/webp";

const ratios = [
  { label: "Free", value: 0 },
  { label: "Square 1:1", value: 1 },
  { label: "Passport 35:45", value: 35 / 45 },
  { label: "Signature 3:1", value: 3 },
  { label: "Photo 4:3", value: 4 / 3 },
  { label: "Wide 16:9", value: 16 / 9 },
];

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function rotatedSize(width: number, height: number, rotation: number) {
  const radians = rotation * Math.PI / 180;
  return {
    width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
    height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
  };
}

async function createCrop(src: string, area: Area, rotation: number, flipX: boolean, flipY: boolean, format: Format, quality: number) {
  const image = await loadImage(src);
  const bounds = rotatedSize(image.width, image.height, rotation);
  const work = document.createElement("canvas");
  work.width = Math.round(bounds.width);
  work.height = Math.round(bounds.height);
  const context = work.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.translate(work.width / 2, work.height / 2);
  context.rotate(rotation * Math.PI / 180);
  context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(area.width));
  output.height = Math.max(1, Math.round(area.height));
  const outputContext = output.getContext("2d", { alpha: format !== "image/jpeg" });
  if (!outputContext) throw new Error("Canvas unavailable");
  if (format === "image/jpeg") {
    outputContext.fillStyle = "#ffffff";
    outputContext.fillRect(0, 0, output.width, output.height);
  }
  outputContext.drawImage(work, area.x, area.y, area.width, area.height, 0, 0, output.width, output.height);
  return new Promise<Blob>((resolve, reject) => output.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Export failed")), format, format === "image/png" ? undefined : quality));
}

export default function CropImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [freeCrop, setFreeCrop] = useState(false);
  const [area, setArea] = useState<Area | null>(null);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  return () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  };
}, [imageUrl]);

useEffect(() => {
  return () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  };
}, [resultUrl]);

  function clearResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResult(null);
    setError(null);
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(next.type) || next.size > 30 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image under 30 MB.");
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(next);
    setImageUrl(URL.createObjectURL(next));
    setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setFlipX(false); setFlipY(false);
    clearResult();
  }

  function selectRatio(value: number) {
    setFreeCrop(value === 0);
    if (value) setAspect(value);
    clearResult();
  }

  async function exportCrop() {
    if (!imageUrl || !area) return;
    try {
      setBusy(true); clearResult();
      const blob = await createCrop(imageUrl, area, rotation, flipX, flipY, format, quality / 100);
      setResult(blob); setResultUrl(URL.createObjectURL(blob));
    } catch { setError("The image could not be cropped. Please try again."); }
    finally { setBusy(false); }
  }

  function download() {
    if (!resultUrl || !file) return;
    const extension = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${file.name.replace(/\.[^.]+$/, "")}-cropped.${extension}`;
    link.click();
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <header className="bg-gradient-to-r from-[#29205F] to-[#009B83] px-6 py-6 text-white sm:px-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">Professional Image Cropper</h2>
        <p className="mt-2 text-sm text-white/80">Crop, rotate and flip images precisely—your files never leave your browser.</p>
      </header>
      <div className="p-5 sm:p-8">
        {!imageUrl ? (
          <label className="flex min-h-96 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-8 text-center hover:border-[#009B83]">
            <span className="text-6xl">✂️</span><strong className="mt-6 text-2xl text-slate-900">Select or drag an image</strong>
            <span className="mt-2 text-sm text-slate-500">JPG, PNG or WebP • Maximum 30 MB</span>
            <span className="mt-6 rounded-xl bg-[#29205F] px-6 py-3 font-bold text-white">Choose Image</span>
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} />
          </label>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="relative h-[520px] overflow-hidden rounded-2xl bg-slate-950">
                <Cropper image={imageUrl} crop={crop} zoom={zoom} rotation={rotation} aspect={freeCrop ? undefined : aspect} onCropChange={(value) => { setCrop(value); clearResult(); }} onZoomChange={(value) => { setZoom(value); clearResult(); }} onCropComplete={(_, pixels) => setArea(pixels)} objectFit="contain" />
              </div>
              {resultUrl && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="font-extrabold text-emerald-900">Cropped image ready</p><p className="mt-1 text-sm text-emerald-700">{area && `${Math.round(area.width)} × ${Math.round(area.height)} px`} • {result && `${Math.round(result.size / 1024)} KB`}</p><button onClick={download} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Download Image</button></div>}
            </div>
            <aside className="space-y-5 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between"><h3 className="text-lg font-extrabold">Crop settings</h3><label className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold">Change<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} /></label></div>
              <div><p className="text-sm font-bold">Aspect ratio</p><div className="mt-2 grid grid-cols-2 gap-2">{ratios.map((ratio) => <button key={ratio.label} onClick={() => selectRatio(ratio.value)} className={`rounded-lg border px-2 py-2.5 text-xs font-semibold ${(ratio.value === 0 ? freeCrop : !freeCrop && aspect === ratio.value) ? "border-[#009B83] bg-emerald-50 text-emerald-800" : "border-slate-200"}`}>{ratio.label}</button>)}</div></div>
              <label className="block text-sm font-bold">Zoom: {zoom.toFixed(1)}×<input className="mt-3 w-full accent-[#009B83]" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
              <label className="block text-sm font-bold">Rotation: {rotation}°<input className="mt-3 w-full accent-[#009B83]" type="range" min="-180" max="180" step="1" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} /></label>
              <div className="grid grid-cols-3 gap-2"><button onClick={() => setRotation((value) => value - 90)} className="rounded-lg bg-slate-100 py-2 text-sm font-bold">↶ 90°</button><button onClick={() => setFlipX((value) => !value)} className="rounded-lg bg-slate-100 py-2 text-sm font-bold">↔ Flip</button><button onClick={() => setFlipY((value) => !value)} className="rounded-lg bg-slate-100 py-2 text-sm font-bold">↕ Flip</button></div>
              <label className="block text-sm font-bold">Output format<select className="mt-2 w-full rounded-xl border px-3 py-3" value={format} onChange={(event) => setFormat(event.target.value as Format)}><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
              {format !== "image/png" && <label className="block text-sm font-bold">Quality: {quality}%<input className="mt-3 w-full accent-[#009B83]" type="range" min="20" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>}
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
              <button disabled={busy} onClick={exportCrop} className="w-full rounded-xl bg-gradient-to-r from-[#29205F] to-[#009B83] px-5 py-4 font-extrabold text-white disabled:opacity-60">{busy ? "Creating image…" : "Crop Image"}</button>
            </aside>
          </div>
        )}
        <div className="mt-8 grid gap-4 border-t pt-7 sm:grid-cols-3">{[["🔒", "Private", "Processed only in your browser."], ["🎯", "Precise crop", "Free crop and useful presets."], ["✨", "Clean output", "JPG, PNG and WebP downloads."]].map(([icon, title, text]) => <div key={title} className="rounded-2xl bg-slate-50 p-4"><span className="text-2xl">{icon}</span><p className="mt-2 font-bold">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div>)}</div>
      </div>
    </section>
  );
}
