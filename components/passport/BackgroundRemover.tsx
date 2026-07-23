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
    <div>

      <h3 className="mb-2 text-base font-semibold">
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