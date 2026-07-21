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
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-xl font-bold">
        Download Options
      </h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <button
          onClick={onDownloadJPG}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          📷 Download JPG
        </button>

        <button
          onClick={onDownloadPNG}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          🖼 Download PNG
        </button>

        <button
          onClick={onDownloadPDF}
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          📄 Download PDF
        </button>

        <button
          onClick={onPrint}
          className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          🖨 Print Sheet
        </button>

      </div>
    </div>
  );
}