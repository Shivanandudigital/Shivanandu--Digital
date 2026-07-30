// lib/vision/faceGeometry.ts

export type Point = {
  x: number;
  y: number;
};

export type FaceLandmarks = {
  forehead: Point;
  chin: Point;
  leftEye: Point;
  rightEye: Point;
};

export type FaceGeometry = {
  /**
   * Forehead থেকে Chin পর্যন্ত দূরত্ব।
   * Landmark যে coordinate system ব্যবহার করছে,
   * ফলাফলও সেই একই unit-এ হবে।
   */
  headHeight: number;

  /**
   * Eye distance-এর ভিত্তিতে আনুমানিক মাথার প্রস্থ।
   */
  headWidth: number;

  /**
   * Forehead এবং Chin-এর মধ্যবর্তী কেন্দ্র।
   */
  faceCenterX: number;
  faceCenterY: number;

  /**
   * দুই চোখের মধ্যবর্তী কেন্দ্র।
   */
  eyeCenterX: number;
  eyeCenterY: number;

  /**
   * বাম ও ডান চোখের সরাসরি দূরত্ব।
   */
  eyeDistance: number;

  /**
   * চোখের line কত degree বাঁকা।
   * Positive হলে ডান চোখ নিচের দিকে।
   * Negative হলে ডান চোখ উপরের দিকে।
   */
  rotation: number;

  /**
   * Eye line, forehead থেকে chin-এর কত অংশ নিচে আছে।
   *
   * উদাহরণ:
   * 0.40 অর্থ eye line মাথার উচ্চতার 40% নিচে।
   */
  eyeLineRatio: number;

  /**
   * Face vertical axis কত degree বাঁকা।
   * 0 মানে forehead ও chin vertically aligned।
   */
  verticalTilt: number;

  /**
   * Landmark data ব্যবহারযোগ্য কি না।
   */
  isValid: boolean;
};

const EPSILON = 0.000001;

/**
 * একটি number finite এবং ব্যবহারযোগ্য কি না পরীক্ষা করে।
 */
function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

/**
 * Point-এর x এবং y valid number কি না পরীক্ষা করে।
 */
function isValidPoint(point: Point | null | undefined): point is Point {
  return Boolean(
    point &&
      isFiniteNumber(point.x) &&
      isFiniteNumber(point.y)
  );
}

/**
 * দুটি point-এর মাঝের Euclidean distance।
 */
export function getDistance(pointA: Point, pointB: Point): number {
  const deltaX = pointB.x - pointA.x;
  const deltaY = pointB.y - pointA.y;

  return Math.hypot(deltaX, deltaY);
}

/**
 * দুটি point-এর মাঝের কেন্দ্র।
 */
export function getMidpoint(pointA: Point, pointB: Point): Point {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
  };
}

/**
 * একটি point-কে A থেকে B axis-এর ওপর projection করে।
 *
 * এটি eye line forehead থেকে chin পর্যন্ত আসলে কতটা নিচে,
 * তা rotation-independentভাবে হিসাব করতে সাহায্য করে।
 */
function getProjectionRatio(
  point: Point,
  axisStart: Point,
  axisEnd: Point
): number {
  const axisX = axisEnd.x - axisStart.x;
  const axisY = axisEnd.y - axisStart.y;

  const axisLengthSquared = axisX * axisX + axisY * axisY;

  if (axisLengthSquared <= EPSILON) {
    return 0;
  }

  const pointX = point.x - axisStart.x;
  const pointY = point.y - axisStart.y;

  return (pointX * axisX + pointY * axisY) / axisLengthSquared;
}

/**
 * Value-কে নির্দিষ্ট range-এর মধ্যে রাখে।
 */
function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Face landmarks থেকে প্রয়োজনীয় geometry হিসাব করে।
 */
