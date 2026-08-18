import type { Metadata } from "next";
import PassportPhotoMaker from "@/components/passport/PassportPhotoMaker";
import PhotoEnhancer from "@/components/photo-enhancer/PhotoEnhancer";
import BackgroundRemoverTool from "@/components/background-remover/BackgroundRemoverTool";
import JpgToPdf from "@/components/jpg-to-pdf/JpgToPdf";
import PdfToJpg from "@/components/pdf-to-jpg/PdfToJpg";
import CompressPdf from "@/components/compress-pdf/CompressPdf";
import CompressJpg from "@/components/compress-jpg/CompressJpg";
import ImageResizer from "@/components/image-resizer/ImageResizer";
import CropImageTool from "@/components/crop-image/CropImageTool";
import DocumentPrintingOrder from "@/components/document-printing/DocumentPrintingOrder";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type ToolMetadata = {
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
};

const toolMetadata: Record<string, ToolMetadata> = {
  "passport-photo-maker": {
    title: "Passport Photo Maker",
    seoTitle: "Passport Photo Maker Online",
    description:
      "Create professional passport and visa photos online in 35×45 mm, 2×2 inch and other standard sizes with AI background removal, ICAO checks and print-ready downloads.",
    keywords: [
      "passport photo maker",
      "passport photo maker online",
      "35x45 passport photo",
      "2x2 passport photo",
      "Indian passport photo maker",
      "visa photo maker",
      "passport size photo online",
      "AI passport photo",
      "ICAO passport photo",
      "passport photo print sheet",
    ],
  },

  "photo-enhancer": {
    title: "Photo Enhancer",
    seoTitle: "Online Photo Enhancer",
    description:
      "Improve image clarity and photo quality online with the Shivanandu Digital Photo Enhancer.",
    keywords: [
      "photo enhancer",
      "online photo enhancer",
      "improve photo quality",
      "image enhancer",
    ],
  },

  "background-remover": {
    title: "Background Remover",
    seoTitle: "Background Remover Online",
    description:
      "Remove image backgrounds online and create clean, professional photos with Shivanandu Digital.",
    keywords: [
      "background remover",
      "remove image background",
      "transparent background",
      "online background remover",
    ],
  },

  "jpg-to-pdf": {
    title: "JPG to PDF",
    seoTitle: "JPG to PDF Converter Online",
    description:
      "Convert JPG images into a convenient, high-quality PDF document online.",
    keywords: [
      "JPG to PDF",
      "image to PDF",
      "online PDF converter",
      "convert JPG to PDF",
    ],
  },

  "pdf-to-jpg": {
    title: "PDF to JPG",
    seoTitle: "PDF to JPG Converter Online",
    description:
      "Convert PDF pages into high-quality JPG images quickly and conveniently online.",
    keywords: [
      "PDF to JPG",
      "PDF to image",
      "convert PDF to JPG",
      "online PDF converter",
    ],
  },

  "compress-pdf": {
    title: "Compress PDF",
    seoTitle: "Compress PDF Online",
    description:
      "Reduce PDF file size online while preserving useful document quality.",
    keywords: [
      "compress PDF",
      "reduce PDF size",
      "PDF compressor online",
      "small PDF file",
    ],
  },

  "compress-jpg": {
    title: "Compress JPG",
    seoTitle: "Compress JPG to Target KB Online",
    description:
      "Compress JPG images to a required file size in KB while preserving the best possible clarity and original proportions.",
    keywords: [
      "compress JPG",
      "JPG compressor",
      "reduce JPG size in KB",
      "image compressor online",
      "compress photo for online form",
    ],
  },

  "image-resizer": {
    title: "Image Resizer",
    seoTitle: "Resize Image Online in Pixels and KB",
    description:
      "Resize JPG, PNG and WebP images online by pixels, percentage or ready-made presets, with aspect ratio lock, output quality and optional target KB control.",
    keywords: [
      "image resizer",
      "resize image online",
      "resize image in pixels",
      "photo resizer",
      "resize image in KB",
      "passport photo resizer",
      "signature image resizer",
    ],
  },
  "crop-image": { title: "Crop Image", seoTitle: "Crop Image Online Free", description: "Crop, rotate and flip images online.", keywords: ["crop image", "crop photo online"] },
  "document-printing-order": {
    title: "PVC Card Printing Service",
    seoTitle: "PVC Card Printing Service Online",
    description:
      "Order secure printing for Ration Card, Voter e-EPIC, Ayushman Bharat Card and Driving Licence from Shivanandu Digital.",
    keywords: [
      "document printing online",
      "ration card print",
      "voter card print",
      "Ayushman card print",
      "driving licence print",
    ],
  },
};

function formatToolTitle(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const details = toolMetadata[slug];

  const title = details?.seoTitle ?? formatToolTitle(slug);
  const description =
    details?.description ??
    "Professional digital tool from Shivanandu Digital.";
  const pageUrl = `https://www.shivanandudigital.com/tools/${slug}`;

  return {
    title,
    description,
    keywords: details?.keywords,

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      title: `${title} | Shivanandu Digital`,
      description,
      url: pageUrl,
      siteName: "Shivanandu Digital",
      locale: "en_IN",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: `${title} | Shivanandu Digital`,
      description,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;

  const title =
    toolMetadata[slug]?.title ?? formatToolTitle(slug);

  const passportPhotoStructuredData =
    slug === "passport-photo-maker"
      ? {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Shivanandu Digital Passport Photo Maker",
          url: "https://www.shivanandudigital.com/tools/passport-photo-maker",
          description:
            "Create professional passport and visa photos online with AI background removal, ICAO composition checks and print-ready downloads.",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any",
          browserRequirements:
            "Requires a modern web browser with JavaScript enabled",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
          provider: {
            "@type": "Organization",
            name: "Shivanandu Digital",
            url: "https://www.shivanandudigital.com",
          },
        }
      : null;

  return (
    <main className="min-h-screen bg-slate-100 py-6 sm:py-8 lg:py-10">
      {passportPhotoStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              passportPhotoStructuredData
            ).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-slate-600">
            Professional Digital Tool by Shivanandu Digital
          </p>
        </div>

        {slug === "passport-photo-maker" ? (
          <PassportPhotoMaker />
        ) : slug === "photo-enhancer" ? (
          <PhotoEnhancer />
        ) : slug === "background-remover" ? (
          <BackgroundRemoverTool />
        ) : slug === "jpg-to-pdf" ? (
          <JpgToPdf />
        ) : slug === "pdf-to-jpg" ? (
          <PdfToJpg />
        ) : slug === "compress-pdf" ? (
          <CompressPdf />
        ) : slug === "compress-jpg" ? (
          <CompressJpg />
        ) : slug === "image-resizer" ? (
          <ImageResizer />
        ) : slug === "crop-image" ? (
          <CropImageTool />
        ) : slug === "document-printing-order" ? (
          <DocumentPrintingOrder />
        ) : (
          <div className="rounded-3xl bg-white p-16 text-center shadow-lg">
            <h2 className="mb-3 text-3xl font-bold">
              {title}
            </h2>

            <p className="text-gray-500">
              This tool is coming soon.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
