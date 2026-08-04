"use client";
/* eslint-disable @next/next/no-img-element -- Generated canvas Data URL previews require native img elements. */

import { useEffect, useState } from "react";
import { composePassportPhoto } from "@/lib/composePassport";

type Point = {
  x: number;
  y: number;
};

type FaceData = {
  forehead: Point;
  chin: Point;
  leftEye: Point;
  rightEye: Point;
};

type Composition = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  image: string;
  size: string;
  backgroundColor: string;
  headSize: number;
  faceDetected: boolean;
  composition: Composition;
  face: FaceData;
};

export default function PassportComposer({
  image,
  size,
  backgroundColor,
  headSize,
  faceDetected,
  composition,
  face,
}: Props) {
  const [output, setOutput] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function createOutput() {
      if (!image || !faceDetected) {
        setOutput(undefined);
        setError(undefined);
        return;
      }

      try {
        setError(undefined);

        const sourceImage = new Image();
        sourceImage.decoding = "async";
        sourceImage.src = image;

        await new Promise<void>((resolve, reject) => {
          sourceImage.onload = () => resolve();
          sourceImage.onerror = () => reject(new Error("Passport source image could not be loaded."));
        });

        const composedImage = await composePassportPhoto(
          sourceImage,
          size,
          backgroundColor,
          headSize,
          faceDetected,
          composition,
          face
        );

        if (!cancelled) {
          setOutput(composedImage);
        }
      } catch (caughtError) {
        if (cancelled) return;

        setOutput(undefined);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Passport composition failed."
        );
      }
    }

    createOutput();

    return () => {
      cancelled = true;
    };
  }, [image, size, backgroundColor, headSize, faceDetected, composition, face]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-800">Final Composition Preview</h3>

      <p className="mt-1 text-xs text-gray-500">
        This preview uses the same final composition as the downloaded files.
      </p>

      <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-xl bg-gray-50 p-4">
        {error ? (
          <p className="text-center text-sm font-medium text-red-600">{error}</p>
        ) : output ? (
          <img
            src={output}
            alt="Final passport composition"
            className="max-h-[360px] w-auto rounded-md border border-gray-300 bg-white object-contain"
          />
        ) : (
          <p className="text-sm text-gray-500">Preparing preview…</p>
        )}
      </div>
    </section>
  );
}
