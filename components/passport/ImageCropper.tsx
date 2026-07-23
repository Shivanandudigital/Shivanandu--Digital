"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import QualityScore from "./QualityScore";
import { Area } from "react-easy-crop";
import PhotoInfoPanel from "./PhotoInfoPanel";
import CropCanvas from "./CropCanvas";
import EditorToolbar from "./EditorToolbar";
import EditorHeader from "./EditorHeader";
import AISuggestions from "./AISuggestions";
import DownloadPanel from "./DownloadPanel";
import RightSidebar from "./RightSidebar";
import TopToolbar from "./TopToolbar";
import LeftSidebar from "./LeftSidebar";
import PassportComposer from "./PassportComposer";
import { detectFace } from "@/lib/faceDetector";

import { cropImage } from "@/lib/cropImage";
import { getPassportSize } from "@/lib/passportSizes";
import { downloadFile } from "@/lib/downloadImage";
import { downloadPdf } from "@/lib/downloadPdf";
import { createPrintSheet } from "@/lib/createPrintSheet";
import { removeBackground } from "@imgly/background-removal";

type Props = {
  image: string;
  onChooseAnotherPhoto: () => void;
};

export default function ImageCropper({
  image,
  onChooseAnotherPhoto,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
 const [size, setSize] = useState("35x45");

const [backgroundColor, setBackgroundColor] =
  useState("#ffffff");
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string>();
    const [transparentImage, setTransparentImage] =
  useState<string>();
    const [loading, setLoading] =
  useState(false);
const [brightness, setBrightness] = useState(100);
const [contrast, setContrast] = useState(100);
const [saturation, setSaturation] = useState(100);

const [faceDetected, setFaceDetected] = useState(false);
const [faceCentered, setFaceCentered] = useState(false);
const [backgroundOk, setBackgroundOk] = useState(false);

const [headSize, setHeadSize] = useState(0);

const [headStatus, setHeadStatus] = useState<
  "perfect" | "small" | "large" | "unknown"
>("unknown");
const [faceBox, setFaceBox] = useState<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);

  const currentSize = useMemo(
    () => getPassportSize(size),
    [size]
  );

  const onCropComplete = useCallback(
    async (_: Area, croppedPixels: Area) => {

      setCroppedAreaPixels(croppedPixels);

      try {
 const preview = await cropImage(
  transparentImage ?? image,
  croppedPixels,
  rotation,
  "image/jpeg",
  0.95,
  backgroundColor
);

        setPreviewUrl(preview);
      } catch (err) {
        console.error(err);
      }
    },
    [image, rotation, backgroundColor, transparentImage]
  );
useEffect(() => {
  async function updatePreview() {
    if (!croppedAreaPixels) return;

    try {
  const preview = await cropImage(
  transparentImage ?? image,
croppedAreaPixels,
  rotation,
  "image/jpeg",
  0.95,
  backgroundColor,
  brightness,
  contrast,
  saturation
);



      setPreviewUrl(preview);
      runFaceDetection(preview);
    } catch (err) {
      console.error(err);
    }
  }

  updatePreview();
}, [
  backgroundColor,
  transparentImage,
  croppedAreaPixels,
  rotation,
  image,
  brightness,
  contrast,
  saturation,
]);
  async function downloadJPG() {
    if (!croppedAreaPixels) return;

    try {
 const jpg = await cropImage(
  transparentImage ?? image,
  croppedAreaPixels,
  rotation,
  "image/jpeg",
  0.95,
  backgroundColor,
  brightness,
  contrast,
  saturation
);

      downloadFile(jpg, "passport-photo.jpg");
    } catch (err) {
      console.error(err);
    }
  }

  async function downloadPNG() {
    if (!croppedAreaPixels) return;

    try {
  const png = await cropImage(
  transparentImage ?? image,
  croppedAreaPixels,
  rotation,
  "image/png",
  0.95,
  backgroundColor,
  brightness,
  contrast,
  saturation
);
  

      downloadFile(png, "passport-photo.png");
    } catch (err) {
      console.error(err);
    }
  }

  async function downloadPDF() {
    if (!croppedAreaPixels) return;

    try {
    const jpg = await cropImage(
  transparentImage ?? image,
  croppedAreaPixels,
  rotation,
  "image/jpeg",
  0.95,
  backgroundColor,
  brightness,
  contrast,
  saturation
);

      downloadPdf(jpg);
    } catch (err) {
      console.error(err);
    }
  }

  async function downloadPrintSheet() {
    if (!previewUrl) return;

    try {
      const sheet = await createPrintSheet(previewUrl);

      downloadFile(
        sheet,
        "passport-print-sheet.jpg"
      );
    } catch (err) {
      console.error(err);
      alert("Failed to create print sheet.");
    }
  }
 async function runFaceDetection(imageUrl: string) {
  try {
    const img = new Image();
    img.src = imageUrl;

    await new Promise((resolve) => {
      img.onload = () => resolve(true);
    });

    const detections = await detectFace(img);

    if (detections.length === 0) {
      setFaceDetected(false);
      setFaceCentered(false);
      setBackgroundOk(false);
      return;
    }

    setFaceDetected(true);

const detection = detections[0];

if (!detection.boundingBox) {
  setFaceDetected(false);
  setFaceCentered(false);
  setBackgroundOk(false);
  return;
}

const box = detection.boundingBox;
setFaceBox({
  x: box.originX,
  y: box.originY,
  width: box.width,
  height: box.height,
});

// Calculate head size percentage
const headPercent = (box.height / img.height) * 100;

setHeadSize(Math.round(headPercent));

if (headPercent >= 70 && headPercent <= 80) {
  setHeadStatus("perfect");
} else if (headPercent < 70) {
  setHeadStatus("small");
} else {
  setHeadStatus("large");
}

const faceCenterX = box.originX + box.width / 2;
const faceCenterY = box.originY + box.height / 2;

    const imageCenterX = img.width / 2;
    const imageCenterY = img.height / 2;

    // Allow about 8% deviation from center
    const toleranceX = img.width * 0.08;
    const toleranceY = img.height * 0.08;

    const centered =
      Math.abs(faceCenterX - imageCenterX) <= toleranceX &&
      Math.abs(faceCenterY - imageCenterY) <= toleranceY;

      if (!centered) {
  const offsetX = imageCenterX - faceCenterX;
  const offsetY = imageCenterY - faceCenterY;

  console.log("Suggested Center Offset:", {
    x: Math.round(offsetX),
    y: Math.round(offsetY),
  });
}

    setFaceCentered(centered);

    // Temporary background check
    setBackgroundOk(true);

  } catch (err) {
    console.error(err);
  }
}
async function handleRemoveBackground() {
  if (!previewUrl) return;

  try {
    setLoading(true);

    const response = await fetch(previewUrl);
    const blob = await response.blob();

    const output = await removeBackground(blob);

   const url = URL.createObjectURL(output);

setTransparentImage(url);
setPreviewUrl(url);
  } catch (err) {
    console.error(err);
    alert("Background removal failed.");
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="space-y-8">

<EditorHeader
  onChoosePhoto={onChooseAnotherPhoto}
/>

<TopToolbar
  size={size}
  onSizeChange={setSize}
  backgroundColor={backgroundColor}
  onBackgroundChange={setBackgroundColor}
  loading={loading}
  onRemoveBackground={handleRemoveBackground}
/>

  

     <div className="grid gap-8 lg:grid-cols-4">

  {/* Left Sidebar */}
 <div className="lg:sticky lg:top-6 lg:self-start">
  
  <LeftSidebar
  zoom={zoom}
  rotation={rotation}

  brightness={brightness}
  contrast={contrast}
  saturation={saturation}

  onZoomChange={setZoom}
  onRotationChange={setRotation}

  onBrightnessChange={setBrightness}
  onContrastChange={setContrast}
  onSaturationChange={setSaturation}
/>
</div>

  {/* Crop Area */}
 <div className="lg:col-span-2">
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

   <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
  Passport Photo Editor
</h2>

        <p className="mt-1 text-sm text-gray-500">
  Adjust your photo to match ICAO passport standards
</p>
      </div>

     <div className="flex items-center gap-2">

  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
    Live Preview
  </span>

  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
    ICAO Guide
  </span>

</div>

    </div>

    <div className="p-6">
      <CropCanvas
        image={transparentImage ?? image}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={currentSize.aspect}
        headStatus={headStatus}
headSize={headSize}
faceDetected={faceDetected}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
    </div>

<EditorToolbar
  zoom={zoom}
  rotation={rotation}
  onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 3))}
  onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 1))}
  onRotateLeft={() => setRotation((r) => r - 90)}
  onRotateRight={() => setRotation((r) => r + 90)}
