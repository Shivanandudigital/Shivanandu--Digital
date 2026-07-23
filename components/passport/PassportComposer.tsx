"use client";

import { useEffect, useState } from "react";

import { composePassportPhoto } from "@/lib/composePassport";

type Props = {
  image: string;
  size: string;
  backgroundColor: string;
};

export default function PassportComposer({
  image,
  size,
  backgroundColor,
}: Props) {
  const [output, setOutput] = useState<string>();

  useEffect(() => {
    async function compose() {
      const img = new Image();

      img.src = image;

      await new Promise((resolve) => {
        img.onload = () => resolve(true);
      });

      const result =
        await composePassportPhoto(
          img,
          size,
          backgroundColor
        );

      setOutput(result);
    }

    compose();
  }, [
    image,
    size,
    backgroundColor,
  ]);

  if (!output) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="mb-4 text-lg font-bold">
        AI Passport Composition
      </h3>

      <img
        src={output}
        alt="Passport"
        className="mx-auto rounded border"
      />

    </div>
  );
}