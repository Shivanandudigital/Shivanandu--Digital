"use client";

import { useEffect, useRef } from "react";
import { renderPassport } from "@/lib/vision/professional/passportRenderer";

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

  /**
   * পুরোনো component compatibility বজায় রাখার জন্য রাখা হয়েছে।
   * Final framing professional AI renderer নিজে calculate করবে।
   */
  composition: Composition;

  face: FaceData;

  width?: number;
  height?: number;

  backgroundColor?: string;
};

export default function PortraitCanvas({
  image,
  composition: _composition,
  face,
  width = 210,
  height = 270,
  backgroundColor = "#ffffff",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  void _composition;

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

    const result = renderPassport({
      canvas,
      image,
      face,

      size: "35x45",

      /**
       * নির্বাচিত colour passport canvas-এর ভেতরে আঁকা হবে।
       */
      backgroundColor,

      /**
       * Transparent mode আলাদাভাবে নির্বাচন না করা পর্যন্ত
       * canvas সবসময় solid background ব্যবহার করবে।
       */
      transparentBackground: false,

      /**
       * Professional natural framing এবং auto-straight চালু।
       */
      autoCompose: true,

      smoothingQuality: "high",
    });

    if (!result.success) {
      console.error(
        "Passport preview rendering failed:",
        result.error
      );
    }
  }, [image, face, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Live passport photo preview"
      className="block rounded-lg border border-gray-300 shadow-sm"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor,
      }}
    />
  );
}
