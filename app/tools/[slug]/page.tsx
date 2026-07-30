import type { Metadata } from "next";
import PassportPhotoMaker from "@/components/passport/PassportPhotoMaker";
import PhotoEnhancer from "@/components/photo-enhancer/PhotoEnhancer";
import BackgroundRemoverTool from "@/components/background-remover/BackgroundRemoverTool";
import JpgToPdf from "@/components/jpg-to-pdf/JpgToPdf";
import PdfToJpg from "@/components/pdf-to-jpg/PdfToJpg";
import CompressPdf from "@/components/compress-pdf/CompressPdf";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const toolMetadata: Record<
  string,
  { title: string; description: string }
> = {
  "passport-photo-maker": {
    title: "Passport Photo Maker",
    description:
      "Create professional passport and visa photos with AI background removal, ICAO composition checks and JPG, PNG, PDF or print-sheet downloads.",
  },
  "photo-enhancer": {
    title: "Photo Enhancer",
    description:
      "Improve photo quality online with the Shivanandu Digital Photo Enhancer.",
  },
  "background-remover": {
    title: "Background Remover",
    description:
      "Remove image backgrounds online and create clean professional photos.",
  },
  "jpg-to-pdf": {
    title: "JPG to PDF",
    description:
      "Convert JPG images into a convenient PDF document online.",
  },
  "pdf-to-jpg": {
    title: "PDF to JPG",
    description:
      "Convert PDF pages into high-quality JPG images online.",
  },
  "compress-pdf": {
    title: "Compress PDF",
    description:
      "Reduce PDF file size online while preserving useful document quality.",
  },
};

function formatToolTitle(slug: string) {
  return slug
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const details = toolMetadata[slug];

  return {
    title: details?.title ?? formatToolTitle(slug),
    description:
      details?.description ??
      "Professional digital tool from Shivanandu Digital.",
    alternates: {
      canonical: `/tools/${slug}`,
    },
    openGraph: {
      url: `/tools/${slug}`,
      title: details?.title ?? formatToolTitle(slug),
      description:
        details?.description ??
        "Professional digital tool from Shivanandu Digital.",
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;

  const title =
    toolMetadata[slug]?.title ?? formatToolTitle(slug);

  return (
    <main className="min-h-screen bg-slate-100 py-6 sm:py-8 lg:py-10">
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
