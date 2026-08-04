"use client";

import { useEffect, useRef } from "react";
import { renderFinalPassportCanvas } from "@/lib/composePassport";

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  sourceImage: string | HTMLImageElement | null;
  cropArea?: CropArea | null;
  rotation?: number;
  zoom?: number;
  size?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  transparentBackground?: boolean;
  adjustments?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
};

export default function PortraitCanvas({
  sourceImage,
  cropArea,
  rotation = 0,
  zoom = 1,
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

    if (!canvas || !sourceImage) {
      return;
    }

    void (async () => {
      try {
        await renderFinalPassportCanvas({
          canvas,
          sourceImage,
          size,
          backgroundColor,
          cropArea: cropArea ?? undefined,
          rotation,
          zoom,
          transparentBackground,
          adjustments,
        });
      } catch (error) {
        console.error("Passport preview rendering failed:", error);
      }
    })();
  }, [adjustments, backgroundColor, cropArea, rotation, size, sourceImage, transparentBackground, zoom]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Live passport photo preview"
      className="block rounded-lg border border-gray-300 shadow-sm"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: transparentBackground ? "transparent" : backgroundColor,
      }}
    />
  );
}
