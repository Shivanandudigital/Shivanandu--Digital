"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Area } from "react-easy-crop";

import CropCanvas from "./CropCanvas";
import CropControls from "./CropControls";
import SizeSelector from "./SizeSelector";
import PreviewPanel from "./PreviewPanel";
import DownloadPanel from "./DownloadPanel";
import BackgroundSelector from "./BackgroundSelector";
import BackgroundRemover from "./BackgroundRemover";
import { detectFace } from "@/lib/faceDetector";
import CompliancePanel from "./CompliancePanel";
import { cropImage } from "@/lib/cropImage";
import { getPassportSize } from "@/lib/passportSizes";
import { downloadFile } from "@/lib/downloadImage";
import { downloadPdf } from "@/lib/downloadPdf";
import { createPrintSheet } from "@/lib/createPrintSheet";
import { removeBackground } from "@imgly/background-removal";
import PhotoAdjustments from "./PhotoAdjustments";
type Props = {
  image: string;
};

export default function ImageCropper({ image }: Props) {
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

      <SizeSelector
        value={size}
        onChange={setSize}
      />
<BackgroundSelector
  value={backgroundColor}
  onChange={setBackgroundColor}
/>
<BackgroundRemover
  loading={loading}
  onRemove={handleRemoveBackground}
/>
<PhotoAdjustments
  brightness={brightness}
  contrast={contrast}
  saturation={saturation}
  onBrightnessChange={setBrightness}
  onContrastChange={setContrast}
  onSaturationChange={setSaturation}
/>
      <div className="grid gap-8 lg:grid-cols-3">

        <div className="lg:col-span-2">
          
          <CropCanvas
  image={transparentImage ?? image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={currentSize.aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />

        </div>

     <PreviewPanel
  previewUrl={previewUrl}
  backgroundColor={backgroundColor}
/>

<CompliancePanel
  faceDetected={faceDetected}
  centered={faceCentered}
  backgroundOk={backgroundOk}
  headSize={headSize}
  headStatus={headStatus}
/>
      </div>

      <CropControls
  zoom={zoom}
  rotation={rotation}
  onZoomChange={setZoom}
  onRotationChange={setRotation}
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