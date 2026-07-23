"use client";

type Props = {
  faceDetected: boolean;
  headStatus: "perfect" | "small" | "large" | "unknown";
};

export default function EyeAlignmentGuide({
  faceDetected,
  headStatus,
}: Props) {
  if (!faceDetected) return null;

  let message = "Eyes are correctly positioned";
  let color = "bg-green-600";

  if (headStatus === "small") {
    message = "Move closer to the camera";
    color = "bg-orange-500";
  }

  if (headStatus === "large") {
    message = "Move slightly away";
    color = "bg-orange-500";
  }

  return (
    <div className="absolute top-6 left-1/2 z-30 -translate-x-1/2">
      <div
        className={`${color} rounded-full px-4 py-2 text-xs font-semibold text-white shadow-lg`}
      >
        👀 {message}
      </div>
    </div>
  );
}