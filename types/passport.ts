export type Point = {
  x: number;
  y: number;
};

export type FaceData = {
  forehead: Point;
  chin: Point;
  leftEye: Point;
  rightEye: Point;
  eyeTilt: number;
};

// Source-image coordinates. Scale defines the professional framing; offsets define its source origin.
export type Composition = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type PassportSize = {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
};

export type PassportAnalysis = {
  face: FaceData;
  composition: Composition;
  headHeightPercent: number;
  eyeLinePercent: number;
  headSizeValid: boolean;
  eyeLineValid: boolean;
  shouldersAvailable: boolean;
  complianceScore: number;
};

export const passportSizes: PassportSize[] = [
  { id: "india", label: "India Passport (35 × 45 mm)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: "us", label: "US Passport / Visa (2 × 2 inch)", widthMm: 51, heightMm: 51, widthPx: 602, heightPx: 602 },
  { id: "schengen", label: "Schengen Visa (35 × 45 mm)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
  { id: "canada", label: "Canada Visa (50 × 70 mm)", widthMm: 50, heightMm: 70, widthPx: 591, heightPx: 827 },
  { id: "uk", label: "UK Passport (35 × 45 mm)", widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531 },
];
