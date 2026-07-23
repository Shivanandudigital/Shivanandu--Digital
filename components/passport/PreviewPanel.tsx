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

      <div className="flex justify-center rounded-xl bg-gray-100 p-6">
        <div
          className="overflow-hidden rounded-lg border-2 border-gray-300 shadow"
          style={{
  width: 210,
  height: 270,
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

      <div className="mt-5 space-y-2 text-sm">

  <div className="flex justify-between">
    <span className="text-gray-500">Preview</span>
    <span className="font-semibold text-green-600">
      Live
    </span>
  </div>

  <div className="flex justify-between">
    <span className="text-gray-500">Background</span>
    <span className="font-semibold">
      Selected
    </span>
  </div>

  <div className="flex justify-between">
    <span className="text-gray-500">Status</span>
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
      Ready
    </span>
  </div>

</div>

    </div>
  );
}