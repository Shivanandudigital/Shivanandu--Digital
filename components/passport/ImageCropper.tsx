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

import { detectFace } from "@/lib/faceDetector";
import { calculateFaceBox } from "@/lib/vision/faceBox";
import { cropImage } from "@/lib/cropImage";
import { getPassportSize } from "@/lib/passportSizes";
import { downloadFile } from "@/lib/downloadImage";
import { downloadPdf } from "@/lib/downloadPdf";
import { createPrintSheet } from "@/lib/createPrintSheet";
import { removeBackground } from "@imgly/background-removal";
import { analyzeFace } from "@/lib/vision/faceAnalyzer";
import { calculateAutoComposition } from "@/lib/vision/professional/autoComposition";
import { getPassportLayoutFromSize } from "@/lib/vision/professional/passportLayout";
import {
  canvasToDataUrl,
  renderPassport,
} from "@/lib/vision/professional/passportRenderer";



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
const [eyeLineOk, setEyeLineOk] = useState(false);
const [headSize, setHeadSize] = useState(0);

const [headStatus, setHeadStatus] = useState<
  "perfect" | "small" | "large" | "unknown"
>("unknown");
const [previewImage, setPreviewImage] =
  useState<HTMLImageElement | null>(null);

const [face, setFace] = useState({
  forehead: { x: 0, y: 0 },
  chin: { x: 0, y: 0 },
  leftEye: { x: 0, y: 0 },
  rightEye: { x: 0, y: 0 },
});

const [composition, setComposition] =
  useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
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
function createProfessionalDownload(
  mimeType: "image/jpeg" | "image/png"
): string {
  if (!previewImage || !faceDetected) {
    throw new Error(
      "The professional passport photo is not ready yet."
    );
  }

  const canvas = document.createElement("canvas");
  const result = renderPassport({
    canvas,
    image: previewImage,
    face,
    size,
    backgroundColor,
    transparentBackground: false,
    autoCompose: true,
    smoothingQuality: "high",
    adjustments: {
      brightness,
      contrast,
      saturation,
    },
  });

  if (!result.success) {
    throw new Error(
      result.error ?? "Professional passport rendering failed."
    );
  }

  return canvasToDataUrl(
    canvas,
    mimeType,
    mimeType === "image/jpeg" ? 0.95 : 1
  );
}

async function downloadJPG() {
  try {
    const jpg = createProfessionalDownload("image/jpeg");
    downloadFile(jpg, "passport-photo.jpg");
  } catch (err) {
    console.error(err);
    alert("Passport JPG তৈরি করা যায়নি।");
  }
}

async function downloadPNG() {
  try {
    const png = createProfessionalDownload("image/png");
    downloadFile(png, "passport-photo.png");
  } catch (err) {
    console.error(err);
    alert("Passport PNG তৈরি করা যায়নি।");
  }
}

async function downloadPDF() {
  try {
    const jpg = createProfessionalDownload("image/jpeg");
    downloadPdf(jpg);
  } catch (err) {
    console.error(err);
    alert("Passport PDF তৈরি করা যায়নি।");
  }
}

async function downloadPrintSheet() {
  try {
    const passportPhoto =
      createProfessionalDownload("image/jpeg");
    const sheet = await createPrintSheet(passportPhoto);

    downloadFile(
      sheet,
      "passport-print-sheet.jpg"
    );
  } catch (err) {
    console.error(err);
    alert("Failed to create print sheet.");
  }
}

function handleAutoZoom() {
  setZoom(1);

  setComposition((previous) => ({
    ...previous,
    scale: 1,
  }));
}

