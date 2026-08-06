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

export async function renderFinalPassportCanvas(options: ComposePassportOptions): Promise<string> {
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

      // ১. ব্যাকগ্রাউন্ড কালার দেওয়া
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();

      // ২. ক্যানভাসের সেন্টারে রোটেশন ও জুম হ্যান্ডেল করা
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // ৩. ছবি কোনো বিকৃতি ছাড়াই অনুপাত অনুযায়ী ক্যানভাসে ড্র করা
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

      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for final canvas rendering"));
    };

    img.src = imageSrc;
  });
}

// ব্যাকওয়ার্ড ও অল্টারনেটিভ ইমপোর্টের জন্য
export const composePassportPhoto = renderFinalPassportCanvas;