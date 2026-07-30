"use client";
/* eslint-disable @next/next/no-img-element -- Generated canvas Data URL previews require native img elements. */

import { ChangeEvent, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { detectFace } from "@/lib/faceDetector";
import { downloadFile } from "@/lib/downloadImage";
import { downloadPdf } from "@/lib/downloadPdf";

type OutputSize = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
};

const outputSizes: OutputSize[] = [
  { id: "india", label: "India Passport (35 × 45 mm)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: "us", label: "US Passport / Visa (2 × 2 inch)", widthMm: 51, heightMm: 51, widthPx: 602, heightPx: 602 },
  { id: "schengen", label: "Schengen Visa (35 × 45 mm)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: "canada", label: "Canada Visa (50 × 70 mm)", widthMm: 50, heightMm: 70, widthPx: 591, heightPx: 827 },
  { id: "uk", label: "UK Passport (35 × 45 mm)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
];

type ProcessingState = "idle" | "detecting" | "removing" | "creating" | "complete" | "error";

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The selected image could not be loaded."));
    image.src = source;
  });
}

function createPassportImage(image: HTMLImageElement, landmarks: { x: number; y: number }[], size: OutputSize) {
  const forehead = landmarks[10];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];

  if (!forehead || !chin || !leftEye || !rightEye) throw new Error("Face landmarks are incomplete.");

  const eyeX = ((leftEye.x + rightEye.x) / 2) * image.naturalWidth;
  const eyeY = ((leftEye.y + rightEye.y) / 2) * image.naturalHeight;
  const headTop = Math.max(0, forehead.y - 0.08) * image.naturalHeight;
  const chinY = chin.y * image.naturalHeight;
  const detectedHeadHeight = Math.max(1, chinY - headTop);

  // Portrait composition: head plus shoulders/upper body, with the eyes in the upper third.
  const outputRatio = size.widthMm / size.heightMm;
  let cropHeight = Math.min(image.naturalHeight, detectedHeadHeight / 0.48);
  let cropWidth = cropHeight * outputRatio;
  if (cropWidth > image.naturalWidth) {
    cropWidth = image.naturalWidth;
    cropHeight = cropWidth / outputRatio;
  }

  const cropX = Math.max(0, Math.min(eyeX - cropWidth / 2, image.naturalWidth - cropWidth));
  const cropY = Math.max(0, Math.min(eyeY - cropHeight * 0.35, image.naturalHeight - cropHeight));
  const canvas = document.createElement("canvas");
  canvas.width = size.widthPx;
  canvas.height = size.heightPx;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size.widthPx, size.heightPx);
  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, size.widthPx, size.heightPx);
  return canvas.toDataURL("image/jpeg", 0.95);
}

