"use client";

type Props = {
  previewUrl?: string;
  backgroundColor?: string;
};

export default function PreviewPanel({
  previewUrl,
  backgroundColor = "#ffffff",
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <h3 className="mb-5 text-xl font-bold">
        Live Preview
      </h3>

      <div className="flex justify-center">
        <div
          className="overflow-hidden rounded-lg border-2 border-gray-300 shadow"
          style={{
            width: 140,
            height: 180,
            backgroundColor,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Passport Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Preview will appear here
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Live passport preview
      </p>

    </div>
  );
}