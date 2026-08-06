"use client";

import React from "react";

interface PreviewPanelProps {
  previewImage?: string | null;
  [key: string]: any;
}

export default function PreviewPanel({ previewImage }: PreviewPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-gray-700">Final Preview</h3>
      <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-gray-50 p-4">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Final Passport Preview"
            className="h-[200px] w-[155px] rounded border border-gray-300 object-contain shadow-md bg-white"
          />
        ) : (
          <div className="text-center text-xs font-medium text-gray-400">
            Generating preview...
          </div>
        )}
      </div>
    </div>
  );
}