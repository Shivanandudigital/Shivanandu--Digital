export async function removeImageBackground(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  onProgress?.(15);
  const formData = new FormData();
  formData.append("image_file", file, file.name || "passport-photo.jpg");
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
