export async function createPassportCanvas(
  width: number,
  height: number,
  background: string
) {
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  return {
    canvas,
    ctx,
  };
}