import { createPassportCanvas } from "./passportCanvas";
import { getPassportLayout } from "./passportLayout";

export async function composePassportPhoto(
  image: HTMLImageElement,
  size: string,
  background: string
) {
  const layout = getPassportLayout(size);

  const { canvas, ctx } =
    await createPassportCanvas(
      layout.canvasWidth,
      layout.canvasHeight,
      background
    );

  ctx.drawImage(
    image,
    0,
    0,
    layout.photoWidth,
    layout.photoHeight
  );

  return canvas.toDataURL("image/jpeg", 0.95);
}