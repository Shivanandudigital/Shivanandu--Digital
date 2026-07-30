"use client";

type Props = {
  onDownloadJPG?: () => void;
  onDownloadPNG?: () => void;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
};

export default function DownloadPanel({
  onDownloadJPG,
  onDownloadPNG,
  onDownloadPDF,
  onPrint,
}: Props) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="mb-5 text-xl font-bold">
        Download Options
      </h3>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">

        <button
          onClick={onDownloadJPG}
          className="min-h-12 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 sm:px-6"
        >
          📷 Download JPG
        </button>

        <button
          onClick={onDownloadPNG}
          className="min-h-12 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 sm:px-6"
        >
          🖼 Download PNG
        </button>

        <button
          onClick={onDownloadPDF}
          className="min-h-12 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 sm:px-6"
        >
          📄 Download PDF
        </button>

        <button
          onClick={onPrint}
          className="min-h-12 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 sm:px-6"
        >
          🖨 Print Sheet
        </button>

      </div>
    </div>
  );
}
