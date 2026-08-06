"use client";

import React from "react";

interface EditorHeaderProps {
  onChooseAnotherPhoto?: () => void;
  [key: string]: any;
}

export default function EditorHeader({ onChooseAnotherPhoto }: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Passport Photo Maker</h1>
        <p className="text-sm text-gray-500">Professional Digital Tool</p>
      </div>
      {onChooseAnotherPhoto && (
        <button
          onClick={onChooseAnotherPhoto}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
        >
          Choose Another Photo
        </button>
      )}
    </div>
  );
}