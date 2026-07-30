"use client";

import PreviewPanel from "./PreviewPanel";
import CompliancePanel from "./CompliancePanel";

type FaceData = {
  forehead: { x: number; y: number };
  chin: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
};

type Composition = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type Props = {
  image: HTMLImageElement | null;
  composition: Composition;
  face: FaceData;
  backgroundColor: string;

  faceDetected: boolean;
  centered: boolean;
  backgroundOk: boolean;
  eyeLineOk: boolean;

  headSize: number;
  headStatus: "perfect" | "small" | "large" | "unknown";
};

export default function RightSidebar({
  image,
  composition,
  face,
  backgroundColor,
  faceDetected,
  centered,
  backgroundOk,
  eyeLineOk,
  headSize,
  headStatus,
}: Props) {
  return (
    <div className="space-y-6">
      <PreviewPanel
        image={image}
        composition={composition}
        face={face}
        backgroundColor={backgroundColor}
      />

      <CompliancePanel
        faceDetected={faceDetected}
        centered={centered}
        backgroundOk={backgroundOk}
        eyeLineOk={eyeLineOk}
        headSize={headSize}
        headStatus={headStatus}
      />
    </div>
  );
}