import { jsPDF } from "jspdf";

/**
 * Reads the MIME type out of a `data:` URL to determine the correct
 * format string for jsPDF's `addImage`. This used to be hardcoded to
 * "JPEG" regardless of what was actually passed in - feeding it a PNG
 * data URL (as the passport photo pipeline now produces for lossless
 * downloads) produced a broken/garbled embedded image. Detecting the
 * real format keeps the PDF pixel-identical to the Final Preview.
 */
function detectImageFormat(imageData: string): "PNG" | "JPEG" | "WEBP" {
  if (imageData.startsWith("data:image/png")) return "PNG";
  if (imageData.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

export function downloadPdf(
  imageData: string,
  fileName: string = "passport-photo.pdf"
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();

  // Passport photo size: 35 × 45 mm
  const photoWidth = 35;
  const photoHeight = 45;

  const x = (pageWidth - photoWidth) / 2;
  const y = 20;

  pdf.addImage(
    imageData,
    detectImageFormat(imageData),
    x,
    y,
    photoWidth,
    photoHeight
  );

  pdf.save(fileName);
}
