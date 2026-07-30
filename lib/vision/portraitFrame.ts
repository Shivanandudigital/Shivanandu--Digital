export type PortraitFrame = {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;

  headRatio: number;
  eyeLine: number;
};

type Point = {
  x: number;
  y: number;
};

type FaceData = {
  forehead: Point;
  chin: Point;
  leftEye: Point;
  rightEye: Point;
};

const ICAO_HEAD_RATIO = 0.72;
const ICAO_EYE_LINE = 0.42;
const PASSPORT_RATIO = 35 / 45;

export function calculatePortraitFrame(
  face: FaceData,
  imageWidth: number,
  imageHeight: number
): PortraitFrame {

  const forehead = {
    x: face.forehead.x * imageWidth,
    y: face.forehead.y * imageHeight,
  };

  const chin = {
    x: face.chin.x * imageWidth,
    y: face.chin.y * imageHeight,
  };

  const leftEye = {
    x: face.leftEye.x * imageWidth,
    y: face.leftEye.y * imageHeight,
  };

  const rightEye = {
    x: face.rightEye.x * imageWidth,
    y: face.rightEye.y * imageHeight,
  };

  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const eyeCenterY = (leftEye.y + rightEye.y) / 2;

  const headHeight = Math.max(1, chin.y - forehead.y);

  const cropHeight = headHeight / ICAO_HEAD_RATIO;
  const cropWidth = cropHeight * PASSPORT_RATIO;

  let cropX = eyeCenterX - cropWidth / 2;
  let cropY = eyeCenterY - cropHeight * ICAO_EYE_LINE;

  // Clamp inside image
  cropX = Math.max(
    0,
    Math.min(cropX, imageWidth - cropWidth)
  );

  cropY = Math.max(
    0,
    Math.min(cropY, imageHeight - cropHeight)
  );

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    headRatio: ICAO_HEAD_RATIO,
    eyeLine: ICAO_EYE_LINE,
  };
}