const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const MAX_UPLOAD_DIMENSION = 2400;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The mobile photo could not be prepared."));
      },
      "image/jpeg",
      quality
    );
  });
}

async function preparePhotoRoomUpload(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("The mobile photo could not be opened."));
      element.src = objectUrl;
    });

    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, MAX_UPLOAD_DIMENSION / longestSide);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("The mobile photo could not be prepared.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let quality = 0.92;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > MAX_UPLOAD_BYTES && quality > 0.62) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size > MAX_UPLOAD_BYTES) {
      throw new Error("The photo is too large. Please lower the camera resolution and try again.");
    }

    return new File([blob], "passport-photo-upload.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function removeImageBackground(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(15);
  const uploadFile = await preparePhotoRoomUpload(file);
  const formData = new FormData();
  formData.append("image_file", uploadFile, uploadFile.name);
  onProgress?.(35);

  const response = await fetch("/api/remove-background", {
    method: "POST",
    body: formData,
  });

  onProgress?.(85);

  if (!response.ok) {
    let message = "Background removal failed.";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // A gateway may return a non-JSON error page.
    }
    throw new Error(message);
  }

  const result = await response.blob();
  onProgress?.(100);

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("PhotoRoom result could not be read."));
    };
    reader.onerror = () => reject(new Error("PhotoRoom result could not be read."));
    reader.readAsDataURL(result);
  });
}