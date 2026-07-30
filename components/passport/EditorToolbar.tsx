"use client";

type Props = {
  zoom: number;
  rotation: number;

  onZoomIn: () => void;
  onZoomOut: () => void;

  onRotateLeft: () => void;
  onRotateRight: () => void;
  onAutoZoom: () => void;
};

export default function EditorToolbar({
  zoom,
  rotation,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onAutoZoom,
}: Props) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-3 py-4 sm:px-6">

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

        <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-gray-700">
          🔍 Zoom: {Math.round(zoom * 100)}%
          <span className="hidden text-gray-400 sm:inline">|</span>
          🔄 Rotation: {rotation}°
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">

          <button
            onClick={onZoomIn}
            className="min-h-10 rounded-lg border bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            ➕ Zoom
          </button>

          <button
            onClick={onZoomOut}
            className="min-h-10 rounded-lg border bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            ➖ Zoom
          </button>

<button
  onClick={onAutoZoom}
  className="col-span-2 min-h-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:col-span-1"
>
  Auto Zoom
</button>
          <button
            onClick={onRotateLeft}
            className="min-h-10 rounded-lg border bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            ↺ Rotate
          </button>

          <button
            onClick={onRotateRight}
            className="min-h-10 rounded-lg border bg-white px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            ↻ Rotate
          </button>

          <span className="col-span-2 rounded-full bg-green-100 px-3 py-2 text-center text-xs font-semibold text-green-700 sm:col-span-1">
            Live Editing
          </span>

        </div>

      </div>

    </div>
  );
}
