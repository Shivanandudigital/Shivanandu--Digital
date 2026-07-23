"use client";

type Props = {
  faceDetected: boolean;
  headSize: number;
  headStatus: "perfect" | "small" | "large" | "unknown";
  centered: boolean;
  sizeName: string;
};

export default function PhotoInfoPanel({
  faceDetected,
  headSize,
  headStatus,
  centered,
  sizeName,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <h3 className="mb-4 text-lg font-bold">
        Photo Information
      </h3>

      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span>Face</span>
          <span>
            {faceDetected ? "✅ Detected" : "❌ Not Found"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Center</span>
          <span>
            {centered ? "✅ Perfect" : "⚠️ Adjust"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Head Size</span>
          <span>
            {headSize}%
          </span>
        </div>

        <div className="flex justify-between">
          <span>Status</span>
          <span>
            {headStatus}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Template</span>
          <span>{sizeName}</span>
        </div>

      </div>

    </div>
  );
}