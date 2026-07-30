export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateFaceBox(
  landmarks: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number
): FaceBox {

    // Key Face Landmarks
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;
const FOREHEAD = 10;
const CHIN = 152;

const left = landmarks[LEFT_CHEEK];
const right = landmarks[RIGHT_CHEEK];
const top = landmarks[FOREHEAD];
const bottom = landmarks[CHIN];

const headTop =
  Math.max(0, top.y - 0.08);

return {
  x: left.x * imageWidth,
  y: headTop * imageHeight,
  width: (right.x - left.x) * imageWidth,
  height: (bottom.y - headTop) * imageHeight,
};
}
