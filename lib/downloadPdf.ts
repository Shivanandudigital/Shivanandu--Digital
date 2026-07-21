import { jsPDF } from "jspdf";

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
    "JPEG",
    x,
    y,
    photoWidth,
    photoHeight
  );

  pdf.save(fileName);
}