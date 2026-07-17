"use client";

export default function DownloadPanel() {
  return (
    <div className="mt-8 flex flex-wrap gap-4">

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
      >
        ⬇ Download JPG
      </button>

      <button
        className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700"
      >
        📄 Download PDF
      </button>

      <button
        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
      >
        🖨 Print Sheet
      </button>

    </div>
  );
}