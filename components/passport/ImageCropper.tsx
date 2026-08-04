"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Area } from "react-easy-crop";
import CropCanvas from "./CropCanvas";
import EditorToolbar from "./EditorToolbar";
import EditorHeader from "./EditorHeader";
import DownloadPanel from "./DownloadPanel";
import RightSidebar from "./RightSidebar";
import TopToolbar from "./TopToolbar";
import LeftSidebar from "./LeftSidebar";

import { detectFace } from "@/lib/faceDetector";
import { cropImage } from "@/lib/cropImage";
import { getPassportSize } from "@/lib/passportSizes";
import { downloadFile } from "@/lib/downloadImage";
import { downloadPdf } from "@/lib/downloadPdf";
import { createPrintSheet } from "@/lib/createPrintSheet";
import { removeBackground } from "@imgly/background-removal";
import { analyzeFace } from "@/lib/vision/faceAnalyzer";
import { calculateAutoComposition } from "@/lib/vision/professional/autoComposition";
import { getPassportLayoutFromSize } from "@/lib/vision/professional/passportLayout";
import { renderPassportToCanvas } from "@/lib/composePassport";
import { canvasToDataUrl } from "@/lib/vision/professional/passportRenderer";



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
const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);

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
const createProfessionalDownload = useCallback(
  (mimeType: "image/jpeg" | "image/png") => {
    if (!previewImage || !faceDetected) {
      throw new Error("The passport photo is not ready yet.");
    }

    const canvas = document.createElement("canvas");
    renderPassportToCanvas({
      canvas,
      image: previewImage,
      face,
      size,
      backgroundColor,
      transparentBackground: backgroundColor === "transparent",
      composition,
      smoothingQuality: "high",
      adjustments: {
        brightness,
        contrast,
        saturation,
      },
    });

    return canvasToDataUrl(
      canvas,
      mimeType,
      mimeType === "image/jpeg" ? 0.95 : 1
    );
  },
  [backgroundColor, brightness, composition, contrast, face, faceDetected, previewImage, saturation, size]
);

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

    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error("The selected image could not be loaded."));
    });

    setPreviewImage(img);

    const result = await detectFace(img);

    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      setFaceDetected(false);
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
    const detectedFace = analyzeFace(landmarks);
    setFace({
      forehead: detectedFace.forehead,
      chin: detectedFace.chin,
      leftEye: detectedFace.leftEye,
      rightEye: detectedFace.rightEye,
    });

    const layout = getPassportLayoutFromSize(size);
    const professionalComposition = calculateAutoComposition({
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      canvasWidth: layout.canvasWidth,
      canvasHeight: layout.canvasHeight,
      face: {
        forehead: {
          x: detectedFace.forehead.x * img.naturalWidth,
          y: detectedFace.forehead.y * img.naturalHeight,
        },
        chin: {
          x: detectedFace.chin.x * img.naturalWidth,
          y: detectedFace.chin.y * img.naturalHeight,
        },
        leftEye: {
          x: detectedFace.leftEye.x * img.naturalWidth,
          y: detectedFace.leftEye.y * img.naturalHeight,
        },
        rightEye: {
          x: detectedFace.rightEye.x * img.naturalWidth,
          y: detectedFace.rightEye.y * img.naturalHeight,
        },
      },
      rules: layout.rules,
    });

    const newComposition = {
      scale: professionalComposition.scale,
      offsetX: professionalComposition.offsetX,
      offsetY: professionalComposition.offsetY,
    };

    setComposition(newComposition);
    setZoom(1);
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
      await runFaceDetection(preview);
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
  Simple Editor
</h2>

        <p className="mt-1 text-sm text-gray-500">
  Adjust the frame, background, and final preview before you download.
</p>
      </div>

    </div>

    <div className="p-3 sm:p-6">
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
  sizeName={currentSize.name}
  brightness={brightness}
  contrast={contrast}
  saturation={saturation}
/>
</div>

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
