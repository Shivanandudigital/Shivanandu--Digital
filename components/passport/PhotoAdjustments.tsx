"use client";

type Props = {
  brightness: number;
  contrast: number;
  saturation: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
};

export default function PhotoAdjustments({
  brightness,
  contrast,
  saturation,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
}: Props) {
  return (
<div className="space-y-5">
     

      <div>
        <label className="font-medium">
          Brightness ({brightness}%)
        </label>

        <input
          type="range"
          min="50"
          max="150"
          value={brightness}
          onChange={(e) =>
            onBrightnessChange(Number(e.target.value))
          }
         className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
        />
      </div>

      <div>
        <label className="font-medium">
          Contrast ({contrast}%)
        </label>

        <input
          type="range"
          min="50"
          max="150"
          value={contrast}
          onChange={(e) =>
            onContrastChange(Number(e.target.value))
          }
     className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
        />
      </div>

      <div>
        <label className="font-medium">
          Saturation ({saturation}%)
        </label>

        <input
          type="range"
          min="0"
          max="200"
          value={saturation}
          onChange={(e) =>
            onSaturationChange(Number(e.target.value))
          }
         className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
        />
      </div>
    </div>
  );
}