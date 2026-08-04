"use client";

import { useState } from "react";
import UploadBox from "./UploadBox";
import ImageCropper from "./ImageCropper";
import { removeImageBackground } from "@/lib/background/removeBackground";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(
        new Error("Selected image could not be read.")
      );
    };

    reader.onerror = () => {
      reject(
        new Error("Selected image could not be read.")
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function PassportPhotoMaker() {
  const [image, setImage] =
    useState<string | null>(null);

  const [
    isRemovingBackground,
    setIsRemovingBackground,
  ] = useState(false);

  const [
    processingProgress,
    setProcessingProgress,
  ] = useState(0);

  const [
    processingMessage,
    setProcessingMessage,
  ] = useState("Preparing AI model...");

  const [
    backgroundError,
    setBackgroundError,
  ] = useState<string | null>(null);

  const handleSelect = async (file: File) => {
    setImage(null);
    setBackgroundError(null);
    setProcessingProgress(0);
    setProcessingMessage("Preparing AI model...");
    setIsRemovingBackground(true);

    try {
      const transparentImage =
        await removeImageBackground(
          file,
          (progress) => {
            setProcessingProgress(progress);

            if (progress < 20) {
              setProcessingMessage(
                "Loading background removal model..."
              );
            } else if (progress < 60) {
              setProcessingMessage(
                "Detecting the person..."
              );
            } else if (progress < 95) {
              setProcessingMessage(
                "Removing background..."
              );
            } else {
              setProcessingMessage(
                "Creating passport photo..."
              );
            }
          }
        );

      setImage(transparentImage);
      setProcessingProgress(100);
      setProcessingMessage(
        "Background removed successfully. Review the preview before downloading."
      );
    } catch (error) {
      console.error(
        "Automatic background removal failed:",
        error
      );

      try {
        const originalImage =
          await readFileAsDataUrl(file);

        setImage(originalImage);

        setBackgroundError(
          "Background automatically remove করা যায়নি। Original photo ব্যবহার করা হয়েছে।"
        );
      } catch (fileError) {
        console.error(
          "Image reading failed:",
          fileError
        );

        setBackgroundError(
          "ছবিটি process করা যায়নি। অন্য একটি JPG, PNG অথবা WEBP ছবি চেষ্টা করুন।"
        );
      }
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setProcessingProgress(0);
    setProcessingMessage(
      "Preparing AI model..."
    );
    setBackgroundError(null);
    setIsRemovingBackground(false);
  };

  return (
    <section className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl sm:rounded-3xl sm:p-5 md:p-8">
      {!image && !isRemovingBackground ? (
        <UploadBox onSelect={handleSelect} />
      ) : null}

      {isRemovingBackground ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white px-4 text-center sm:min-h-[420px] sm:rounded-3xl sm:px-6">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <span className="text-2xl">🤖</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Processing Image
          </h2>

          <p className="mt-3 text-sm font-medium text-gray-600">
            {processingMessage}
          </p>

          <div className="mt-7 h-3 w-full max-w-md overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${processingProgress}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm font-bold text-blue-700">
            {processingProgress > 0
              ? `${processingProgress}%`
              : "Starting..."}
          </p>

          <p className="mt-5 max-w-md text-xs leading-5 text-gray-500">
            The first pass may take a little longer while the image is prepared.
          </p>
        </div>
      ) : null}

      {image && !isRemovingBackground ? (
        <>
          {backgroundError ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {backgroundError}
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
              Background removed successfully. Review the preview before downloading.
            </div>
          )}

          <ImageCropper
            image={image}
            onChooseAnotherPhoto={handleReset}
          />
        </>
      ) : null}
    </section>
  );
}
