// lib/composePassport.ts

import { getPassportSizePixels } from "./passportSizes";

type Point = {
  x: number;
  y: number;
};

export type PassportFaceData = {
  forehead: Point;
  chin: Point;
  leftEye: Point;
  rightEye: Point;
};

export type LegacyComposition = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type PassportRenderAdjustments = {
  brightness?: number;
  contrast?: number;
  saturation?: number;
};

export type PassportRenderOptions = {
  canvas?: HTMLCanvasElement;
  sourceImage: string | HTMLImageElement;
  size: string;
  backgroundColor: string;
  cropArea?: { x: number; y: number; width: number; height: number } | null;
  rotation?: number;
  zoom?: number;
  transparentBackground?: boolean;
  adjustments?: PassportRenderAdjustments;
  mimeType?: "image/jpeg" | "image/png";
  quality?: number;
};

export async function loadPassportImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Passport source image could not be loaded."));
    image.src = src;
  });
}

export async function renderFinalPassportCanvas(
  input: PassportRenderOptions
): Promise<HTMLCanvasElement> {
  const canvas = input.canvas ?? document.createElement("canvas");
  const sizePixels = getPassportSizePixels(input.size);
  const canvasWidth = sizePixels.width;
  const canvasHeight = sizePixels.height;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new Error("Canvas context is not available.");
  }

  const sourceImage =
    input.sourceImage instanceof HTMLImageElement
      ? input.sourceImage
      : await loadPassportImage(input.sourceImage);

  if (!sourceImage.complete || sourceImage.naturalWidth <= 0 || sourceImage.naturalHeight <= 0) {
    throw new Error("Passport source image is not fully loaded.");
  }

  const renderWidth = canvasWidth;
  const renderHeight = canvasHeight;

  context.save();
  context.clearRect(0, 0, renderWidth, renderHeight);

  if (!input.transparentBackground) {
    context.fillStyle = input.backgroundColor || "#ffffff";
    context.fillRect(0, 0, renderWidth, renderHeight);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const brightness = input.adjustments?.brightness ?? 100;
  const contrast = input.adjustments?.contrast ?? 100;
  const saturation = input.adjustments?.saturation ?? 100;
  context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const cropArea = input.cropArea;
  const intermediateCanvas = document.createElement("canvas");

  if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
    intermediateCanvas.width = Math.max(1, Math.round(cropArea.width));
    intermediateCanvas.height = Math.max(1, Math.round(cropArea.height));
    const intermediateContext = intermediateCanvas.getContext("2d", { alpha: true });

    if (intermediateContext) {
      intermediateContext.save();
      intermediateContext.translate(intermediateCanvas.width / 2, intermediateCanvas.height / 2);
      intermediateContext.rotate(((input.rotation ?? 0) * Math.PI) / 180);
      intermediateContext.drawImage(
        sourceImage,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        -intermediateCanvas.width / 2,
        -intermediateCanvas.height / 2,
        intermediateCanvas.width,
        intermediateCanvas.height
      );
      intermediateContext.restore();
    }
  }

  const drawableImage = cropArea && cropArea.width > 0 && cropArea.height > 0
    ? intermediateCanvas
    : sourceImage;

  const drawableWidth = drawableImage instanceof HTMLCanvasElement
    ? drawableImage.width
    : drawableImage.naturalWidth;
  const drawableHeight = drawableImage instanceof HTMLCanvasElement
    ? drawableImage.height
    : drawableImage.naturalHeight;

  const maxContentWidth = renderWidth * 0.92;
  const maxContentHeight = renderHeight * 0.9;
  const zoomFactor = input.zoom ?? 1;
  const scale = Math.min(maxContentWidth / drawableWidth, maxContentHeight / drawableHeight) * zoomFactor;
  const contentWidth = drawableWidth * scale;
  const contentHeight = drawableHeight * scale;
  const drawX = (renderWidth - contentWidth) / 2;
  const drawY = renderHeight * 0.06 + (renderHeight - contentHeight) / 2;

  context.drawImage(drawableImage, drawX, drawY, contentWidth, contentHeight);
  context.restore();

  return canvas;
}

export async function renderPassportToCanvas(
  input: PassportRenderOptions
): Promise<HTMLCanvasElement> {
  return renderFinalPassportCanvas(input);
}

export async function composePassportFile(
  input: PassportRenderOptions
): Promise<string> {
  const canvas = await renderFinalPassportCanvas(input);
  return canvas.toDataURL(
    input.mimeType ?? "image/jpeg",
    input.quality ?? 0.95
  );
}

export async function composePassportPhoto(
  image: HTMLImageElement | string,
  size: string,
  backgroundColor: string,
  _headSizeOrComposition?: number | LegacyComposition,
  _faceDetected?: boolean,
  _composition?: LegacyComposition,
  _face?: PassportFaceData,
  options?: Partial<PassportRenderOptions>
): Promise<string> {
  return composePassportFile({
    sourceImage: image,
    size,
    backgroundColor,
    cropArea: options?.cropArea,
    rotation: options?.rotation,
    zoom: options?.zoom,
    transparentBackground: options?.transparentBackground,
    adjustments: options?.adjustments,
    mimeType: options?.mimeType ?? "image/jpeg",
    quality: options?.quality ?? 0.95,
  });
}
