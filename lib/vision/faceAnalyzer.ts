export interface FaceAnalysis {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };

  chin: { x: number; y: number };
  forehead: { x: number; y: number };

  eyeCenter: {
    x: number;
    y: number;
  };

  estimatedTopOfHead: {
    x: number;
    y: number;
  };
}

export function analyzeFace(
  landmarks: { x: number; y: number }[]
): FaceAnalysis {

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];
  const mouth = landmarks[13];
  const chin = landmarks[152];

  // Landmark 10 = forehead/hairline
  const forehead = landmarks[10];

  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };

  // Estimate real top of head
  const estimatedTopOfHead = {
    x: forehead.x,
    y: Math.max(0, forehead.y - 0.08),
  };

  console.log("========== FACE ANALYSIS ==========");
  console.log({
    leftEye,
    rightEye,
    forehead,
    estimatedTopOfHead,
    chin,
  });

  return {
    leftEye,
    rightEye,
    nose,
    mouth,

    chin,

    // IMPORTANT:
    // Passport engine এখন estimated point ব্যবহার করবে
    forehead: estimatedTopOfHead,

    eyeCenter,
    estimatedTopOfHead,
  };
}