"use client";

import { useRef, useState } from "react";

type UploadBoxProps = {
  onSelect: (file: File) => void;
};

export default function UploadBox({ onSelect }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);

  function validateAndSelect(file: File) {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Maximum file size is 10 MB.");
      return;
    }

    onSelect(file);
  }

  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          const file = e.dataTransfer.files[0];

          if (file) {
            validateAndSelect(file);
          }
        }}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-12 transition-all duration-300 text-center ${
          dragging
            ? "border-blue-600 bg-blue-50"
            : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
        }`}
      >
        <div className="text-7xl mb-6">📷</div>

        <h2 className="text-3xl font-bold text-gray-800">
          Upload Your Passport Photo
        </h2>

        <p className="mt-3 text-gray-600">
          Drag & Drop your image here
        </p>

        <p className="mt-2 text-sm text-gray-500">
          or click to browse
        </p>

        <div className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition">
          Choose Photo
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Supported: JPG • PNG • WEBP
        </div>

        <div className="text-sm text-gray-500">
          Maximum Size: 10 MB
        </div>
      </div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            validateAndSelect(file);
          }
        }}
      />
    </>
  );
}