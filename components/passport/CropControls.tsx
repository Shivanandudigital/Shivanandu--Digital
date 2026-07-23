"use client";

type Props = {
  zoom: number;
  rotation: number;
  onZoomChange: (value: number) => void;
  onRotationChange: (value: number) => void;
};

export default function CropControls({
  zoom,
  rotation,
  onZoomChange,
  onRotationChange,
}: Props) {
  return (
   <div className="space-y-6">
      <div>
        <div className="mb-2 flex justify-between">
          <span className="font-semibold">
            Zoom
          </span>

          <span className="text-gray-500">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) =>
            onZoomChange(Number(e.target.value))
          }
    className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
        />
      </div>

      <div>
        <div className="mb-2 flex justify-between">
          <span className="font-semibold">
            Rotation
          </span>

          <span className="text-gray-500">
            {rotation}°
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={360}
          value={rotation}
          onChange={(e) =>
            onRotationChange(Number(e.target.value))
          }
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
        />
      </div>

    </div>
  );
}