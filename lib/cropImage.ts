export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

export async function cropImage(
  imageSrc: string,
  crop: CropArea,
  rotation: number = 0,
  type: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.95,
  backgroundColor?: string,
  brightness = 100,
  contrast = 100,
  saturation = 100
): Promise<string> {
  
const sourceImage = await createImage(imageSrc);
  const radians = (rotation * Math.PI) / 180;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available.");
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
 ctx.save();

if (backgroundColor) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.rotate(radians);
ctx.drawImage(
  sourceImage,
  crop.x,
  crop.y,
  crop.width,
  crop.height,
  -canvas.width / 2,
  -canvas.height / 2,
  canvas.width,
  canvas.height
);

  ctx.restore();

  return canvas.toDataURL(type, quality);
}