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
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-5 text-xl font-bold text-gray-900">
        Live Preview
      </h3>

      {/*
       * গুরুত্বপূর্ণ:
       * এই wrapper-এ নির্বাচিত passport background colour দেওয়া হবে না।
       *
       * নির্বাচিত colour শুধু PortraitCanvas-এর ভিতরে render হবে।
       */}
      <div className="flex min-h-[302px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100 p-3 sm:min-h-[318px] sm:p-6">
        {image ? (
          <PortraitCanvas
            image={image}
            composition={composition}
            face={face}
            backgroundColor={backgroundColor}
            width={210}
            height={270}
          />
        ) : (
          <div className="flex h-[270px] w-[210px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-5 text-center text-sm text-gray-500">
            Upload a photo to see the live preview.
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            Preview
          </span>

          <span className="font-semibold text-green-600">
            Live
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            Composition
          </span>

          <span className="font-semibold text-blue-600">
            AI Engine
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            Background
          </span>

          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border border-gray-300"
              style={{ backgroundColor }}
            />

            <span className="font-mono text-xs font-semibold uppercase text-gray-700">
              {backgroundColor}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            Status
          </span>

          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
            Ready
          </span>
        </div>
      </div>
    </section>
  );
}
