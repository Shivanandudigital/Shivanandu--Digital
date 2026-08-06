"use client";

import React from "react";

interface RightSidebarProps {
  previewImage?: string | null;
  passportSizeName?: string;
  bgColorHex?: string;
  [key: string]: any;
}

export default function RightSidebar({
  previewImage,
  passportSizeName = "India Passport (35×45 mm)",
  bgColorHex = "#FFFFFF",
}: RightSidebarProps) {
  const handleDownload = (format: string) => {
    if (!previewImage) return;
    const link = document.createElement("a");
    link.href = previewImage;
    link.download = `passport-photo.${format}`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-extrabold text-slate-800">Output Summary</h3>
        <p className="text-xs text-slate-500">Size: <span className="font-semibold text-slate-700">{passportSizeName}</span></p>
        <p className="text-xs text-slate-500">Background: <span className="font-semibold text-slate-700">{bgColorHex}</span></p>
      </div>

      <hr className="border-slate-100" />

      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Download & Print Options
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => handleDownload("jpg")}
          disabled={!previewImage}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
        >
          📷 Download JPG
        </button>
        <button
          onClick={() => handleDownload("png")}
          disabled={!previewImage}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
        >
          🖼️ Download PNG
        </button>
        <button
          onClick={() => handleDownload("pdf")}
          disabled={!previewImage}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
        >
          📄 Download PDF
        </button>
        <button
          onClick={() => window.print()}
          disabled={!previewImage}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
        >
          🖨️ Print Sheet
        </button>
      </div>
    </div>
  );
}