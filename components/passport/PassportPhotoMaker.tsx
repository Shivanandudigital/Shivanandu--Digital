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
   

      {!image ? (
        <UploadBox onSelect={handleSelect} />
      ) : (
        <>
         

         <ImageCropper
  image={image}
  onChooseAnotherPhoto={handleReset}
/>
        </>
      )}
    </section>
  );
}