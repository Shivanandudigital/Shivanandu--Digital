"use client";
import Cropper, { Area, Point } from "react-easy-crop";

type Props = {
  image: string;
  crop: Point;
  zoom: number;
  rotation: number;
  aspect: number;
  onCropChange: (crop: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
};

export default function CropCanvas({
  image,
  crop,
  zoom,
  rotation,
  aspect,
  onCropChange,
  onZoomChange,
  onCropComplete,
}: Props) {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-gray-900 sm:h-[440px] sm:rounded-2xl lg:h-[500px]">
      <div className="absolute right-2 top-2 z-20 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
        🔍 {zoom.toFixed(1)}x
      </div>
      <div className="absolute right-2 top-11 z-20 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white sm:right-4 sm:top-14 sm:px-3 sm:text-xs">
        🔄 {rotation}°
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative h-[78%] w-[58%] rounded border-2 border-white/60" />
      </div>

      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={aspect}
        objectFit="contain"
        restrictPosition={false}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={onCropComplete}
        showGrid={true}
        cropShape="rect"
      />
    </div>
  );
}
