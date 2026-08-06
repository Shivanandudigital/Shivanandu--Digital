"use client";

import React from "react";

interface CropControlsProps {
  zoom?: number;
  rotation?: number;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onReset?: () => void;
  [key: string]: any;
}

export default function CropControls({
  zoom = 1,
  rotation = 0,
  onZoomChange,
  onRotationChange,
  onReset,
  ...props
}: CropControlsProps) {
  // zoom যদি undefined, null বা NaN হয়, তবে ডিফল্ট ১ ব্যবহার করা হবে
  const safeZoom = Number.isNaN(Number(zoom)) || zoom == null ? 1 : Number(zoom);
  // rotation যদি undefined, null বা NaN হয়, তবে ডিফল্ট ০ ব্যবহার করা হবে
  const safeRotation = Number.isNaN(Number(rotation)) || rotation == null ? 0 : Number(rotation);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Zoom Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-medium text-gray-700">
          <label htmlFor="zoom-range">Zoom</label>
          <span>{safeZoom.toFixed(1)}x</span>
        </div>
        <input
          id="zoom-range"
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={safeZoom}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (onZoomChange && !isNaN(val)) {
              onZoomChange(val);
            }
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Rotation Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-medium text-gray-700">
          <label htmlFor="rotation-range">Rotation</label>
          <span>{safeRotation}°</span>
        </div>
        <input
          id="rotation-range"
          type="range"
          min={-180}
          max={180}
          step={1}
          value={safeRotation}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (onRotationChange && !isNaN(val)) {
              onRotationChange(val);
            }
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Reset Button */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Reset Framing
        </button>
      )}
    </div>
  );
}