/>

  </div>
</div>

  {/* Right Sidebar */}
 <div className="lg:sticky lg:top-6 lg:self-start">
  <RightSidebar
    previewUrl={previewUrl}
    backgroundColor={backgroundColor}
    faceDetected={faceDetected}
    centered={faceCentered}
    backgroundOk={backgroundOk}
    headSize={headSize}
    headStatus={headStatus}
  />
</div>

</div>

<QualityScore
  score={
    (faceDetected ? 25 : 0) +
    (faceCentered ? 25 : 0) +
    (backgroundOk ? 25 : 0) +
    (headStatus === "perfect" ? 25 : 0)
  }
/>

<AISuggestions
  faceDetected={faceDetected}
  centered={faceCentered}
  backgroundOk={backgroundOk}
  headStatus={headStatus}
/>

<PhotoInfoPanel
  faceDetected={faceDetected}
  centered={faceCentered}
  headSize={headSize}
  headStatus={headStatus}
  sizeName={currentSize.name}
/>

<PassportComposer
  image={transparentImage ?? image}
  size={size}
  backgroundColor={backgroundColor}
/>

<DownloadPanel
  onDownloadJPG={downloadJPG}
  onDownloadPNG={downloadPNG}
  onDownloadPDF={downloadPDF}
  onPrint={downloadPrintSheet}
/>

    </div>
  );
}