"use client";

type Props = {
  onChoosePhoto: () => void;
};

export default function EditorHeader({
  onChoosePhoto,
}: Props) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-3xl font-bold">
          Passport Photo Maker
        </h2>

        <p className="text-gray-500">
          Professional Passport & Visa Photo Editor
        </p>
      </div>

      <button
        onClick={onChoosePhoto}
        className="rounded-xl bg-red-600 px-5 py-3 text-white font-semibold hover:bg-red-700"
      >
        Choose Another Photo
      </button>
    </div>
  );
}