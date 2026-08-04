"use client";

import PreviewPanel from "./PreviewPanel";

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
  backgroundColor: string;
  sizeName: string;
  brightness: number;
  contrast: number;
  saturation: number;
};

export default function RightSidebar({
  image,
  composition,
  face,
  backgroundColor,
  sizeName,
  brightness,
  contrast,
  saturation,
}: Props) {
  return (
    <div className="space-y-6">
      <PreviewPanel
        image={image}
        composition={composition}
        face={face}
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