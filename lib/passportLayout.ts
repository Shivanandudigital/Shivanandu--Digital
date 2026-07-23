export type PassportLayout = {
  canvasWidth: number;
  canvasHeight: number;

  photoWidth: number;
  photoHeight: number;

  headTopPercent: number;
  headHeightPercent: number;
};

export const passportLayouts = {
  "35x45": {
    canvasWidth: 413,
    canvasHeight: 531,

    photoWidth: 413,
    photoHeight: 531,

    // ICAO guideline
    headTopPercent: 8,
    headHeightPercent: 74,
  },

  "2x2": {
    canvasWidth: 600,
    canvasHeight: 600,

    photoWidth: 600,
    photoHeight: 600,

    headTopPercent: 10,
    headHeightPercent: 72,
  },
};

export function getPassportLayout(size: string): PassportLayout {
  return (
    passportLayouts[size as keyof typeof passportLayouts] ??
    passportLayouts["35x45"]
  );
}