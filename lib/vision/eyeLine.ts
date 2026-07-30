export interface EyeLineResult {
  eyeY: number;
  ratio: number;
  valid: boolean;
  message: string;
}

export function validateEyeLine(
  leftEyeY: number,
  rightEyeY: number,
  imageHeight: number
): EyeLineResult {
  const eyeY = (leftEyeY + rightEyeY) / 2;

  // Distance from top of image
  const ratio = eyeY / imageHeight;

  /*
    ICAO Recommendation
    Eye line should generally be around 50–60%
    from the top depending on crop.
  */

  const MIN = 0.50;
  const MAX = 0.60;

  if (ratio < MIN) {
    return {
      eyeY,
      ratio,
      valid: false,
      message: "Move face downward"
    };
  }

  if (ratio > MAX) {
    return {
      eyeY,
      ratio,
      valid: false,
      message: "Move face upward"
    };
  }

  return {
    eyeY,
    ratio,
    valid: true,
    message: "Eye line is correct"
  };
}