export default function AutoPassportPhotoMaker() {
  const [output, setOutput] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState("india");
  const [photoData, setPhotoData] = useState<{ image: HTMLImageElement; landmarks: { x: number; y: number }[] } | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const [message, setMessage] = useState("Upload a clear front-facing photo to create your passport photo automatically.");
  const [error, setError] = useState<string | null>(null);
  const selectedSize = outputSizes.find((size) => size.id === selectedSizeId) ?? outputSizes[0];

  function handleSizeChange(nextSizeId: string) {
    setSelectedSizeId(nextSizeId);

    if (!photoData) return;

    const nextSize =
      outputSizes.find((size) => size.id === nextSizeId) ??
      outputSizes[0];

    setOutput(
      createPassportImage(
        photoData.image,
        photoData.landmarks,
        nextSize
      )
    );
    setMessage(
      `${nextSize.label} output updated with head and shoulders framing.`
    );
  }

  async function processPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Please choose a photo smaller than 12 MB.");
      return;
    }

    try {
      setOutput(null);
      setError(null);
      setState("detecting");
      setMessage("Detecting your face and calculating the correct passport framing…");
      const sourceUrl = URL.createObjectURL(file);
      const sourceImage = await loadImage(sourceUrl);
      const detection = await detectFace(sourceImage);
      const landmarks = detection.faceLandmarks?.[0];
      if (!landmarks) throw new Error("No face was detected. Please upload a clear, front-facing photo with your full face visible.");

      let portraitImage = sourceImage;
      let transparentUrl: string | null = null;
      try {
        setState("removing");
        setMessage("Removing the background and preparing a clean white passport background…");
        const transparentPhoto = await removeBackground(file);
        transparentUrl = URL.createObjectURL(transparentPhoto);
        portraitImage = await loadImage(transparentUrl);
      } catch {
        setMessage("Background could not be removed, so the original background will be used.");
      }

      setState("creating");
      setMessage(`Creating your ${selectedSize.label} photo with head and shoulders framing…`);
      const passportPhoto = createPassportImage(portraitImage, landmarks, selectedSize);
      setPhotoData({ image: portraitImage, landmarks });
      setOutput(passportPhoto);
      setState("complete");
      setMessage("Your automatic passport photo is ready to download.");
      URL.revokeObjectURL(sourceUrl);
      if (transparentUrl) URL.revokeObjectURL(transparentUrl);
    } catch (cause) {
      console.error(cause);
      setState("error");
      setError(cause instanceof Error ? cause.message : "The passport photo could not be created. Please try another photo.");
    }
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void processPhoto(file);
  }

  async function downloadPng() {
    if (!output) return;
    const image = await loadImage(output);
    const canvas = document.createElement("canvas");
    canvas.width = selectedSize.widthPx;
    canvas.height = selectedSize.heightPx;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0, selectedSize.widthPx, selectedSize.heightPx);
    downloadFile(canvas.toDataURL("image/png"), "india-passport-photo.png");
  }

  const isWorking = state === "detecting" || state === "removing" || state === "creating";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">Automatic passport photo</span>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Upload a normal photo. Get a passport photo.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Our tool automatically detects your face, centres it to passport framing, makes the background white, and creates an India Passport 35 × 45 mm photo.</p>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <label className="block text-sm font-semibold text-slate-700">Output size
          <select value={selectedSizeId} onChange={(event) => handleSizeChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
            {outputSizes.map((size) => <option key={size.id} value={size.id}>{size.label}</option>)}
          </select>
        </label>
      </div>

      {!output && !isWorking && (
        <label className="mx-auto mt-8 flex min-h-80 max-w-3xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 p-8 text-center transition hover:border-blue-500 hover:bg-blue-50">
          <span className="text-5xl" aria-hidden="true">◉</span>
          <span className="mt-5 text-xl font-bold text-slate-800">Choose a photo from your phone or computer</span>
          <span className="mt-2 max-w-lg text-sm text-slate-500">For best results: face the camera, keep your full head visible, and use good light.</span>
          <span className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white">Upload photo</span>
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={handleUpload} />
        </label>
      )}

      {isWorking && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center" role="status">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <h3 className="mt-5 text-xl font-bold text-slate-900">Creating your passport photo</h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
      )}

      {output && (
        <div className="mx-auto mt-8 grid max-w-4xl gap-7 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="mb-4 text-sm font-semibold text-slate-700">{selectedSize.label} · Head and shoulders framing</p>
            <div className="inline-block bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%,transparent_75%,#e2e8f0_75%),linear-gradient(45deg,#e2e8f0_25%,transparent_25%,transparent_75%,#e2e8f0_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] p-3">
              <img src={output} alt="Automatically created passport photo" className="w-[245px] border border-slate-300 bg-white shadow-sm" />
            </div>
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-bold text-slate-900">Ready to use</h3>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <dl className="mt-5 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Size</dt><dd className="font-semibold text-slate-800">{selectedSize.widthMm} × {selectedSize.heightMm} mm</dd></div><div className="flex justify-between"><dt className="text-slate-500">Background</dt><dd className="font-semibold text-slate-800">White</dd></div><div className="flex justify-between"><dt className="text-slate-500">Framing</dt><dd className="font-semibold text-slate-800">Head + shoulders</dd></div></dl>
            <div className="mt-6 grid gap-3"><button type="button" onClick={() => downloadFile(output, "india-passport-photo.jpg")} className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">Download JPG</button><button type="button" onClick={() => void downloadPng()} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:border-slate-400">Download PNG</button><button type="button" onClick={() => downloadPdf(output, "india-passport-photo.pdf")} className="rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-700">Download PDF</button></div>
            <label className="mt-4 block cursor-pointer text-center text-sm font-semibold text-blue-700 hover:text-blue-900">Use another photo<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={handleUpload} /></label>
          </aside>
        </div>
      )}

      {error && <div role="alert" className="mx-auto mt-6 max-w-3xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}<label className="ml-2 cursor-pointer font-semibold underline">Try another photo<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={handleUpload} /></label></div>}
    </section>
  );
}
