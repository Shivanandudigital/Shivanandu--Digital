import { FaceLandmarks } from "@/types/faceLandmarks";
import { getFaceLandmarker } from "./getFaceLandmarker";

export async function detectFaceLandmarks(
  image: HTMLImageElement
): Promise<FaceLandmarks | null> {

  const landmarker = await getFaceLandmarker();

  if (!landmarker) {
    return null;
  }

  const result = landmarker.detect(image);

  if (
    !result.faceLandmarks ||
    result.faceLandmarks.length === 0
  ) {
    return null;
  }

  console.log(result);

  const landmarks = result.faceLandmarks[0];

  const leftEye = landmarks[33];

console.log(
  "Left Eye:",
  leftEye.x,
  leftEye.y,
  leftEye.z
);

const rightEye = landmarks[263];

console.log(
  "Right Eye:",
  rightEye.x,
  rightEye.y,
  rightEye.z
);

const nose = landmarks[1];

console.log(
  "Nose:",
  nose.x,
  nose.y,
  nose.z
);

const mouth = landmarks[13];

console.log(
  "Mouth:",
  mouth.x,
  mouth.y,
  mouth.z
);

const chin = landmarks[152];

console.log(
  "Chin:",
  chin.x,
  chin.y,
  chin.z
);

const headWidth = Math.abs(
  rightEye.x - leftEye.x
);

const headHeight = Math.abs(
  chin.y - leftEye.y
);

console.log(
  "Head Width:",
  headWidth
);

console.log(
  "Head Height:",
  headHeight
);

const roll = Math.atan2(
  rightEye.y - leftEye.y,
  rightEye.x - leftEye.x
);

const rollDegrees =
  roll * (180 / Math.PI);

console.log(
  "Roll:",
  rollDegrees
);

const faceCenterX =
  (leftEye.x + rightEye.x) / 2;

const yaw =
  nose.x - faceCenterX;

console.log("Yaw:", yaw);

const eyeCenterY =
  (leftEye.y + rightEye.y) / 2;

const pitch =
  nose.y - eyeCenterY;

console.log("Pitch:", pitch);

  // MediaPipe Landmark Mapping
  // will be added in the next step.

  console.log("Landmarks Count:", landmarks.length);

  const face: FaceLandmarks = {
  leftEye: {
    x: leftEye.x,
    y: leftEye.y,
  },

  rightEye: {
    x: rightEye.x,
    y: rightEye.y,
  },

  nose: {
    x: nose.x,
    y: nose.y,
  },

  mouth: {
    x: mouth.x,
    y: mouth.y,
  },

  chin: {
    x: chin.x,
    y: chin.y,
  },

 headWidth,
headHeight,


 roll: rollDegrees,
yaw,
pitch,
};

console.log(face);

  return face;
}