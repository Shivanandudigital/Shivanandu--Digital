"use client";

type Props = {
  faceDetected: boolean;
  centered: boolean;
  backgroundOk: boolean;
  eyeLineOk: boolean;
  headSize: number;
  headStatus: "perfect" | "small" | "large" | "unknown";
};

export default function CompliancePanel({
  faceDetected,
  centered,
  backgroundOk,
  eyeLineOk,
  headSize,
  headStatus,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-lg font-bold text-gray-800">Preview Notes</h3>
      <p className="mt-2 text-sm text-gray-500">Review the current crop and background before downloading.</p>
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>Face: {faceDetected ? "Detected" : "Not detected"}</p>
        <p>Centered: {centered ? "Yes" : "Adjust crop"}</p>
        <p>Background: {backgroundOk ? "Ready" : "Check selection"}</p>
        <p>Eye line: {eyeLineOk ? "Stable" : "Adjust"}</p>
        <p>Head size: {headSize}%</p>
        <p>Status: {headStatus}</p>
      </div>
    </div>
  );
}
