"use client";

import { useState } from "react";
import UploadBox from "./passport/UploadBox";
import ImageCropper from "./passport/ImageCropper";

export default function PassportPhotoMaker() {
  const [image, setImage] = useState<string | null>(null);

  function handleSelect(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">

      <h2 className="text-3xl font-bold mb-2">
        Passport Photo Maker
      </h2>

      <p className="text-gray-500 mb-8">
        Upload your image, crop it and create passport-size photos.
      </p>

      {!image ? (
        <UploadBox onSelect={handleSelect} />
      ) : (
        <ImageCropper image={image} />
      )}

    </div>
  );
}