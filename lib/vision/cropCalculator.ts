export type CropRect = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export function calculateCropRect(
  imageWidth: number,
  imageHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number
): CropRect {

  const sw = imageWidth / scale;
  const sh = imageHeight / scale;

  const sx =
    (imageWidth - sw) / 2 - offsetX;

  const sy =
    (imageHeight - sh) / 2 - offsetY;

  return {
    sx,
    sy,
    sw,
    sh,
  };
}