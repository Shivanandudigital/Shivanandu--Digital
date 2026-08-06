"use client";

import React from "react";

interface LeftSidebarProps {
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  passportSize?: string;
  onSizeChange?: (size: string) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  rotation?: number;
  onRotationChange?: (rotation: number) => void;
  brightness?: number;
  onBrightnessChange?: (val: number) => void;
  contrast?: number;
  onContrastChange?: (val: number) => void;
  saturation?: number;
  onSaturationChange?: (val: number) => void;
  [key: string]: any;
}

export default function LeftSidebar({
  bgColor = "#FFFFFF",
  onBgColorChange,
  passportSize = "in_passport",
  onSizeChange,
  zoom = 1,
  onZoomChange,
  rotation = 0,
  onRotationChange,
  brightness = 100,
  onBrightnessChange,
  contrast = 100,
  onContrastChange,
  saturation = 100,
  onSaturationChange,
}: LeftSidebarProps) {
  const bgColors = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Light Blue", hex: "#60A5FA" },
    { name: "Red", hex: "#EF4444" },
    { name: "Light Gray", hex: "#E5E7EB" },
    { name: "Navy Blue", hex: "#1E293B" },
  ];

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      {/* Passport Size Selector */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
          Passport / Visa Size
        </label>
        <select
          value={passportSize}
          onChange={(e) => onSizeChange && onSizeChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none"
        >
          <option value="in_passport">🇮🇳 India Passport / Visa (35×45 mm)</option>
          <option value="us_passport">🇺🇸 US Passport / Visa (2×2 inch)</option>
          <option value="uk_passport">🇬🇧 UK Passport (35×45 mm)</option>
          <option value="sch_visa">🇪🇺 Schengen Visa (35×45 mm)</option>
        </select>
      </div>

      {/* Background Color Palette */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
          Background Color
        </label>
        <div className="flex items-center gap-3">
          {bgColors.map((item) => (
            <button
              key={item.hex}
              type="button"
              title={item.name}
              onClick={() => onBgColorChange && onBgColorChange(item.hex)}
              className={`h-9 w-9 rounded-full border-2 transition-all transform hover:scale-110 ${
                bgColor === item.hex
                  ? "border-blue-600 scale-105 shadow-md ring-2 ring-blue-300"
                  : "border-slate-300"
              }`}
              style={{ backgroundColor: item.hex }}
            />
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Fine-Tune Controls */}
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Editor Adjustments
        </span>

        {/* Zoom */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange && onZoomChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Rotation */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Rotation</span>
            <span>{rotation}°</span>
          </div>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={rotation}
            onChange={(e) => onRotationChange && onRotationChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            value={brightness}
            onChange={(e) => onBrightnessChange && onBrightnessChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Contrast</span>
            <span>{contrast}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            value={contrast}
            onChange={(e) => onContrastChange && onContrastChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}