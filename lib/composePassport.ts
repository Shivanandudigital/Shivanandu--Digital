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

/**
 * Final passport image তৈরি করে।
 *
 * গুরুত্বপূর্ণ:
 * পুরোনো headSize, faceDetected ও composition arguments রাখা হয়েছে
 * যাতে বর্তমান components-এ TypeScript error না আসে।
 *
 * Final framing-এর একমাত্র source এখন:
 * lib/vision/professional/passportRenderer.ts
 */
export async function composePassportPhoto(
  image: HTMLImageElement,
  size: string,
  backgroundColor: string,
  _headSize: number,
  _faceDetected: boolean,
  _composition: LegacyComposition,
  face: PassportFaceData
): Promise<string> {
  if (
    !image ||
    !image.complete ||
    image.naturalWidth <= 0 ||
    image.naturalHeight <= 0
  ) {
    throw new Error("Passport source image is not fully loaded.");
  }

  const canvas = document.createElement("canvas");

  const result = renderPassport({
    canvas,
    image,
    face,
    size,
    backgroundColor,

    // Preview এবং final output—দুটোতেই একই engine।
    autoCompose: true,

    smoothingQuality: "high",
  });

  if (!result.success) {
    throw new Error(
      result.error ?? "Passport photo composition failed."
    );
  }

  return canvasToDataUrl(
    canvas,
    "image/jpeg",
    0.95
  );
}
