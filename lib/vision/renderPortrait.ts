export type RenderComposition = {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
};

type RenderOptions = {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  composition: RenderComposition;
  backgroundColor?: string;
};

export function renderPortrait({
  canvas,
  image,
  composition,
  backgroundColor = "#ffffff",
}: RenderOptions) {

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Safe crop values
  const sx = Math.max(
    0,
    Math.min(composition.cropX, image.width - 1)
  );

  const sy = Math.max(
    0,
    Math.min(composition.cropY, image.height - 1)
  );

  const sw = Math.max(
    1,
    Math.min(composition.cropWidth, image.width - sx)
  );

  const sh = Math.max(
    1,
    Math.min(composition.cropHeight, image.height - sy)
  );

  console.log("========== RENDER ==========");
  console.log({
    imageWidth: image.width,
    imageHeight: image.height,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    sx,
    sy,
    sw,
    sh,
  });

  ctx.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    canvas.width,
    canvas.height
  );

  console.log("Render Completed");
}