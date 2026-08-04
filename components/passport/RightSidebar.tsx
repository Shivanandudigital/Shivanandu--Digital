"use client";

import PreviewPanel from "./PreviewPanel";

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  sourceImage: string | HTMLImageElement | null;
  cropArea?: CropArea | null;
  rotation?: number;
  zoom?: number;
  size?: string;
  backgroundColor: string;
  sizeName: string;
  brightness: number;
  contrast: number;
  saturation: number;
};

export default function RightSidebar({
  sourceImage,
  cropArea,
  rotation = 0,
  zoom = 1,
  size = "35x45",
  backgroundColor,
  sizeName,
  brightness,
  contrast,
  saturation,
}: Props) {
  return (
    <div className="space-y-6">
      <PreviewPanel
        sourceImage={sourceImage}
        cropArea={cropArea}
        rotation={rotation}
        zoom={zoom}
        size={size}
        backgroundColor={backgroundColor}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-gray-900">Output Summary</h3>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <div className="flex items-center justify-between gap-4">
            <span>Passport size</span>
            <span className="font-medium text-gray-800">{sizeName}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Background</span>
            <span className="font-medium text-gray-800">{backgroundColor}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Brightness</span>
            <span className="font-medium text-gray-800">{brightness}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Contrast</span>
            <span className="font-medium text-gray-800">{contrast}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Saturation</span>
            <span className="font-medium text-gray-800">{saturation}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}