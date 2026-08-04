"use client";

type Props = {
  onChoosePhoto: () => void;
};

export default function EditorHeader({
  onChoosePhoto,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
          Passport Photo Editor
        </h2>

        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Adjust the crop, background, and final framing before download.
        </p>
      </div>

      <button
        onClick={onChoosePhoto}
        className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 md:w-auto"
      >
        Choose Another Photo
      </button>
    </div>
  );
}
