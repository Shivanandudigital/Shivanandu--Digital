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
    suggestions.push("Choose a photo that clearly shows the face.");
  }

  if (!centered) {
    suggestions.push("Adjust the crop so the face stays centered.");
  }

  if (!backgroundOk) {
    suggestions.push("Try a solid background that contrasts with the subject.");
  }

  if (headStatus === "small") {
    suggestions.push("Use a little more zoom so the head appears larger.");
  }

  if (headStatus === "large") {
    suggestions.push("Use a little less zoom so the head appears smaller.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Review the preview and adjust the crop if needed.");
  }

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-lg font-bold">Simple Notes</h3>

      <div className="space-y-3">
        {suggestions.map((item, index) => (
          <div
            key={index}
            className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700"
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  );
}
