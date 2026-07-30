import { FaceAnalysis } from "./faceAnalyzer";

export interface PortraitComposition {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Shivanandu Digital Passport Composition
 *
 * কোনো automatic zoom হবে না।
 * Original image scale সবসময় 1 থাকবে।
 * শুধু face center করার জন্য offset দেওয়া হবে।
 */
export function composePortrait(
  face: FaceAnalysis,
  _currentHeadPercent: number
): PortraitComposition {
  void _currentHeadPercent;

  const eyeCenterX = Number.isFinite(face.eyeCenter.x)
    ? face.eyeCenter.x
    : 0.5;

  const eyeCenterY = Number.isFinite(face.eyeCenter.y)
    ? face.eyeCenter.y
    : 0.42;

  /*
   * Face horizontal center।
   * FaceAnalysis normalized coordinate ব্যবহার করে।
   */
  const offsetX = (0.5 - eyeCenterX) * 1000;

  /*
   * Eye line-এর জন্য শুধু সামান্য vertical movement।
   * এখানে scale বা zoom বদলানো হচ্ছে না।
   */
  const targetEyeLine = 0.42;

  const offsetY = (targetEyeLine - eyeCenterY) * 1000;

  return {
    scale: 1,
    offsetX,
    offsetY,
  };
}
