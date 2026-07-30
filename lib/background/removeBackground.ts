import { removeBackground } from "@imgly/background-removal";

export async function removeImageBackground(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const blob = await removeBackground(file, {
    progress: (_key, current, total) => {
      if (!onProgress || total === 0) return;

      onProgress(
        Math.round((current / total) * 100)
      );
    },
  });

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read image"));
      }
    };

    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}