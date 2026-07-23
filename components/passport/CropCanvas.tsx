"use client";
import EyeAlignmentGuide from "./EyeAlignmentGuide";
import Cropper, { Area, Point } from "react-easy-crop";

type Props = {
  image: string;
  crop: Point;
  zoom: number;
  rotation: number;
  aspect: number;
  headStatus: "perfect" | "small" | "large" | "unknown";
headSize: number;
faceDetected: boolean;

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
  headStatus,
  headSize,
  faceDetected,
  onCropChange,
  onZoomChange,
  onCropComplete,
}: Props) {

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl bg-gray-900">
<div className="absolute right-4 top-4 z-20 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
  🔍 {zoom.toFixed(1)}x
</div>
<div className="absolute right-4 top-14 z-20 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
  🔄 {rotation}°
</div>

      {/* ICAO Guide Overlay */}
<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">

  <div className="relative h-[78%] w-[58%] rounded border-2 border-white/80">

{/* Safe Area */}
<div className="absolute left-[12%] top-[10%] h-[80%] w-[76%] rounded border border-white/30 border-dashed" /> 
<div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2">

  <div className="absolute left-1/2 top-0 h-5 border-l border-red-400" />

  <div className="absolute top-1/2 left-0 w-5 border-t border-red-400" />

</div>

    {/* Eye Line */}
    <div className="absolute left-0 right-0 top-[35%] border-t-2 border-cyan-400 border-dashed" />

    {/* Chin Line */}
    <div className="absolute left-0 right-0 bottom-[18%] border-t-2 border-yellow-400 border-dashed" />

    {/* Head Guide */}
    <div
  className={`absolute left-1/2 top-[18%] h-28 w-28 -translate-x-1/2 rounded-full border-2 border-dashed ${
    headStatus === "perfect"
      ? "border-green-400"
      : headStatus === "unknown"
      ? "border-gray-400"
      : "border-orange-400"
  }`}
/>

<div className="absolute left-1/2 top-[52%] -translate-x-1/2">

  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      headStatus === "perfect"
        ? "bg-green-100 text-green-700"
        : headStatus === "unknown"
        ? "bg-gray-100 text-gray-600"
        : "bg-orange-100 text-orange-700"
    }`}
  >
    {headStatus === "perfect"
      ? "Perfect Head Size"
      : headStatus === "small"
      ? "Head Too Small"
      : headStatus === "large"
      ? "Head Too Large"
      : "Detecting..."}
  </span>

</div>

  </div>

</div> 

<div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
  <p className="rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white">
    {!faceDetected
      ? "📷 Looking for a face..."
      : headStatus === "perfect"
      ? "✅ Perfect position. Ready for passport photo."
      : headStatus === "small"
      ? "➡️ Move a little closer to the camera."
      : "⬅️ Move a little farther from the camera."}
  </p>
</div>

{/* Premium Corner Guides */}
<div className="pointer-events-none absolute inset-0 z-20">

  {/* Top Left */}
  <div className="absolute left-[21%] top-[11%] h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-white" />

  {/* Top Right */}
  <div className="absolute right-[21%] top-[11%] h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-white" />

  {/* Bottom Left */}
  <div className="absolute bottom-[11%] left-[21%] h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-white" />

  {/* Bottom Right */}
  <div className="absolute bottom-[11%] right-[21%] h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-white" />

</div>

<EyeAlignmentGuide
  faceDetected={faceDetected}
  headStatus={headStatus}
/>
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