"use client";

import { useState } from "react";
import UploadBox from "./UploadBox";
import ImageCropper from "./ImageCropper";

export default function PassportPhotoMaker() {
  const [image, setImage] = useState<string | null>(null);

  const handleSelect = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImage(null);
  };

  return (
    <section className="w-full rounded-3xl bg-white shadow-xl border border-gray-200 p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Passport Photo Maker
        </h2>

        <p className="mt-2 text-gray-600">
          Upload your photo, crop it, adjust it and download a professional
          passport-size photo.
        </p>
      </div>

      {!image ? (
        <UploadBox onSelect={handleSelect} />
      ) : (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleReset}
              className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-red-700 transition"
            >
              Choose Another Photo
            </button>
          </div>

          <ImageCropper image={image} />
        </>
      )}
    </section>
  );
}