"use client";

import React, { useState, useEffect, useCallback } from "react";
import CropCanvas from "./CropCanvas";
import {
  renderFinalPassportCanvas,
  renderFinalPassportPng,
  type ComposePassportOptions,
} from "@/lib/composePassport";
import { detectAutomaticPassportCrop } from "@/lib/autoPassportCrop";
import { downloadFile } from "@/lib/downloadImage";
import { downloadPdf } from "@/lib/downloadPdf";

interface ImageCropperProps {
  image: string;
  onChooseAnotherPhoto: () => void;
}

export default function ImageCropper({
  image,
  onChooseAnotherPhoto,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [passportSize, setPassportSize] = useState<string>("in_passport");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // অটো-ক্রপ ফাংশন
  const handleAutoFrame = useCallback(() => {
    if (!image) return;
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const detectedCrop = detectAutomaticPassportCrop(img.width, img.height);
      setCrop({ x: detectedCrop.cropX, y: detectedCrop.cropY });
      setZoom(detectedCrop.zoom || 1.0);
      setRotation(0);
      setCroppedAreaPixels({
        x: detectedCrop.cropX,
        y: detectedCrop.cropY,
        width: detectedCrop.cropWidth,
        height: detectedCrop.cropHeight,
      });
    };
  }, [image]);

  useEffect(() => {
    handleAutoFrame();
  }, [handleAutoFrame]);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Single source of truth for the composed photo: the Automatic Passport
  // Frame preview, Final Preview, and every download format all build
  // from this same set of options, so none of them can drift out of sync
  // with each other or with what the person actually cropped/zoomed to.
  const buildComposeOptions = useCallback((): ComposePassportOptions => {
    return {
      imageSrc: image,
      crop: croppedAreaPixels || { x: 0, y: 0, width: 413, height: 531 },
      zoom,
      rotation,
      backgroundColor: bgColor,
      targetWidth: 413,
      targetHeight: 531,
    };
  }, [image, croppedAreaPixels, zoom, rotation, bgColor]);

  // ফাইনাল ক্যানভাস রেন্ডার
  useEffect(() => {
    let isMounted = true;

    async function generatePreview() {
      if (!image) return;

      try {
        const finalUrl = await renderFinalPassportCanvas(buildComposeOptions());

        if (isMounted) {
          setPreviewImage(finalUrl);
        }
      } catch (err) {
        console.error("Preview generation failed:", err);
      }
    }

    generatePreview();

    return () => {
      isMounted = false;
    };
  }, [buildComposeOptions, image]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: "jpg" | "png" | "pdf") => {
    if (!image) return;

    setIsDownloading(true);

    try {
      const options = buildComposeOptions();

      if (format === "jpg") {
        const jpegUrl = await renderFinalPassportCanvas(options);
        downloadFile(jpegUrl, "passport-photo.jpg");
        return;
      }

      // PNG and PDF both use the lossless PNG render of the exact same
      // composition, so neither loses quality to an unnecessary second
      // JPEG re-encode, and both stay pixel-identical to Final Preview.
      const pngUrl = await renderFinalPassportPng(options);

      if (format === "png") {
        downloadFile(pngUrl, "passport-photo.png");
        return;
      }

      downloadPdf(pngUrl, "passport-photo.pdf");
    } catch (err) {
      console.error("Download generation failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passport Photo Maker</h1>
          <p className="text-xs text-gray-500">Upload a mobile photo and review the automatically prepared frame</p>
        </div>
        <button
          onClick={onChooseAnotherPhoto}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-red-700 transition-colors"
        >
          Choose Another Photo
        </button>
      </div>

      {/* Main Options Box */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
        {/* Passport Size */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            PASSPORT / VISA SIZE
          </label>
          <select
            value={passportSize}
            onChange={(e) => setPassportSize(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm font-medium text-gray-800"
          >
            <option value="in_passport">🇮🇳 India Passport / Visa (35×45 mm)</option>
            <option value="us_passport">🇺🇸 US Passport (2×2 inch)</option>
            <option value="uk_passport">🇬🇧 UK Passport (35×45 mm)</option>
          </select>
        </div>

        {/* Background Color Palette */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            BACKGROUND COLOR
          </label>
          <div className="flex items-center gap-3">
            {["#FFFFFF", "#60A5FA", "#EF4444", "#E5E7EB", "#1E293B"].map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setBgColor(hex)}
                className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                  bgColor === hex ? "border-blue-600 scale-105 ring-2 ring-blue-300" : "border-gray-300"
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Editor Adjustments */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
            EDITOR CONTROLS
          </label>
          
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Zoom</span>
              <span>{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Rotation</span>
              <span>{rotation}°</span>
            </div>
            <input
              type="range"
              min={-45}
              max={45}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Brightness ({brightness}%)</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>Contrast ({contrast}%)</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Frame Canvas Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-700">Automatic Passport Frame</h3>
        <CropCanvas
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2.5))}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          >
            + Zoom
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.1, 1))}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          >
            - Zoom
          </button>
          <button
            onClick={handleAutoFrame}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Auto Frame
          </button>
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          >
            ↺ Rotate
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
          >
            ↻ Rotate
          </button>
        </div>
      </div>

      {/* Final Preview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Final Preview</h3>
        <div className="flex justify-center bg-gray-50 p-6 rounded-xl">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Final Passport Preview"
              className="h-[220px] w-[170px] border border-gray-300 shadow-md rounded object-contain bg-white"
            />
          ) : (
            <div className="text-xs text-gray-400">Generating preview...</div>
          )}
        </div>
      </div>

      {/* Download Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
        <div className="text-xs text-gray-600">
          <p><strong>Size:</strong> India Passport (35×45 mm)</p>
          <p><strong>Background:</strong> {bgColor}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => handleDownload("jpg")}
            disabled={isDownloading}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? "Preparing..." : "Download JPG"}
          </button>
          <button
            onClick={() => handleDownload("png")}
            disabled={isDownloading}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? "Preparing..." : "Download PNG"}
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={isDownloading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? "Preparing..." : "Download PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
          >
            Print Sheet
          </button>
        </div>
      </div>
    </div>
  );
}