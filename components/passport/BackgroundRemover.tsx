    "use client";

type Props = {
  onRemove: () => void;
  loading: boolean;
};

export default function BackgroundRemover({
  onRemove,
  loading,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <h3 className="mb-4 text-lg font-bold">
        AI Background Removal
      </h3>

      <button
        onClick={onRemove}
        disabled={loading}
        className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {loading
          ? "Removing Background..."
          : "✨ Remove Background"}
      </button>

    </div>
  );
}