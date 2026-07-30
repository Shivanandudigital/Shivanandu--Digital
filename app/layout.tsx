import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shivanandudigital.com"),
  title: {
    default: "Shivanandu Digital | Professional Digital Tools & Services",
    template: "%s | Shivanandu Digital",
  },
  description:
    "Create passport photos, process PDFs, enhance images and access professional digital services with Shivanandu Digital.",
  applicationName: "Shivanandu Digital",
  authors: [{ name: "Shivanandu Digital" }],
  creator: "Shivanandu Digital",
  publisher: "Shivanandu Digital",
  category: "Digital Services",
  keywords: [
    "Shivanandu Digital",
    "passport photo maker",
    "passport size photo",
    "background remover",
    "photo enhancer",
    "JPG to PDF",
    "PDF to JPG",
    "PDF compressor",
    "online digital tools",
    "digital services India",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_IN",
    siteName: "Shivanandu Digital",
    title: "Shivanandu Digital | Professional Digital Tools & Services",
    description:
      "Professional online photo and document tools from Shivanandu Digital.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivanandu Digital | Professional Digital Tools & Services",
    description:
      "Professional online photo and document tools from Shivanandu Digital.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
