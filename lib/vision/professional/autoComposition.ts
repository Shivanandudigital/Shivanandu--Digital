import type {
  FaceGeometry,
  FaceLandmarks,
  Point,
} from "./faceGeometry";

import {
  calculateFaceGeometry,
  isEyeLineAcceptable,
  isEyeRotationAcceptable,
  isVerticalTiltAcceptable,
} from "./faceGeometry";

export type PassportLayoutRules = {
  targetHeadHeightRatio: number;
  minimumHeadHeightRatio: number;
  maximumHeadHeightRatio: number;
  targetEyeLineRatio: number;
  minimumEyeLineRatio: number;
  maximumEyeLineRatio: number;
  targetFaceCenterXRatio: number;
  minimumTopMarginRatio: number;
  maximumTopMarginRatio: number;
  minimumSideMarginRatio: number;
  maximumEyeRotation: number;
  maximumVerticalTilt: number;
  minimumScale: number;
  maximumScale: number;
};

export type AutoCompositionInput = {
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  face: FaceLandmarks;
  rules?: Partial<PassportLayoutRules>;
};

export type AutoCompositionResult = {
  scale: number;
  offsetX: number;
  offsetY: number;

  /** Clockwise canvas rotation. */
  rotationRadians: number;
  rotationDegrees: number;

  /** Source-image pivot used by the renderer. */
  sourcePivotX: number;
  sourcePivotY: number;

  /** Final canvas position of the source pivot. */
  targetPivotX: number;
  targetPivotY: number;

  headHeightRatio: number;
  eyeLineRatio: number;
  topMarginRatio: number;
  faceCenterXRatio: number;
  renderedImageWidth: number;
  renderedImageHeight: number;
  isValid: boolean;
  compliance: AutoCompositionCompliance;
};

export type AutoCompositionCompliance = {
  faceDetected: boolean;
  headSizeOk: boolean;
  headTooSmall: boolean;
  headTooLarge: boolean;
  faceCentered: boolean;
  eyeLineOk: boolean;
  eyesTooHigh: boolean;
  eyesTooLow: boolean;
  eyeRotationOk: boolean;
  verticalTiltOk: boolean;
  topMarginOk: boolean;
  overallOk: boolean;
  warnings: string[];
};

export const DEFAULT_PASSPORT_LAYOUT_RULES: PassportLayoutRules = {
  targetHeadHeightRatio: 0.59,
  minimumHeadHeightRatio: 0.50,
  maximumHeadHeightRatio: 0.62,
  targetEyeLineRatio: 0.43,
  minimumEyeLineRatio: 0.38,
  maximumEyeLineRatio: 0.49,
  targetFaceCenterXRatio: 0.5,
  minimumTopMarginRatio: 0.07,
  maximumTopMarginRatio: 0.11,
  minimumSideMarginRatio: 0.05,
  maximumEyeRotation: 5,
  maximumVerticalTilt: 6,
  minimumScale: 0.01,
  maximumScale: 20,
};

const NATURAL_HEAD_RATIO_MIN = 0.56;
const NATURAL_HEAD_RATIO_MAX = 0.59;
const NATURAL_TOP_MARGIN_MIN = 0.07;
const NATURAL_TOP_MARGIN_MAX = 0.11;
const MAXIMUM_CHIN_LINE_RATIO = 0.7;
const TOP_MARGIN_WEIGHT = 0.68;
const EYE_LINE_WEIGHT = 1 - TOP_MARGIN_WEIGHT;

