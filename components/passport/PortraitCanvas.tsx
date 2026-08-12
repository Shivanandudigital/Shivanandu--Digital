"use client";

import { useEffect, useRef } from "react";
import { renderFinalPassportCanvas } from "@/lib/composePassport";

type CropArea = { x: number; y: number; width: number; height: number };

type Props = {
  sourceImage: string | HTMLImageElement | null;
  cropArea?: CropArea | null;
  rotation?: number;
  size?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  transparentBackground?: boolean;
  adjustments?: { brightness?: number; contrast?: number; saturation?: number };
};

export default function PortraitCanvas({
  sourceImage,
  cropArea,
  rotation = 0,
  size = "35x45",
  width = 210,
  height = 270,
  backgroundColor = "#ffffff",
  transparentBackground = false,
  adjustments,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage || !cropArea) return;

    const source =
      typeof sourceImage === "string"
        ? sourceImage
        : sourceImage.src;

    void renderFinalPassportCanvas({
      imageSrc: source,
      crop: cropArea,
      rotation,
      backgroundColor: transparentBackground
        ? "transparent"
        : backgroundColor,
      targetWidth: width,
      targetHeight: height,
    })
      .then((renderedUrl) => {
        const renderedImage = new Image();
        renderedImage.onload = () => {
          const context = canvas.getContext("2d");
          if (!context) return;
          context.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = width;
          canvas.height = height;
          context.drawImage(renderedImage, 0, 0, width, height);
        };
        renderedImage.src = renderedUrl;
      })
      .catch((error) =>
        console.error("Passport preview rendering failed:", error)
      );
  }, [adjustments, backgroundColor, cropArea, height, rotation, size, sourceImage, transparentBackground, width]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Final passport photo preview"
      className="block max-w-full rounded-lg border border-gray-300 shadow-sm"
      style={{ width, height, backgroundColor: transparentBackground ? "transparent" : backgroundColor }}
    />
  );
}
