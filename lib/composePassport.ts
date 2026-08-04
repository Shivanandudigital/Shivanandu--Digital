// lib/composePassport.ts

import {
  canvasToDataUrl,
  renderPassport,
} from "./vision/professional/passportRenderer";

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
  image: HTMLImageElement;
  size: string;
  backgroundColor: string;
  face: PassportFaceData;
  composition?: LegacyComposition;
  transparentBackground?: boolean;
  adjustments?: PassportRenderAdjustments;
  smoothingQuality?: ImageSmoothingQuality;
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

export function renderPassportToCanvas(
  input: PassportRenderOptions
): HTMLCanvasElement {
  if (
    !input.image ||
    !input.image.complete ||
    input.image.naturalWidth <= 0 ||
    input.image.naturalHeight <= 0
  ) {
    throw new Error("Passport source image is not fully loaded.");
  }

  const canvas = input.canvas ?? document.createElement("canvas");
  const result = renderPassport({
    canvas,
    image: input.image,
    face: input.face,
    size: input.size,
    backgroundColor: input.backgroundColor,
    transparentBackground: input.transparentBackground ?? false,
    autoCompose: false,
    manualComposition: input.composition
      ? {
          scale: input.composition.scale,
          offsetX: input.composition.offsetX,
          offsetY: input.composition.offsetY,
        }
      : undefined,
    smoothingQuality: input.smoothingQuality ?? "high",
    adjustments: input.adjustments,
  });

  if (!result.success) {
    throw new Error(result.error ?? "Passport photo composition failed.");
  }

  return canvas;
}

export function composePassportFile(
  input: PassportRenderOptions
): string {
  const canvas = renderPassportToCanvas(input);
  return canvasToDataUrl(
    canvas,
    input.mimeType ?? "image/jpeg",
    input.quality ?? 0.95
  );
}

/**
 * Legacy compatibility helper for older passport composer components.
 */
export async function composePassportPhoto(
  image: HTMLImageElement,
  size: string,
  backgroundColor: string,
  _headSize: number,
  _faceDetected: boolean,
  composition: LegacyComposition | undefined,
  face: PassportFaceData,
  options?: Partial<PassportRenderOptions>
): Promise<string> {
  return composePassportFile({
    image,
    size,
    backgroundColor,
    face,
    composition,
    mimeType: "image/jpeg",
    quality: 0.95,
    ...options,
  });
}
