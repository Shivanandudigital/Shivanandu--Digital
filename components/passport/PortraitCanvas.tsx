"use client";

import { useEffect, useRef } from "react";
import { renderPassportToCanvas } from "@/lib/composePassport";

type FaceData = {
  forehead: { x: number; y: number };
  chin: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
};

type Composition = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  image: HTMLImageElement | null;
  composition: Composition;
  face: FaceData;
  width?: number;
  height?: number;
  backgroundColor?: string;
  transparentBackground?: boolean;
};

export default function PortraitCanvas({
  image,
  composition,
  face,
  width = 210,
  height = 270,
  backgroundColor = "#ffffff",
  transparentBackground = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !image) {
      return;
    }

    if (
      !image.complete ||
      image.naturalWidth <= 0 ||
      image.naturalHeight <= 0
    ) {
      return;
    }

    try {
      renderPassportToCanvas({
        canvas,
        image,
        face,
        size: "35x45",
        backgroundColor,
        transparentBackground,
        composition,
        smoothingQuality: "high",
      });
    } catch (error) {
      console.error("Passport preview rendering failed:", error);
    }
  }, [image, face, composition, backgroundColor, transparentBackground]);

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
