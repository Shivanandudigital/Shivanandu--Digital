"use client";
/* eslint-disable @next/next/no-img-element -- User-selected Data URL thumbnails require native img elements. */

import { ChangeEvent, useState } from "react";
import { jsPDF } from "jspdf";

type PdfImage = {
  id: string;
  name: string;
  dataUrl: string;
};

type PageFormat = "a4" | "letter";

function readImage(file: File): Promise<PdfImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, dataUrl: String(reader.result) });
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export default function JpgToPdf() {
  const [images, setImages] = useState<PdfImage[]>([]);
  const [format, setFormat] = useState<PageFormat>("a4");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setError("Only image files can be added to the PDF.");
      return;
    }

    try {
      const newImages = await Promise.all(files.map(readImage));
      setImages((current) => [...current, ...newImages]);
      setError(null);
    } catch {
      setError("One or more images could not be read. Please try again.");
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= images.length) return;
    setImages((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  async function createPdf() {
    if (!images.length) return;
    setIsCreating(true);
    setError(null);

    try {
      const pdf = new jsPDF({ format, unit: "mm", orientation: "portrait", compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;

      images.forEach((image, index) => {
        if (index > 0) pdf.addPage(format, "portrait");
        const imageProperties = pdf.getImageProperties(image.dataUrl);
        const scale = Math.min((pageWidth - margin * 2) / imageProperties.width, (pageHeight - margin * 2) / imageProperties.height);
        const width = imageProperties.width * scale;
        const height = imageProperties.height * scale;
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        pdf.addImage(image.dataUrl, "JPEG", x, y, width, height, undefined, "FAST");
      });

      pdf.save("shivanandu-images.pdf");
    } catch (cause) {
      console.error(cause);
      setError("The PDF could not be created. Try smaller or fewer images.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create a PDF from images</h2>
          <p className="mt-1 text-sm text-slate-500">Each image becomes one clean, correctly sized PDF page.</p>
        </div>
        <label className="cursor-pointer self-start rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
          Add images
          <input className="sr-only" type="file" accept="image/*" multiple onChange={addImages} />
        </label>
      </div>

      {!images.length ? (
        <label className="mt-7 flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 p-8 text-center hover:border-blue-500">
          <span className="text-5xl" aria-hidden="true">▣</span>
          <span className="mt-5 text-xl font-bold text-slate-800">Choose JPG, PNG, or WebP images</span>
          <span className="mt-2 text-sm text-slate-500">Select one or many images to make a single PDF.</span>
          <input className="sr-only" type="file" accept="image/*" multiple onChange={addImages} />
        </label>
      ) : (
        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600">Page order ({images.length})</p>
            {images.map((image, index) => (
              <div key={image.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <img src={image.dataUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{image.name}</p><p className="mt-1 text-xs text-slate-500">Page {index + 1}</p></div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label={`Move ${image.name} up`} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label={`Move ${image.name} down`} className="rounded-lg border border-slate-300 px-2 py-1 text-slate-600 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))} aria-label={`Remove ${image.name}`} className="rounded-lg border border-red-200 px-2 py-1 text-red-600">×</button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">PDF settings</h3>
            <label className="mt-5 block text-sm font-medium text-slate-700">Page format
              <select value={format} onChange={(event) => setFormat(event.target.value as PageFormat)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-800">
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
              </select>
            </label>
            <p className="mt-3 text-sm text-slate-500">Images are scaled to fit without being cropped.</p>
            <button type="button" onClick={createPdf} disabled={isCreating} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">{isCreating ? "Creating PDF…" : "Download PDF"}</button>
            <button type="button" onClick={() => setImages([])} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">Clear all</button>
          </aside>
        </div>
      )}

      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
