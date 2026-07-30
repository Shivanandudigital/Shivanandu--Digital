import { calculatePortraitFrame } from "./portraitFrame";
import { renderPortrait } from "./renderPortrait";

type FaceData = {
  forehead: { x: number; y: number };
  chin: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
};

type RendererOptions = {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  face: FaceData;
  backgroundColor?: string;
};

export function renderPassport({
  canvas,
  image,
  face,
  backgroundColor = "#ffffff",
}: RendererOptions) {

  const frame = calculatePortraitFrame(
    face,
    image.width,
    image.height
  );

  console.log("========== PASSPORT RENDER ==========");
  console.log(frame);

  renderPortrait({
    canvas,
    image,
    composition: {
      cropX: frame.cropX,
      cropY: frame.cropY,
      cropWidth: frame.cropWidth,
      cropHeight: frame.cropHeight,
    },
    backgroundColor,
  });

  return frame;
}