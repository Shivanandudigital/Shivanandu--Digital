import type { Composition, FaceData, PassportAnalysis, PassportSize } from "@/types/passport";

const TARGET_HEAD_HEIGHT = 0.48;
const TARGET_EYE_LINE = 0.35;
const MAX_TILT_CORRECTION = 8;

export function faceFromLandmarks(landmarks: { x: number; y: number }[]): FaceData {
  const forehead = landmarks[10];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  if (!forehead || !chin || !leftEye || !rightEye) throw new Error("Face landmarks are incomplete.");

  return {
    forehead: { x: forehead.x, y: Math.max(0, forehead.y - 0.075) },
    chin: { x: chin.x, y: chin.y },
    leftEye: { x: leftEye.x, y: leftEye.y },
    rightEye: { x: rightEye.x, y: rightEye.y },
    eyeTilt: Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
  };
}

export function calculatePassportAnalysis(face: FaceData, imageWidth: number, imageHeight: number, size: PassportSize): PassportAnalysis {
  const eyeX = ((face.leftEye.x + face.rightEye.x) / 2) * imageWidth;
  const eyeY = ((face.leftEye.y + face.rightEye.y) / 2) * imageHeight;
  const headTop = face.forehead.y * imageHeight;
  const chinY = face.chin.y * imageHeight;
  const headHeight = Math.max(1, chinY - headTop);
  const aspect = size.widthMm / size.heightMm;

  // The wider frame deliberately leaves room for natural shoulders and avoids face-only crops.
  let frameHeight = Math.min(imageHeight, headHeight / TARGET_HEAD_HEIGHT);
  let frameWidth = frameHeight * aspect;
  if (frameWidth > imageWidth) {
    frameWidth = imageWidth;
    frameHeight = frameWidth / aspect;
  }

  const offsetX = Math.max(0, Math.min(eyeX - frameWidth / 2, imageWidth - frameWidth));
  const offsetY = Math.max(0, Math.min(eyeY - frameHeight * TARGET_EYE_LINE, imageHeight - frameHeight));
  const composition: Composition = { scale: imageHeight / frameHeight, offsetX, offsetY };
  const headHeightPercent = (headHeight / frameHeight) * 100;
  const eyeLinePercent = ((eyeY - offsetY) / frameHeight) * 100;
  const lowerPortraitSpace = offsetY + frameHeight - chinY;
  const shouldersAvailable = lowerPortraitSpace >= headHeight * 0.65;
  const headSizeValid = headHeightPercent >= 42 && headHeightPercent <= 55;
  const eyeLineValid = eyeLinePercent >= 30 && eyeLinePercent <= 40;
  const score = (headSizeValid ? 35 : 18) + (eyeLineValid ? 35 : 18) + (shouldersAvailable ? 20 : 8) + (Math.abs(face.eyeTilt) <= MAX_TILT_CORRECTION * Math.PI / 180 ? 10 : 5);

  return {
    face,
    composition,
    headHeightPercent: Math.round(headHeightPercent),
    eyeLinePercent: Math.round(eyeLinePercent),
    headSizeValid,
    eyeLineValid,
    shouldersAvailable,
    complianceScore: score,
  };
}

export function renderPassportComposition({ image, size, analysis, backgroundColor = "#ffffff" }: { image: HTMLImageElement; size: PassportSize; analysis: PassportAnalysis; backgroundColor?: string }): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size.widthPx;
  canvas.height = size.heightPx;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  const frameHeight = image.naturalHeight / analysis.composition.scale;
  const frameWidth = frameHeight * (size.widthMm / size.heightMm);
  const eyeX = ((analysis.face.leftEye.x + analysis.face.rightEye.x) / 2) * image.naturalWidth;
  const eyeY = ((analysis.face.leftEye.y + analysis.face.rightEye.y) / 2) * image.naturalHeight;
  const tilt = Math.abs(analysis.face.eyeTilt) <= MAX_TILT_CORRECTION * Math.PI / 180 ? -analysis.face.eyeTilt : 0;

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height);
  context.clip();
  context.scale(canvas.width / frameWidth, canvas.height / frameHeight);
  context.translate(-analysis.composition.offsetX, -analysis.composition.offsetY);
  context.translate(eyeX, eyeY);
  context.rotate(tilt);
  context.translate(-eyeX, -eyeY);
  context.drawImage(image, 0, 0);
  context.restore();
  return canvas;
}

export function composePassportPhoto(image: HTMLImageElement, size: PassportSize, analysis: PassportAnalysis, backgroundColor = "#ffffff") {
  return renderPassportComposition({ image, size, analysis, backgroundColor }).toDataURL("image/jpeg", 0.95);
}
