"use client";

type Props = {
  score: number;
};

export default function QualityScore({
  score,
}: Props) {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-lg font-bold">Preview Status</h3>

      <div className="flex items-center justify-center rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600">
        Current adjustment level: {score}
      </div>
    </div>
  );
}
