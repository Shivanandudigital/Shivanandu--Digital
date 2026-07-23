"use client";

type Props = {
  faceDetected: boolean;
  centered: boolean;
  backgroundOk: boolean;
  headSize: number;
  headStatus: "perfect" | "small" | "large" | "unknown";
};

export default function CompliancePanel({
  faceDetected,
  centered,
  backgroundOk,
  headSize,
  headStatus,
}: Props) {
  const passed =
    faceDetected &&
    centered &&
    backgroundOk &&
    headStatus === "perfect";

  const score =
    (faceDetected ? 25 : 0) +
    (centered ? 25 : 0) +
    (backgroundOk ? 25 : 0) +
    (headStatus === "perfect" ? 25 : 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-5 border-b border-gray-100 pb-3">
        <h3 className="text-lg font-bold text-gray-800">
          ICAO Compliance Check
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Live passport validation
        </p>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Compliance Score
          </span>

          <span className="font-bold text-blue-600">
            {score}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">

        <p>{faceDetected ? "✅" : "❌"} Face Detected</p>

        <p>{centered ? "✅" : "❌"} Face Centered</p>

        <p>{backgroundOk ? "✅" : "❌"} Background OK</p>

        <p>
          {headStatus === "perfect"
            ? "✅"
            : headStatus === "unknown"
            ? "➖"
            : "⚠️"}{" "}
          Head Size: {headSize}%
        </p>

      </div>

      <div
        className={`mt-6 rounded-lg p-3 text-center font-semibold ${
          passed
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {passed ? "Passport Ready" : "Needs Adjustment"}
      </div>

    </div>
  );
}