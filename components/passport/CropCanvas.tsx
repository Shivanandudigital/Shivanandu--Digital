"use client";

import React, { useCallback } from "react";
import Cropper from "react-easy-crop";

interface CropCanvasProps {
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect?: number;
  rotation?: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete?: (croppedArea: any, croppedAreaPixels: any) => void;
}

export default function CropCanvas({
  image,
  crop,
  zoom,
  aspect = 35 / 45,
  rotation = 0,
  onCropChange,
  onZoomChange,
  onCropComplete,
}: CropCanvasProps) {
  // useCallback ব্যবহার করার ফলে প্রতি রেন্ডারে নতুন ফংশন তৈরি হবে না, ইনফিনিট লুপ বন্ধ হবে
  const handleCropChange = useCallback(
    (newCrop: { x: number; y: number }) => {
      onCropChange(newCrop);
    },
    [onCropChange]
  );

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      onZoomChange(newZoom);
    },
    [onZoomChange]
  );

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      if (onCropComplete) {
        onCropComplete(croppedArea, croppedAreaPixels);
      }
    },
    [onCropComplete]
  );

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-gray-900 sm:h-[440px]">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        rotation={rotation}
        onCropChange={handleCropChange}
        onZoomChange={handleZoomChange}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}