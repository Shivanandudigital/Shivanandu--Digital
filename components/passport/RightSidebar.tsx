"use client";

import PreviewPanel from "./PreviewPanel";
import CompliancePanel from "./CompliancePanel";

type Props = {
  previewUrl?: string;
  backgroundColor: string;

  faceDetected: boolean;
  centered: boolean;
  backgroundOk: boolean;

  headSize: number;
  headStatus: "perfect" | "small" | "large" | "unknown";
};

export default function RightSidebar({
  previewUrl,
  backgroundColor,

  faceDetected,
  centered,
  backgroundOk,

  headSize,
  headStatus,
}: Props) {
  return (
    <div className="space-y-6">

      <PreviewPanel
        previewUrl={previewUrl}
        backgroundColor={backgroundColor}
      />

      <CompliancePanel
        faceDetected={faceDetected}
        centered={centered}
        backgroundOk={backgroundOk}
        headSize={headSize}
        headStatus={headStatus}
      />

    </div>
  );
}