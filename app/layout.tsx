import type { Metadata } from "next";
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
  metadataBase: new URL(
    "https://www.shivanandudigital.com"
  ),

  title: {
    default:
      "Shivanandu Digital | Online Services & Digital Tools",
    template: "%s | Shivanandu Digital",
  },

  description:
    "Professional online services and digital tools by Shivanandu Digital. Create passport photos and access reliable photo, PDF and digital services.",

  keywords: [
    "Shivanandu Digital",
    "online digital services",
    "passport photo maker",
    "online passport photo",
    "photo tools",
    "PDF tools",
    "background remover",
    "digital services India",
  ],

  authors: [{ name: "Shivanandu Digital" }],
  creator: "Shivanandu Digital",
  publisher: "Shivanandu Digital",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title:
      "Shivanandu Digital | Online Services & Digital Tools",
    description:
      "Professional online services and digital tools. Create passport photos and access reliable photo, PDF and digital services.",
    url: "https://www.shivanandudigital.com",
    siteName: "Shivanandu Digital",
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Shivanandu Digital | Online Services & Digital Tools",
    description:
      "Professional online services and digital tools by Shivanandu Digital.",
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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id":
        "https://www.shivanandudigital.com/#organization",
      name: "Shivanandu Digital",
      url: "https://www.shivanandudigital.com",
      description:
        "Shivanandu Digital provides professional online services, passport photo creation, photo tools, PDF tools and digital solutions.",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      knowsAbout: [
        "Passport Photo Creation",
        "Photo Editing",
        "Background Removal",
        "PDF Conversion",
        "Document Processing",
        "Online Digital Services",
      ],
    },
    {
      "@type": "WebSite",
      "@id":
        "https://www.shivanandudigital.com/#website",
      url: "https://www.shivanandudigital.com",
      name: "Shivanandu Digital",
      description:
        "Professional online services and digital tools.",
      publisher: {
        "@id":
          "https://www.shivanandudigital.com/#organization",
      },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        {children}
      </body>
    </html>
  );
}