/** Auto-straight is deliberately limited so extreme poses are not distorted. */
const AUTO_STRAIGHT_DEADBAND_DEGREES = 0.35;
const AUTO_STRAIGHT_FULL_LIMIT_DEGREES = 8;
const AUTO_STRAIGHT_HARD_LIMIT_DEGREES = 12;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function isPositiveFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function mergeRules(
  customRules?: Partial<PassportLayoutRules>
): PassportLayoutRules {
  return {
    ...DEFAULT_PASSPORT_LAYOUT_RULES,
    ...customRules,
  };
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function getEyeAngleDegrees(face: FaceLandmarks): number {
  return radiansToDegrees(
    Math.atan2(
      face.rightEye.y - face.leftEye.y,
      face.rightEye.x - face.leftEye.x
    )
  );
}

function calculateSafeCorrectionDegrees(face: FaceLandmarks): number {
  const eyeAngle = getEyeAngleDegrees(face);
  const absoluteAngle = Math.abs(eyeAngle);

  if (
    !Number.isFinite(eyeAngle) ||
    absoluteAngle < AUTO_STRAIGHT_DEADBAND_DEGREES ||
    absoluteAngle > AUTO_STRAIGHT_HARD_LIMIT_DEGREES
  ) {
    return 0;
  }

  const limitedAngle = clamp(
    eyeAngle,
    -AUTO_STRAIGHT_FULL_LIMIT_DEGREES,
    AUTO_STRAIGHT_FULL_LIMIT_DEGREES
  );

  // Opposite rotation makes the eye line horizontal.
  return -limitedAngle;
}

function rotatePointAround(
  point: Point,
  pivot: Point,
  radians: number
): Point {
  if (Math.abs(radians) < 0.000001) {
    return { ...point };
  }

  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const x = point.x - pivot.x;
  const y = point.y - pivot.y;

  return {
    x: pivot.x + x * cosine - y * sine,
    y: pivot.y + x * sine + y * cosine,
  };
}

function rotateFace(
  face: FaceLandmarks,
  pivot: Point,
  radians: number
): FaceLandmarks {
  return {
    forehead: rotatePointAround(face.forehead, pivot, radians),
    chin: rotatePointAround(face.chin, pivot, radians),
    leftEye: rotatePointAround(face.leftEye, pivot, radians),
    rightEye: rotatePointAround(face.rightEye, pivot, radians),
  };
}

export function calculateAutoComposition(
  input: AutoCompositionInput
): AutoCompositionResult {
  const {
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    face,
  } = input;

  const rules = mergeRules(input.rules);

  if (
    !isPositiveFiniteNumber(imageWidth) ||
    !isPositiveFiniteNumber(imageHeight) ||
    !isPositiveFiniteNumber(canvasWidth) ||
    !isPositiveFiniteNumber(canvasHeight)
  ) {
    return createInvalidAutoComposition();
  }

  const originalGeometry = calculateFaceGeometry(face);

  if (
    !originalGeometry.isValid ||
    !isPositiveFiniteNumber(originalGeometry.headHeight)
  ) {
    return createInvalidAutoComposition();
  }

  const sourcePivot: Point = {
    x: originalGeometry.faceCenterX,
    y: originalGeometry.eyeCenterY,
  };

  const rotationDegrees = calculateSafeCorrectionDegrees(face);
  const rotationRadians = degreesToRadians(rotationDegrees);
  const straightFace = rotateFace(face, sourcePivot, rotationRadians);
  const geometry = calculateFaceGeometry(straightFace);

  if (!geometry.isValid || !isPositiveFiniteNumber(geometry.headHeight)) {
    return createInvalidAutoComposition();
  }

  const requestedHeadRatio = clamp(
    rules.targetHeadHeightRatio,
    NATURAL_HEAD_RATIO_MIN,
    NATURAL_HEAD_RATIO_MAX
  );

  const preferredTopMarginRatio = clamp(
    (rules.minimumTopMarginRatio + rules.maximumTopMarginRatio) / 2,
    NATURAL_TOP_MARGIN_MIN,
    NATURAL_TOP_MARGIN_MAX
  );

  const bodySafeHeadRatio = Math.max(
    NATURAL_HEAD_RATIO_MIN,
    MAXIMUM_CHIN_LINE_RATIO - preferredTopMarginRatio
  );

  const finalTargetHeadRatio = clamp(
    requestedHeadRatio,
    NATURAL_HEAD_RATIO_MIN,
    Math.min(bodySafeHeadRatio, NATURAL_HEAD_RATIO_MAX)
  );

  let scale =
    (canvasHeight * finalTargetHeadRatio) / geometry.headHeight;

  scale = clamp(scale, rules.minimumScale, rules.maximumScale);

  const targetFaceCenterX =
    canvasWidth * rules.targetFaceCenterXRatio;
  const targetForeheadY = canvasHeight * preferredTopMarginRatio;
  const targetEyeY =
    canvasHeight * clamp(rules.targetEyeLineRatio, 0.4, 0.46);

  const offsetFromForehead =
    targetForeheadY - straightFace.forehead.y * scale;
  const offsetFromEyes = targetEyeY - geometry.eyeCenterY * scale;

  let offsetY =
    offsetFromForehead * TOP_MARGIN_WEIGHT +
    offsetFromEyes * EYE_LINE_WEIGHT;
  let offsetX = targetFaceCenterX - geometry.faceCenterX * scale;

  const minimumTopMarginRatio = clamp(
    rules.minimumTopMarginRatio,
    NATURAL_TOP_MARGIN_MIN,
    NATURAL_TOP_MARGIN_MAX
  );
  const maximumTopMarginRatio = clamp(
    rules.maximumTopMarginRatio,
    minimumTopMarginRatio,
    NATURAL_TOP_MARGIN_MAX
  );
  const minimumVerticalOffset =
    canvasHeight * minimumTopMarginRatio -
    straightFace.forehead.y * scale;
  const maximumOffsetFromTopMargin =
    canvasHeight * maximumTopMarginRatio -
    straightFace.forehead.y * scale;
  const maximumOffsetFromChin =
    canvasHeight * MAXIMUM_CHIN_LINE_RATIO -
    straightFace.chin.y * scale;
  const maximumVerticalOffset = Math.min(
    maximumOffsetFromTopMargin,
    maximumOffsetFromChin
  );

  // Top clearance and visible upper body take priority when the eye target
  // cannot be satisfied at the same time for unusual landmark geometry.
  offsetY = clamp(
    offsetY,
    Math.min(minimumVerticalOffset, maximumVerticalOffset),
    maximumVerticalOffset
  );

  const renderedImageWidth = imageWidth * scale;
  const renderedImageHeight = imageHeight * scale;

  offsetX = constrainLooseOffset(
    offsetX,
    renderedImageWidth,
    canvasWidth,
    canvasWidth * 0.12
  );

  offsetY = constrainLooseOffset(
    offsetY,
    renderedImageHeight,
    canvasHeight,
    canvasHeight * 0.08
  );
  offsetY = clamp(
    offsetY,
    Math.min(minimumVerticalOffset, maximumVerticalOffset),
    maximumVerticalOffset
  );

  const targetPivotX = offsetX + sourcePivot.x * scale;
  const targetPivotY = offsetY + sourcePivot.y * scale;

  const finalForehead = transformPointWithComposition(straightFace.forehead, {
    scale,
    offsetX,
    offsetY,
  });
  const finalChin = transformPointWithComposition(straightFace.chin, {
    scale,
    offsetX,
    offsetY,
  });
  const finalLeftEye = transformPointWithComposition(straightFace.leftEye, {
    scale,
    offsetX,
    offsetY,
  });
  const finalRightEye = transformPointWithComposition(straightFace.rightEye, {
    scale,
    offsetX,
    offsetY,
  });

  const finalEyeY = (finalLeftEye.y + finalRightEye.y) / 2;
  const finalFaceCenterX = (finalForehead.x + finalChin.x) / 2;
  const finalHeadHeight = Math.hypot(
    finalChin.x - finalForehead.x,
    finalChin.y - finalForehead.y
  );

  const headHeightRatio = finalHeadHeight / canvasHeight;
  const eyeLineRatio = finalEyeY / canvasHeight;
  const topMarginRatio = finalForehead.y / canvasHeight;
  const faceCenterXRatio = finalFaceCenterX / canvasWidth;

  const effectiveRules: PassportLayoutRules = {
    ...rules,
    targetHeadHeightRatio: finalTargetHeadRatio,
    minimumHeadHeightRatio: Math.min(
      rules.minimumHeadHeightRatio,
      Math.max(
        NATURAL_HEAD_RATIO_MIN,
        finalTargetHeadRatio - 0.03
      )
    ),
    maximumHeadHeightRatio: Math.max(
      finalTargetHeadRatio,
      Math.min(
        rules.maximumHeadHeightRatio,
        NATURAL_HEAD_RATIO_MAX + 0.03
      )
    ),
    minimumEyeLineRatio: Math.min(
      rules.minimumEyeLineRatio,
      0.35
    ),
    minimumTopMarginRatio,
    maximumTopMarginRatio,
  };

  const compliance = evaluateAutoCompositionCompliance({
    geometry,
    headHeightRatio,
    eyeLineRatio,
    topMarginRatio,
    faceCenterXRatio,
    rules: effectiveRules,
    originalEyeAngleDegrees: getEyeAngleDegrees(face),
    appliedRotationDegrees: rotationDegrees,
  });

  return {
    scale,
    offsetX,
    offsetY,
    rotationRadians,
    rotationDegrees,
    sourcePivotX: sourcePivot.x,
    sourcePivotY: sourcePivot.y,
    targetPivotX,
    targetPivotY,
    headHeightRatio,
    eyeLineRatio,
    topMarginRatio,
    faceCenterXRatio,
    renderedImageWidth,
    renderedImageHeight,
    isValid: true,
    compliance,
  };
}

function transformPointWithComposition(
  point: Point,
  composition: Pick<AutoCompositionResult, "scale" | "offsetX" | "offsetY">
): Point {
  return {
    x: composition.offsetX + point.x * composition.scale,
    y: composition.offsetY + point.y * composition.scale,
  };
}

function constrainLooseOffset(
  offset: number,
  renderedSize: number,
  canvasSize: number,
  overflowAllowance: number
): number {
  if (
    !Number.isFinite(offset) ||
    !Number.isFinite(renderedSize) ||
    !Number.isFinite(canvasSize)
  ) {
    return 0;
  }

  const minimumVisible = Math.min(
    canvasSize * 0.35,
    renderedSize * 0.35
  );
  const minimumOffset =
    minimumVisible - renderedSize - overflowAllowance;
  const maximumOffset =
    canvasSize - minimumVisible + overflowAllowance;

  return clamp(offset, minimumOffset, maximumOffset);
}

type ComplianceInput = {
  geometry: FaceGeometry;
  headHeightRatio: number;
  eyeLineRatio: number;
  topMarginRatio: number;
  faceCenterXRatio: number;
  rules: PassportLayoutRules;
  originalEyeAngleDegrees: number;
  appliedRotationDegrees: number;
};

function evaluateAutoCompositionCompliance(
  input: ComplianceInput
): AutoCompositionCompliance {
  const {
    geometry,
    headHeightRatio,
    eyeLineRatio,
    topMarginRatio,
    faceCenterXRatio,
    rules,
    originalEyeAngleDegrees,
    appliedRotationDegrees,
  } = input;

  const warnings: string[] = [];
  const headTooSmall = headHeightRatio < rules.minimumHeadHeightRatio;
  const headTooLarge = headHeightRatio > rules.maximumHeadHeightRatio;
  const headSizeOk = !headTooSmall && !headTooLarge;
  const faceCentered =
    Math.abs(faceCenterXRatio - rules.targetFaceCenterXRatio) <= 0.03;
  const eyesTooHigh = eyeLineRatio < rules.minimumEyeLineRatio;
  const eyesTooLow = eyeLineRatio > rules.maximumEyeLineRatio;
  const eyeLineOk = !eyesTooHigh && !eyesTooLow;

  // Geometry is calculated after safe rotation.
  const eyeRotationOk = isEyeRotationAcceptable(
    geometry,
    rules.maximumEyeRotation
  );
  const verticalTiltOk = isVerticalTiltAcceptable(
    geometry,
    rules.maximumVerticalTilt
  );
  const topMarginOk =
    topMarginRatio >= rules.minimumTopMarginRatio &&
    topMarginRatio <= rules.maximumTopMarginRatio;
  const geometryEyeLineOk = isEyeLineAcceptable(geometry, 0.3, 0.6);

  if (headTooSmall) warnings.push("Head size is too small.");
  if (headTooLarge) warnings.push("Head size is too large.");
  if (!faceCentered) warnings.push("Face is not horizontally centred.");
  if (eyesTooHigh) warnings.push("Eye line is too high.");
  if (eyesTooLow) warnings.push("Eye line is too low.");
  if (!verticalTiltOk) {
    warnings.push("Face vertical alignment is outside the preferred range.");
  }
  if (!topMarginOk) {
    warnings.push("Top head margin is outside the preferred range.");
  }
  if (!geometryEyeLineOk) {
    warnings.push("Eye position relative to forehead and chin is unusual.");
  }

  if (Math.abs(appliedRotationDegrees) >= AUTO_STRAIGHT_DEADBAND_DEGREES) {
    warnings.push(
      `Photo was auto-straightened by ${Math.abs(appliedRotationDegrees).toFixed(
        2
      )}°.`
    );
  }

  if (Math.abs(originalEyeAngleDegrees) > AUTO_STRAIGHT_HARD_LIMIT_DEGREES) {
    warnings.push(
      "Head tilt is too large for safe automatic straightening. Manual correction is recommended."
    );
  }

  const overallOk =
    headSizeOk &&
    faceCentered &&
    eyeLineOk &&
    eyeRotationOk &&
    verticalTiltOk &&
    topMarginOk &&
    geometryEyeLineOk;

  return {
    faceDetected: geometry.isValid,
    headSizeOk,
    headTooSmall,
    headTooLarge,
    faceCentered,
    eyeLineOk,
    eyesTooHigh,
    eyesTooLow,
    eyeRotationOk,
    verticalTiltOk,
    topMarginOk,
    overallOk,
    warnings,
  };
}

export function createInvalidAutoComposition(): AutoCompositionResult {
  return {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotationRadians: 0,
    rotationDegrees: 0,
    sourcePivotX: 0,
    sourcePivotY: 0,
    targetPivotX: 0,
    targetPivotY: 0,
    headHeightRatio: 0,
    eyeLineRatio: 0,
    topMarginRatio: 0,
    faceCenterXRatio: 0,
    renderedImageWidth: 0,
    renderedImageHeight: 0,
    isValid: false,
    compliance: {
      faceDetected: false,
      headSizeOk: false,
      headTooSmall: false,
      headTooLarge: false,
      faceCentered: false,
      eyeLineOk: false,
      eyesTooHigh: false,
      eyesTooLow: false,
      eyeRotationOk: false,
      verticalTiltOk: false,
      topMarginOk: false,
      overallOk: false,
      warnings: ["Valid face landmarks were not found."],
    },
  };
}

export function getRendererComposition(
  result: AutoCompositionResult
): {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotationRadians: number;
  sourcePivotX: number;
  sourcePivotY: number;
  targetPivotX: number;
  targetPivotY: number;
} {
  return {
    scale: result.scale,
    offsetX: result.offsetX,
    offsetY: result.offsetY,
    rotationRadians: result.rotationRadians,
    sourcePivotX: result.sourcePivotX,
    sourcePivotY: result.sourcePivotY,
    targetPivotX: result.targetPivotX,
    targetPivotY: result.targetPivotY,
  };
}

export function getAutoCompositionSummary(result: AutoCompositionResult) {
  return {
    valid: result.isValid,
    scale: roundNumber(result.scale),
    offsetX: roundNumber(result.offsetX),
    offsetY: roundNumber(result.offsetY),
    rotationDegrees: roundNumber(result.rotationDegrees),
    headHeightPercentage: roundNumber(result.headHeightRatio * 100),
    eyeLinePercentage: roundNumber(result.eyeLineRatio * 100),
    topMarginPercentage: roundNumber(result.topMarginRatio * 100),
    faceCenterPercentage: roundNumber(result.faceCenterXRatio * 100),
    overallOk: result.compliance.overallOk,
    warnings: result.compliance.warnings,
  };
}

function roundNumber(value: number, decimalPlaces = 2): number {
  const multiplier = 10 ** decimalPlaces;
  return Math.round(value * multiplier) / multiplier;
}

export function transformPointToCanvas(
  point: Point,
  composition: Pick<
    AutoCompositionResult,
    | "scale"
    | "offsetX"
    | "offsetY"
    | "rotationRadians"
    | "sourcePivotX"
    | "sourcePivotY"
    | "targetPivotX"
    | "targetPivotY"
  >
): Point {
  const pivot = {
    x: composition.sourcePivotX,
    y: composition.sourcePivotY,
  };
  const rotated = rotatePointAround(point, pivot, composition.rotationRadians);

  return {
    x: composition.offsetX + rotated.x * composition.scale,
    y: composition.offsetY + rotated.y * composition.scale,
  };
}
