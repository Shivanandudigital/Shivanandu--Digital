"use client";

import PortraitCanvas from "./PortraitCanvas";

type FaceData = {
  forehead: { x: number; y: number };
  chin: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
};

type Composition = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  image: HTMLImageElement | null;
  composition: Composition;
  face: FaceData;
  backgroundColor?: string;
};

export default function PreviewPanel({
  image,
  composition,
  face,
  backgroundColor = "#ffffff",
}: Props) {
  const transparentBackground = backgroundColor === "transparent";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-xl font-bold text-gray-900">Final Preview</h3>

      <div className="flex min-h-[302px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-3 sm:min-h-[318px] sm:p-6">
        {image ? (
          <PortraitCanvas
            image={image}
            composition={composition}
            face={face}
            backgroundColor={backgroundColor}
            transparentBackground={transparentBackground}
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
