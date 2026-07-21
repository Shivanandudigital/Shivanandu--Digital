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
    backgroundOk;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md space-y-4">
      <h3 className="text-xl font-bold">
        Passport Compliance
      </h3>

      <div className="space-y-2 text-sm">

        <p>
          {faceDetected ? "✅" : "❌"} Face Detected
        </p>

        <p>
          {centered ? "✅" : "❌"} Face Centered
        </p>

        <p>
          {backgroundOk ? "✅" : "❌"} Background OK
        </p>

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
        className={`rounded-lg p-3 text-center font-semibold ${
          passed
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {passed
          ? "Passport Ready"
          : "Needs Adjustment"}
      </div>
    </div>
  );
}