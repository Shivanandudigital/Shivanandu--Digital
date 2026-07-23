"use client";

type Props = {
  score: number;
};

export default function QualityScore({
  score,
}: Props) {
  const color =
    score >= 90
      ? "text-green-600"
      : score >= 70
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="mb-4 text-lg font-bold">
        AI Quality Score
      </h3>

      <div className="flex items-center justify-center">

        <div
          className={`flex h-28 w-28 items-center justify-center rounded-full border-8 ${color.replace(
            "text",
            "border"
          )}`}
        >
          <div className="text-center">
            <div className={`text-3xl font-bold ${color}`}>
              {score}
            </div>

            <div className="text-xs text-gray-500">
              /100
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}