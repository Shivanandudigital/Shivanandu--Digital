"use client";

import PortraitCanvas from "./PortraitCanvas";

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
  backgroundColor?: string;
  transparentBackground?: boolean;
  adjustments?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
};

export default function PreviewPanel({
  sourceImage,
  cropArea,
  rotation = 0,
  zoom = 1,
  size = "35x45",
  backgroundColor = "#ffffff",
  transparentBackground = false,
  adjustments,
}: Props) {
  const effectiveTransparentBackground = transparentBackground || backgroundColor === "transparent";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-xl font-bold text-gray-900">Final Preview</h3>

      <div className="flex min-h-[302px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-3 sm:min-h-[318px] sm:p-6">
        {sourceImage ? (
          <PortraitCanvas
            sourceImage={sourceImage}
            cropArea={cropArea}
            rotation={rotation}
            zoom={zoom}
            size={size}
            backgroundColor={backgroundColor}
            transparentBackground={effectiveTransparentBackground}
            adjustments={adjustments}
            width={210}
            height={270}
          />
        ) : (
          <div className="flex h-[270px] w-[210px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-5 text-center text-sm text-gray-500">
            Upload a photo to see the final preview.
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Preview your photo carefully before downloading. Acceptance requirements may vary by authority.
      </p>
    </section>
  );
}
