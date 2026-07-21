function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;

    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

export async function createPrintSheet(
  imageData: string
): Promise<string> {
  const img = await loadImage(imageData);

  // A4 @300 DPI
  const canvas = document.createElement("canvas");
  canvas.width = 2480;
  canvas.height = 3508;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not found.");
  }

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Passport photo size (35×45 mm @300 DPI)
  const photoWidth = 413;
  const photoHeight = 531;

  // Layout: 2 Columns × 4 Rows = 8 Photos
  const cols = 2;
  const rows = 4;

  const gapX = 80;
  const gapY = 80;

  const totalWidth =
    cols * photoWidth + (cols - 1) * gapX;

  const totalHeight =
    rows * photoHeight + (rows - 1) * gapY;

  const startX =
    (canvas.width - totalWidth) / 2;

  const startY =
    (canvas.height - totalHeight) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {

      const x =
        startX + col * (photoWidth + gapX);

      const y =
        startY + row * (photoHeight + gapY);

      ctx.drawImage(
        img,
        x,
        y,
        photoWidth,
        photoHeight
      );

      // Border
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x,
        y,
        photoWidth,
        photoHeight
      );

      // Crop Marks
      const mark = 20;

      // Top Left
      ctx.beginPath();
      ctx.moveTo(x - mark, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y - mark);
      ctx.stroke();

      // Top Right
      ctx.beginPath();
      ctx.moveTo(x + photoWidth, y - mark);
      ctx.lineTo(x + photoWidth, y);
      ctx.lineTo(x + photoWidth + mark, y);
      ctx.stroke();

      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(x - mark, y + photoHeight);
      ctx.lineTo(x, y + photoHeight);
      ctx.lineTo(x, y + photoHeight + mark);
      ctx.stroke();

      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(x + photoWidth + mark, y + photoHeight);
      ctx.lineTo(x + photoWidth, y + photoHeight);
      ctx.lineTo(x + photoWidth, y + photoHeight + mark);
      ctx.stroke();
    }
  }

  return canvas.toDataURL("image/jpeg", 1);
}