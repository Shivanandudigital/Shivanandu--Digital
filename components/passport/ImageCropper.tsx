"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import SizeSelector from "./SizeSelector";
import DownloadPanel from "./DownloadPanel";

type Props = {
  image: string;
};

export default function ImageCropper({ image }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);

  const [rotation, setRotation] = useState(0);

  const [size, setSize] = useState("35x45");

  return (
    <div className="space-y-8">

      <SizeSelector
        value={size}
        onChange={setSize}
      />

      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-gray-900">

        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={35 / 45}
          onCropChange={setCrop}
          onZoomChange={setZoom}
        />

      </div>

      <div>

        <label className="font-semibold">
          Zoom
        </label>

        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) =>
            setZoom(Number(e.target.value))
          }
          className="w-full"
        />

      </div>

      <div>

        <label className="font-semibold">
          Rotation
        </label>

        <input
          type="range"
          min={0}
          max={360}
          value={rotation}
          onChange={(e) =>
            setRotation(Number(e.target.value))
          }
          className="w-full"
        />

      </div>

      <DownloadPanel />

    </div>
  );
}