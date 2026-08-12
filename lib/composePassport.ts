export interface ComposePassportOptions {
  imageSrc: string;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  zoom?: number;
  rotation?: number;
  backgroundColor?: string;
  bgColor?: string;
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Builds the composited passport-photo canvas: background fill, then the
 * cropped/zoomed/rotated foreground drawn on top via the browser's
 * standard alpha-over compositing. This is the single source of truth for
 * every rendering surface (Automatic Passport Frame preview, Final
 * Preview, JPG, PNG, PDF and Print Sheet) - each of them calls this same
 * function so none of them can drift out of sync with each other.
 *
 * Because the foreground image's alpha and RGB have already been
 * decontaminated (see lib/background/removeBackground.ts), a plain
 * source-over composite here is correct: no additional edge processing
 * is needed or should be added at this stage.
 */
export async function buildComposedPassportCanvas(
  options: ComposePassportOptions
): Promise<HTMLCanvasElement> {
  const {
    imageSrc,
    zoom = 1,
    rotation = 0,
    targetWidth = 413, // 35mm at 300 DPI
    targetHeight = 531, // 45mm at 300 DPI
  } = options;

  const backgroundColor = options.backgroundColor || options.bgColor || "#FFFFFF";
  const cropX = options.crop?.x ?? options.cropX ?? 0;
  const cropY = options.crop?.y ?? options.cropY ?? 0;
  const cropWidth = options.crop?.width ?? options.cropWidth ?? targetWidth;
  const cropHeight = options.crop?.height ?? options.cropHeight ?? targetHeight;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // ১. ব্যাকগ্রাউন্ড কালার দেওয়া
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();

      // ২. ক্যানভাসের সেন্টারে রোটেশন ও জুম হ্যান্ডেল করা
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // ৩. ছবি কোনো বিকৃতি ছাড়াই অনুপাত অনুযায়ী ক্যানভাসে ড্র করা
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        -targetWidth / 2,
        -targetHeight / 2,
        targetWidth,
        targetHeight
      );

      ctx.restore();

      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for final canvas rendering"));
    };

    img.src = imageSrc;
  });
}

/**
 * JPEG preview/download data URL. Used for the on-screen Final Preview
 * (where a 0.95-quality JPEG is visually indistinguishable from the
 * source and cheaper to keep in memory/state) and for the "Download JPG"
 * button.
 */
export async function renderFinalPassportCanvas(
  options: ComposePassportOptions,
  quality = 0.95
): Promise<string> {
  const canvas = await buildComposedPassportCanvas(options);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Lossless PNG data URL, built from the exact same composition as the
 * preview/JPEG above. Used for the "Download PNG" button and as the
 * source image embedded into the PDF, so neither loses quality to a
 * second, unnecessary JPEG re-encode.
 */
export async function renderFinalPassportPng(
  options: ComposePassportOptions
): Promise<string> {
  const canvas = await buildComposedPassportCanvas(options);
  return canvas.toDataURL("image/png");
}

// ব্যাকওয়ার্ড ও অল্টারনেটিভ ইমপোর্টের জন্য
export const composePassportPhoto = renderFinalPassportCanvas;
