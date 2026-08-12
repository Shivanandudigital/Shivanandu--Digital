"use client";

import { useRef, useState } from "react";

type UploadBoxProps = {
  onSelect: (file: File) => void;
};

export default function UploadBox({ onSelect }: UploadBoxProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      validateAndSelect(file);
    }

    // Allows the same photo to be selected again after returning to upload.
    event.target.value = "";
  }

  return (
    <>
      <div
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
        className={`rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-300 sm:p-12 ${
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
          Take a new photo or choose one from your device
        </p>

        <div className="mx-auto mt-8 grid max-w-md gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            📷 Take Photo
          </button>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-xl border border-blue-600 bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            🖼️ Choose from Gallery
          </button>
        </div>

        <p className="mt-5 hidden text-sm text-gray-500 sm:block">
          You can also drag and drop an image here
        </p>

        <div className="mt-6 text-sm text-gray-500">
          Supported: JPG • PNG • WEBP
        </div>

        <div className="text-sm text-gray-500">
          Maximum Size: 10 MB
        </div>
      </div>

      <input
        ref={cameraInputRef}
        hidden
        type="file"
        capture="environment"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
      />

      <input
        ref={galleryInputRef}
        hidden
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
      />
    </>
  );
}