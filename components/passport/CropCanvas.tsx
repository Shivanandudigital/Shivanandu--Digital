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
  onCropComplete: (
    croppedArea: Area,
    croppedAreaPixels: Area
  ) => void;
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
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-gray-900">
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
      />
    </div>
  );
}