const runFaceDetection = useCallback(async (imageUrl: string) => {

  try {
    const img = new Image();
    img.src = imageUrl;

    await new Promise((resolve) => {
      img.onload = () => resolve(true);
    });

    setPreviewImage(img);

    const result = await detectFace(img);

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      setFaceDetected(false);
      setFaceCentered(false);
      setBackgroundOk(false);
      setEyeLineOk(false);
      setHeadSize(0);
      setHeadStatus("unknown");
      setFace({
        forehead: { x: 0, y: 0 },
        chin: { x: 0, y: 0 },
        leftEye: { x: 0, y: 0 },
        rightEye: { x: 0, y: 0 },
      });
      
      return;
    }

    setFaceDetected(true);

const landmarks = result.faceLandmarks[0];
const face = analyzeFace(landmarks);
setFace({
  forehead: face.forehead,
  chin: face.chin,
  leftEye: face.leftEye,
  rightEye: face.rightEye,
});

const layout = getPassportLayoutFromSize(size);
const professionalComposition = calculateAutoComposition({
  imageWidth: img.naturalWidth,
  imageHeight: img.naturalHeight,
  canvasWidth: layout.canvasWidth,
  canvasHeight: layout.canvasHeight,
  face: {
    forehead: {
      x: face.forehead.x * img.naturalWidth,
      y: face.forehead.y * img.naturalHeight,
    },
    chin: {
      x: face.chin.x * img.naturalWidth,
      y: face.chin.y * img.naturalHeight,
    },
    leftEye: {
      x: face.leftEye.x * img.naturalWidth,
      y: face.leftEye.y * img.naturalHeight,
    },
    rightEye: {
      x: face.rightEye.x * img.naturalWidth,
      y: face.rightEye.y * img.naturalHeight,
    },
  },
  rules: layout.rules,
});

const professionalHeadSize = Math.round(
  professionalComposition.headHeightRatio * 100
);
const professionalHeadStatus:
  | "perfect"
  | "small"
  | "large" =
  professionalComposition.compliance.headTooSmall
    ? "small"
    : professionalComposition.compliance.headTooLarge
      ? "large"
      : "perfect";
const newComposition = {
  scale: professionalComposition.scale,
  offsetX: professionalComposition.offsetX,
  offsetY: professionalComposition.offsetY,
};

setEyeLineOk(
  professionalComposition.compliance.eyeLineOk
);

console.log("Sending Analysis:", {
  headSize: professionalHeadSize,
  faceDetected: true,
  faceCentered:
    professionalComposition.compliance.faceCentered,
  eyeLineOk:
    professionalComposition.compliance.eyeLineOk,
  headStatus: professionalHeadStatus,
  composition: newComposition,
});
setComposition(newComposition);
setZoom(1);

console.log("newComposition before onAnalysis:", newComposition);
console.log("Sending Face:", face);

console.log("Composition:", newComposition);

const box = calculateFaceBox(
  landmarks,
  img.width,
  img.height
);

console.log("Left Eye:", face.leftEye);
console.log("Right Eye:", face.rightEye);
console.log("Nose:", face.nose);
console.log("Mouth:", face.mouth);
console.log("Forehead:", face.forehead);
console.log("Chin:", face.chin);

const eyeCenterX = (face.leftEye.x + face.rightEye.x) / 2;
const eyeCenterY = (face.leftEye.y + face.rightEye.y) / 2;

console.log("Eye Center X:", eyeCenterX);
console.log("Eye Center Y:", eyeCenterY);

// আপাতত শুধু টেস্ট করার জন্য
console.log("Landmarks:", landmarks.length);
// Debug
const headPercent = (box.height / img.height) * 100;

console.log(
  "Professional Head Size:",
  professionalHeadSize
);
console.log("FaceBox Height:", box.height);
console.log("Calculated Head Percent:", headPercent);

// The rendered professional composition is the single source of truth.
setHeadSize(professionalHeadSize);
setHeadStatus(professionalHeadStatus);




const faceCenterX = box.x + box.width / 2;
const faceCenterY = box.y + box.height / 2;

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

    setFaceCentered(
      professionalComposition.compliance.faceCentered
    );

    // Temporary background check
    setBackgroundOk(true);

  } catch (err) {
    console.error(err);
  }
}, [size]);

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
      await runFaceDetection(
        transparentImage ?? image
      );
    } catch (err) {
      console.error(err);
    }
  }

  void updatePreview();
}, [
  backgroundColor,
  transparentImage,
  croppedAreaPixels,
  rotation,
  image,
  brightness,
  contrast,
  saturation,
  runFaceDetection,
]);

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

console.log("Parent headSize:", headSize);
console.log("Parent faceDetected:", faceDetected);

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

  

     <div className="grid min-w-0 gap-6 xl:grid-cols-4 xl:gap-8">

  {/* Left Sidebar */}
 <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
  
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
 <div className="min-w-0 xl:col-span-2">
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

   <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
  Passport Photo Editor
</h2>

        <p className="mt-1 text-sm text-gray-500">
  Adjust your photo to match ICAO passport standards
</p>
      </div>

     <div className="flex flex-wrap items-center gap-2">

  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
    Live Preview
  </span>

  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
    ICAO Guide
  </span>

</div>

    </div>

    <div className="p-3 sm:p-6">
      <CropCanvas
        image={transparentImage ?? image}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={currentSize.aspect}
        headStatus={headStatus}
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
  onAutoZoom={handleAutoZoom}
/>

  </div>
</div>

  {/* Right Sidebar */}
 <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
  <RightSidebar
image={previewImage}
  composition={composition}
  face={face}
  backgroundColor={backgroundColor}
  faceDetected={faceDetected}
  centered={faceCentered}
  backgroundOk={backgroundOk}
  eyeLineOk={eyeLineOk}
  headSize={headSize}
  headStatus={headStatus}
/>
</div>

</div>

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
</div>

<DownloadPanel
  onDownloadJPG={downloadJPG}
  onDownloadPNG={downloadPNG}
  onDownloadPDF={downloadPDF}
  onPrint={downloadPrintSheet}
/>

    </div>
  );
}
