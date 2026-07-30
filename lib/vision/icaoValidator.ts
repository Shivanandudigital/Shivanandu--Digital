import { FaceAnalysis } from "./faceAnalyzer";

export interface ICAOValidationResult {
  headSize: number;
  headStatus: "perfect" | "small" | "large";
  faceCentered: boolean;
  eyeLineOk: boolean;
}

const TARGET_HEAD = 75;
const HEAD_TOLERANCE = 5;

export function validateICAO(
  face: FaceAnalysis,
  imageWidth: number,
  imageHeight: number
): ICAOValidationResult {

  const headHeight =
    (face.chin.y - face.forehead.y) * imageHeight;

  const headPercent =
    (headHeight / imageHeight) * 100;

  const faceCenterX =
    (face.leftEye.x + face.rightEye.x) / 2;

  const faceCenterY =
    (face.leftEye.y + face.rightEye.y) / 2;

  const centered =
    faceCenterX >= 0.45 &&
    faceCenterX <= 0.55;

  const eyeLineOk =
    faceCenterY >= 0.35 &&
    faceCenterY <= 0.45;

  let headStatus: "perfect" | "small" | "large";

  if (headPercent < TARGET_HEAD - HEAD_TOLERANCE) {
    headStatus = "small";
  } else if (headPercent > TARGET_HEAD + HEAD_TOLERANCE) {
    headStatus = "large";
  } else {
    headStatus = "perfect";
  }

  console.log("========== ICAO ==========");
  console.log({
    headHeight,
    headPercent,
    faceCenterX,
    faceCenterY,
    centered,
    eyeLineOk,
    headStatus,
  });

  return {
    headSize: Math.round(headPercent),
    headStatus,
    faceCentered: centered,
    eyeLineOk,
  };
}