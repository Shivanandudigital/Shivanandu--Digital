"use client";

type Props = {
  zoom: number;
  rotation: number;

  onZoomIn: () => void;
  onZoomOut: () => void;

  onRotateLeft: () => void;
  onRotateRight: () => void;
};

export default function EditorToolbar({
  zoom,
  rotation,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
}: Props) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-gray-700">
          🔍 Zoom: {Math.round(zoom * 100)}%
          <span className="mx-3 text-gray-400">|</span>
          🔄 Rotation: {rotation}°
        </p>

        <div className="flex items-center gap-2">

          <button
            onClick={onZoomIn}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
          >
            ➕ Zoom
          </button>

          <button
            onClick={onZoomOut}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
          >
            ➖ Zoom
          </button>

          <button
            onClick={onRotateLeft}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
          >
            ↺ Rotate
          </button>

          <button
            onClick={onRotateRight}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
          >
            ↻ Rotate
          </button>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Live Editing
          </span>

        </div>

      </div>

    </div>
  );
}