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
    <div className="h-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-lg font-bold">Edit Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span>Face</span>
          <span className="text-right">{faceDetected ? "Detected" : "Not detected"}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span>Center</span>
          <span className="text-right">{centered ? "Centered" : "Adjust crop"}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span>Head Size</span>
          <span className="text-right">{headSize}%</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span>Status</span>
          <span className="text-right capitalize">{headStatus}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <span>Template</span>
          <span className="min-w-0 text-right leading-5">{sizeName}</span>
        </div>
      </div>
    </div>
  );
}