export function calculateFaceGeometry(
  face: FaceLandmarks
): FaceGeometry {
  const pointsAreValid =
    isValidPoint(face?.forehead) &&
    isValidPoint(face?.chin) &&
    isValidPoint(face?.leftEye) &&
    isValidPoint(face?.rightEye);

  if (!pointsAreValid) {
    return createInvalidFaceGeometry();
  }

  const { forehead, chin, leftEye, rightEye } = face;

  const headHeight = getDistance(forehead, chin);
  const eyeDistance = getDistance(leftEye, rightEye);

  if (headHeight <= EPSILON || eyeDistance <= EPSILON) {
    return createInvalidFaceGeometry();
  }

  const faceCenter = getMidpoint(forehead, chin);
  const eyeCenter = getMidpoint(leftEye, rightEye);

  /*
   * সাধারণত দুই চোখের pupil distance মাথার মোট width-এর
   * আনুমানিক 42%–48% হয়ে থাকে।
   *
   * 0.45 ব্যবহার করলে:
   * headWidth ≈ eyeDistance / 0.45
   */
  const estimatedHeadWidth = eyeDistance / 0.45;

  /*
   * Canvas coordinate system-এ নিচের দিকে y বাড়ে।
   * তাই positive angle মানে rightEye নিচে।
   */
  const eyeDeltaX = rightEye.x - leftEye.x;
  const eyeDeltaY = rightEye.y - leftEye.y;

  const rotationRadians = Math.atan2(eyeDeltaY, eyeDeltaX);
  const rotation = rotationRadians * (180 / Math.PI);

  /*
   * Forehead থেকে Chin vertical axis-এর angle।
   *
   * একদম vertical নিচের দিকে হলে atan2(dx, dy) = 0।
   */
  const faceDeltaX = chin.x - forehead.x;
  const faceDeltaY = chin.y - forehead.y;

  const verticalTiltRadians = Math.atan2(faceDeltaX, faceDeltaY);
  const verticalTilt = verticalTiltRadians * (180 / Math.PI);

  /*
   * Eye center-কে forehead→chin axis-এর ওপর project করা হচ্ছে।
   *
   * 0   = forehead
   * 1   = chin
   */
  const rawEyeLineRatio = getProjectionRatio(
    eyeCenter,
    forehead,
    chin
  );

  const eyeLineRatio = clamp(rawEyeLineRatio, 0, 1);

  const isValid =
    Number.isFinite(headHeight) &&
    Number.isFinite(estimatedHeadWidth) &&
    Number.isFinite(eyeDistance) &&
    Number.isFinite(rotation) &&
    Number.isFinite(verticalTilt) &&
    Number.isFinite(eyeLineRatio) &&
    headHeight > EPSILON &&
    eyeDistance > EPSILON;

  return {
    headHeight,
    headWidth: estimatedHeadWidth,

    faceCenterX: faceCenter.x,
    faceCenterY: faceCenter.y,

    eyeCenterX: eyeCenter.x,
    eyeCenterY: eyeCenter.y,

    eyeDistance,

    rotation,
    eyeLineRatio,
    verticalTilt,

    isValid,
  };
}

/**
 * Invalid landmark data পাওয়া গেলে safe fallback।
 */
export function createInvalidFaceGeometry(): FaceGeometry {
  return {
    headHeight: 0,
    headWidth: 0,

    faceCenterX: 0,
    faceCenterY: 0,

    eyeCenterX: 0,
    eyeCenterY: 0,

    eyeDistance: 0,

    rotation: 0,
    eyeLineRatio: 0,
    verticalTilt: 0,

    isValid: false,
  };
}

/**
 * Face horizontally কতটা ঘোরানো হয়েছে তা পরীক্ষা করে।
 */
export function isEyeRotationAcceptable(
  geometry: FaceGeometry,
  maximumRotation = 5
): boolean {
  if (!geometry.isValid) {
    return false;
  }

  return Math.abs(geometry.rotation) <= maximumRotation;
}

/**
 * Forehead এবং chin vertical alignment ঠিক আছে কি না পরীক্ষা করে।
 */
export function isVerticalTiltAcceptable(
  geometry: FaceGeometry,
  maximumTilt = 6
): boolean {
  if (!geometry.isValid) {
    return false;
  }

  return Math.abs(geometry.verticalTilt) <= maximumTilt;
}

/**
 * Eye line মাথার গ্রহণযোগ্য vertical অংশে আছে কি না পরীক্ষা করে।
 *
 * Default range:
 * forehead থেকে 35%–55% নিচে।
 */
export function isEyeLineAcceptable(
  geometry: FaceGeometry,
  minimumRatio = 0.35,
  maximumRatio = 0.55
): boolean {
  if (!geometry.isValid) {
    return false;
  }

  return (
    geometry.eyeLineRatio >= minimumRatio &&
    geometry.eyeLineRatio <= maximumRatio
  );
}

/**
 * Debugging বা Compliance Panel-এর জন্য summary তৈরি করে।
 */
export function getFaceGeometrySummary(
  geometry: FaceGeometry
): {
  valid: boolean;
  headHeight: number;
  headWidth: number;
  eyeDistance: number;
  eyeLinePercentage: number;
  eyeRotation: number;
  verticalTilt: number;
} {
  return {
    valid: geometry.isValid,
    headHeight: roundNumber(geometry.headHeight),
    headWidth: roundNumber(geometry.headWidth),
    eyeDistance: roundNumber(geometry.eyeDistance),
    eyeLinePercentage: roundNumber(geometry.eyeLineRatio * 100),
    eyeRotation: roundNumber(geometry.rotation),
    verticalTilt: roundNumber(geometry.verticalTilt),
  };
}

function roundNumber(value: number, decimalPlaces = 2): number {
  const multiplier = 10 ** decimalPlaces;

  return Math.round(value * multiplier) / multiplier;
}