export type ToolStatus = "ready" | "coming-soon";

export type DigitalTool = {
  id: number;
  name: string;
  slug: string;
  category: string;
  icon: string;
  description: string;
  status: ToolStatus;
};

export const tools: DigitalTool[] = [
  {
    id: 1,
    name: "Passport Photo Maker",
    slug: "passport-photo-maker",
    category: "Photo Tools",
    icon: "📷",
    description:
      "Create professional passport and visa photos instantly.",
    status: "ready",
  },
  {
    id: 2,
    name: "Photo Enhancer",
    slug: "photo-enhancer",
    category: "Photo Tools",
    icon: "✨",
    description:
      "Improve photo clarity, colour and overall quality.",
    status: "ready",
  },
  {
    id: 3,
    name: "Background Remover",
    slug: "background-remover",
    category: "Photo Tools",
    icon: "✂️",
    description:
      "Remove image backgrounds quickly and professionally.",
    status: "ready",
  },
  {
    id: 4,
    name: "Compress JPG",
    slug: "compress-jpg",
    category: "Photo Tools",
    icon: "🗜️",
    description:
      "Reduce JPG size to the required KB while protecting clarity.",
    status: "ready",
  },
  {
    id: 5,
    name: "Image Resizer",
    slug: "image-resizer",
    category: "Photo Tools",
    icon: "↔️",
    description:
      "Resize JPG, PNG and WebP images to exact pixels or percentages.",
    status: "ready",
  },
  { id: 6, name: "Crop Image", slug: "crop-image", category: "Photo Tools", icon: "✂️", description: "Crop, rotate and flip images.", status: "ready" },
  {
    id: 7,
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF Tools",
    icon: "📄",
    description:
      "Convert one or multiple JPG images into a PDF.",
    status: "ready",
  },
  {
    id: 8,
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF Tools",
    icon: "🖼️",
    description:
      "Convert PDF pages into high-quality JPG images.",
    status: "ready",
  },
  {
    id: 9,
    name: "Compress PDF",
    slug: "compress-pdf",
    category: "PDF Tools",
    icon: "📑",
    description:
      "Reduce PDF file size while preserving useful quality.",
    status: "ready",
  },
  {
    id: 10,
    name: "OCR",
    slug: "ocr",
    category: "AI Tools",
    icon: "🤖",
    description:
      "Extract editable text from images and scanned documents.",
    status: "coming-soon",
  },
  {
    id: 11,
    name: "Passport Service",
    slug: "passport-service",
    category: "Online Services",
    icon: "🌐",
    description:
      "Get professional assistance with passport applications.",
    status: "coming-soon",
  },
  {
    id: 12,
    name: "PVC Card Printing Service",
    slug: "document-printing-order",
    category: "Online Services",
    icon: "🪪",
    description:
      "Order PVC card printing with automatic pricing, Speed Post delivery and secure online payment.",
    status: "ready",
  },
];
