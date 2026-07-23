"use client";

type Props = {
  faceDetected: boolean;
  centered: boolean;
  backgroundOk: boolean;
  headStatus: "perfect" | "small" | "large" | "unknown";
};

export default function AISuggestions({
  faceDetected,
  centered,
  backgroundOk,
  headStatus,
}: Props) {
  const suggestions: string[] = [];

  if (!faceDetected) {
    suggestions.push("Upload a photo with one clearly visible face.");
  }

  if (!centered) {
    suggestions.push("Move your face to the center of the frame.");
  }

  if (!backgroundOk) {
    suggestions.push("Use a plain white or light-colored background.");
  }

  if (headStatus === "small") {
    suggestions.push("Zoom in slightly so your head fills more of the frame.");
  }

  if (headStatus === "large") {
    suggestions.push("Zoom out slightly to reduce head size.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Excellent! Your photo meets all current checks.");
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">
        AI Suggestions
      </h3>

      <div className="space-y-3">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700"
          >
            💡 {item}
          </div>
        ))}
      </div>
    </div>
  );
}