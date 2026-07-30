import {
  calculateAutoComposition,
  createInvalidAutoComposition,
  type AutoCompositionResult,
  type PassportLayoutRules,
} from "./autoComposition";

import type {
  FaceLandmarks,
  Point,
} from "./faceGeometry";

import {
  getPassportLayoutFromSize,
  type PassportLayout,
} from "./passportLayout";

/**
 * Canvas-এ Professional Passport Photo render করার input।
 */
export type PassportRendererInput = {
  /**
   * যে canvas-এ output আঁকা হবে।
   */
  canvas: HTMLCanvasElement;

  /**
   * Original uploaded image।
   */
  image: HTMLImageElement;

  /**
   * Face landmarks।
   *
   * Pixel coordinate অথবা 0–1 normalized coordinate—
   * দুই ধরনের coordinate support করে।
   */
  face: FaceLandmarks;

  /**
   * সরাসরি PassportLayout পাঠানো যাবে।
   */
  layout?: PassportLayout;

  /**
   * অথবা পুরোনো size string পাঠানো যাবে:
   *
   * "35x45"
   * "india-passport"
   * "2x2"
   * "us-visa"
   */
  size?: string;

  /**
   * Output background colour।
   */
  backgroundColor?: string;

  /**
   * Transparent PNG output প্রয়োজন হলে true।
   */
  transparentBackground?: boolean;

  /**
   * Layout rule override।
   */
  rules?: Partial<PassportLayoutRules>;

  /**
   * Face landmarks অনুযায়ী auto composition ব্যবহার করবে।
   *
   * Default: true
   */
  autoCompose?: boolean;

  /**
   * Auto composition বন্ধ থাকলে manual composition।
   */
  manualComposition?: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };

  /**
   * Image smoothing quality।
   *
   * Default: "high"
   */
  smoothingQuality?: ImageSmoothingQuality;

  /**
   * Optional image adjustments।
   */
  adjustments?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
};

/**
 * Render শেষ হলে যে result return হবে।
 */
export type PassportRendererResult = {
  success: boolean;

  canvasWidth: number;
  canvasHeight: number;

  composition: AutoCompositionResult;

  layout: PassportLayout;

  error?: string;
};

const DEFAULT_BACKGROUND_COLOR = "#ffffff";

/**
 * Main Professional Passport Renderer।
 */
export function renderProfessionalPassport(
  input: PassportRendererInput
): PassportRendererResult {
  const {
    canvas,
    image,
    face,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
    transparentBackground = false,
    autoCompose = true,
    manualComposition,
    smoothingQuality = "high",
    adjustments,
  } = input;

  const layout =
    input.layout ??
    getPassportLayoutFromSize(
      input.size ?? "35x45"
    );

  if (!canvas) {
    return createRendererError(
      layout,
      "Canvas was not provided."
    );
  }

  if (!isImageReady(image)) {
    return createRendererError(
      layout,
      "The image is not fully loaded."
    );
  }

  const context = canvas.getContext("2d", {
    alpha: true,
  });

  if (!context) {
    return createRendererError(
      layout,
      "Canvas 2D context could not be created."
    );
  }

  const canvasWidth = layout.canvasWidth;
  const canvasHeight = layout.canvasHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  /**
   * Normalized landmark পাওয়া গেলে image pixel coordinate-এ convert।
   */
  const pixelFace = convertFaceToImagePixels(
    face,
    image.naturalWidth,
    image.naturalHeight
  );

  let composition: AutoCompositionResult;

  if (autoCompose) {
    composition = calculateAutoComposition({
      imageWidth: image.naturalWidth,
      imageHeight: image.naturalHeight,

      canvasWidth,
      canvasHeight,

      face: pixelFace,

      rules: {
        ...layout.rules,
        ...input.rules,
      },
    });
  } else {
    composition = createManualComposition({
      image,
      canvasWidth,
      canvasHeight,
      face: pixelFace,
      manualComposition,
    });
  }

  /**
   * Auto composition invalid হলে safe cover fallback।
   */
  if (!composition.isValid) {
    composition = createCoverFallbackComposition({
      image,
      canvasWidth,
      canvasHeight,
    });
  }

  context.save();

  try {
    resetCanvasContext(context);

    drawBackground({
      context,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      transparentBackground,
    });

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality =
      smoothingQuality;

    applyImageAdjustments(
      context,
      adjustments
    );

    drawComposedImage({
      context,
      image,
      composition,
    });

    /**
     * Filter যেন পরবর্তী drawing-এ থেকে না যায়।
     */
    context.filter = "none";

    return {
      success: true,

      canvasWidth,
      canvasHeight,

      composition,
      layout,
    };
  } catch (error) {
    return {
      success: false,

      canvasWidth,
      canvasHeight,

      composition,
      layout,

      error:
        error instanceof Error
          ? error.message
          : "Passport rendering failed.",
    };
  } finally {
    context.restore();
  }
}

/**
 * ভবিষ্যতে পুরোনো নাম থেকে import করা সহজ রাখার জন্য alias।
 *
 * নতুন Engine connect করার সময় ব্যবহার করা যাবে:
 *
 * import { renderPassport } from
 * "@/lib/vision/professional/passportRenderer";
 */
export const renderPassport =
  renderProfessionalPassport;

/**
 * শুধু preview-এর জন্য ছোট canvas-এ render।
 *
 * এটি layout-এর original aspect ratio বজায় রাখে।
 */
export function renderPassportPreview(input: {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  face: FaceLandmarks;

  layout?: PassportLayout;
  size?: string;

  previewWidth?: number;
  previewHeight?: number;

  backgroundColor?: string;
  transparentBackground?: boolean;

  rules?: Partial<PassportLayoutRules>;

  adjustments?: PassportRendererInput["adjustments"];
}): PassportRendererResult {
  const layout =
    input.layout ??
    getPassportLayoutFromSize(
      input.size ?? "35x45"
    );

  const previewWidth =
    input.previewWidth ?? 210;

  const previewHeight =
    input.previewHeight ?? 270;

  const previewLayout =
    createPreviewLayout(
      layout,
      previewWidth,
      previewHeight
    );

  return renderProfessionalPassport({
    canvas: input.canvas,
    image: input.image,
    face: input.face,

    layout: previewLayout,

    backgroundColor:
      input.backgroundColor,

    transparentBackground:
      input.transparentBackground,

    rules: input.rules,

    adjustments:
      input.adjustments,

    autoCompose: true,
  });
}

/**
 * Canvas output-কে Blob হিসেবে return করে।
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/jpeg" | "image/png" | "image/webp" =
    "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Canvas could not be converted to a file."
            )
          );

          return;
        }

        resolve(blob);
      },
      mimeType,
      clamp(quality, 0, 1)
    );
  });
}

/**
 * Canvas output Data URL হিসেবে return করে।
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: "image/jpeg" | "image/png" | "image/webp" =
    "image/jpeg",
  quality = 0.95
): string {
  return canvas.toDataURL(
    mimeType,
    clamp(quality, 0, 1)
  );
}

/**
 * Image load সম্পূর্ণ হয়েছে কি না।
 */
function isImageReady(
  image: HTMLImageElement | null | undefined
): image is HTMLImageElement {
  return Boolean(
    image &&
      image.complete &&
      image.naturalWidth > 0 &&
      image.naturalHeight > 0
  );
}

/**
 * Landmark normalized নাকি pixel—
 * তা detect করে pixel coordinate-এ convert করে।
 */
function convertFaceToImagePixels(
  face: FaceLandmarks,
  imageWidth: number,
  imageHeight: number
): FaceLandmarks {
  const points: Point[] = [
    face.forehead,
    face.chin,
    face.leftEye,
    face.rightEye,
  ];

  const isNormalised =
    points.every(
      (point) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        point.x >= 0 &&
        point.x <= 1.5 &&
        point.y >= 0 &&
        point.y <= 1.5
    );

  if (!isNormalised) {
    return {
      forehead: { ...face.forehead },
      chin: { ...face.chin },
      leftEye: { ...face.leftEye },
      rightEye: { ...face.rightEye },
    };
  }

  return {
    forehead: {
      x: face.forehead.x * imageWidth,
      y: face.forehead.y * imageHeight,
    },

    chin: {
      x: face.chin.x * imageWidth,
      y: face.chin.y * imageHeight,
    },

    leftEye: {
      x: face.leftEye.x * imageWidth,
      y: face.leftEye.y * imageHeight,
    },

    rightEye: {
      x: face.rightEye.x * imageWidth,
      y: face.rightEye.y * imageHeight,
    },
  };
}

/**
 * Background render।
 */
function drawBackground(input: {
  context: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  transparentBackground: boolean;
}): void {
  const {
    context,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    transparentBackground,
  } = input;

  context.clearRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );

  if (transparentBackground) {
    return;
  }

  context.fillStyle =
    normaliseBackgroundColor(
      backgroundColor
    );

  context.fillRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );
}

/**
 * Brightness, contrast ও saturation filter।
 *
 * প্রতিটি value-এর default 100।
 */
function applyImageAdjustments(
  context: CanvasRenderingContext2D,
  adjustments?: PassportRendererInput["adjustments"]
): void {
  const brightness = clamp(
    adjustments?.brightness ?? 100,
    0,
    200
  );

  const contrast = clamp(
    adjustments?.contrast ?? 100,
    0,
    200
  );

  const saturation = clamp(
    adjustments?.saturation ?? 100,
    0,
    200
  );

  context.filter = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`,
  ].join(" ");
}

/**
 * Auto composition না ব্যবহার করলে manual result।
 */
function createManualComposition(input: {
  image: HTMLImageElement;
  canvasWidth: number;
  canvasHeight: number;
  face: FaceLandmarks;

  manualComposition?:
    PassportRendererInput["manualComposition"];
}): AutoCompositionResult {
  const {
    image,
    canvasWidth,
    canvasHeight,
    manualComposition,
  } = input;

  if (!manualComposition) {
    return createCoverFallbackComposition({
      image,
      canvasWidth,
      canvasHeight,
    });
  }

  const scale =
    Number.isFinite(
      manualComposition.scale
    ) &&
    manualComposition.scale > 0
      ? manualComposition.scale
      : 1;

  const offsetX =
    Number.isFinite(
      manualComposition.offsetX
    )
      ? manualComposition.offsetX
      : 0;

  const offsetY =
    Number.isFinite(
      manualComposition.offsetY
    )
      ? manualComposition.offsetY
      : 0;

  return {
    scale,
    offsetX,
    offsetY,

    rotationRadians: 0,
    rotationDegrees: 0,

    sourcePivotX: 0,
    sourcePivotY: 0,
    targetPivotX: offsetX,
    targetPivotY: offsetY,

    headHeightRatio: 0,
    eyeLineRatio: 0,
    topMarginRatio: 0,
    faceCenterXRatio: 0,

    renderedImageWidth:
      image.naturalWidth * scale,

    renderedImageHeight:
      image.naturalHeight * scale,

    isValid: true,

    compliance: {
      faceDetected: true,

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

      warnings: [
        "Manual composition is active.",
      ],
    },
  };
}

/**
 * Face landmark invalid হলেও image যেন canvas cover করে।
 */
function createCoverFallbackComposition(input: {
  image: HTMLImageElement;
  canvasWidth: number;
  canvasHeight: number;
}): AutoCompositionResult {
  const {
    image,
    canvasWidth,
    canvasHeight,
  } = input;

  if (!isImageReady(image)) {
    return createInvalidAutoComposition();
  }

  const scaleX =
    canvasWidth / image.naturalWidth;

  const scaleY =
    canvasHeight / image.naturalHeight;

  const scale = Math.max(
    scaleX,
    scaleY
  );

  const renderedImageWidth =
    image.naturalWidth * scale;

  const renderedImageHeight =
    image.naturalHeight * scale;

  const offsetX =
    (canvasWidth -
      renderedImageWidth) /
    2;

  const offsetY =
    (canvasHeight -
      renderedImageHeight) /
    2;

  return {
    scale,
    offsetX,
    offsetY,

    rotationRadians: 0,
    rotationDegrees: 0,

    sourcePivotX: 0,
    sourcePivotY: 0,
    targetPivotX: offsetX,
    targetPivotY: offsetY,

    headHeightRatio: 0,
    eyeLineRatio: 0,
    topMarginRatio: 0,
    faceCenterXRatio: 0.5,

    renderedImageWidth,
    renderedImageHeight,

    isValid: true,

    compliance: {
      faceDetected: false,

      headSizeOk: false,
      headTooSmall: false,
      headTooLarge: false,

      faceCentered: true,

      eyeLineOk: false,
      eyesTooHigh: false,
      eyesTooLow: false,

      eyeRotationOk: false,
      verticalTiltOk: false,

      topMarginOk: false,

      overallOk: false,

      warnings: [
        "Face landmarks were invalid. Centre-cover fallback was used.",
      ],
    },
  };
}

/**
 * Preview-এর জন্য original layout clone করে
 * ছোট canvas dimension তৈরি করে।
 */
function createPreviewLayout(
  layout: PassportLayout,
  maximumWidth: number,
  maximumHeight: number
): PassportLayout {
  const safeMaximumWidth = Math.max(
    1,
    maximumWidth
  );

  const safeMaximumHeight = Math.max(
    1,
    maximumHeight
  );

  const widthScale =
    safeMaximumWidth /
    layout.canvasWidth;

  const heightScale =
    safeMaximumHeight /
    layout.canvasHeight;

  const previewScale = Math.min(
    widthScale,
    heightScale
  );

  return {
    ...layout,

    canvasWidth: Math.max(
      1,
      Math.round(
        layout.canvasWidth *
          previewScale
      )
    ),

    canvasHeight: Math.max(
      1,
      Math.round(
        layout.canvasHeight *
          previewScale
      )
    ),

    rules: {
      ...layout.rules,
    },

    background: {
      ...layout.background,
      acceptedColors: [
        ...layout.background.acceptedColors,
      ],
    },

    notes: [...layout.notes],
  };
}

/**
 * Auto-straight সহ final image draw।
 * Rotation source face pivot-এর চারপাশে হয়, তাই framing নড়ে যায় না।
 */
function drawComposedImage(input: {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  composition: AutoCompositionResult;
}): void {
  const { context, image, composition } = input;

  const rotation = Number.isFinite(composition.rotationRadians)
    ? composition.rotationRadians
    : 0;

  if (Math.abs(rotation) < 0.000001) {
    context.drawImage(
      image,
      composition.offsetX,
      composition.offsetY,
      image.naturalWidth * composition.scale,
      image.naturalHeight * composition.scale
    );
    return;
  }

  context.save();
  context.translate(
    composition.targetPivotX,
    composition.targetPivotY
  );
  context.rotate(rotation);
  context.scale(composition.scale, composition.scale);
  context.drawImage(
    image,
    -composition.sourcePivotX,
    -composition.sourcePivotY
  );
  context.restore();
}

/**
 * Canvas context-এর আগের transform/filter reset।
 */
function resetCanvasContext(
  context: CanvasRenderingContext2D
): void {
  context.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
  );

  context.globalAlpha = 1;
  context.globalCompositeOperation =
    "source-over";

  context.filter = "none";
}

/**
 * Invalid colour হলে white fallback।
 */
function normaliseBackgroundColor(
  colour: string
): string {
  const trimmedColour =
    colour.trim();

  if (!trimmedColour) {
    return DEFAULT_BACKGROUND_COLOR;
  }

  return trimmedColour;
}

function createRendererError(
  layout: PassportLayout,
  error: string
): PassportRendererResult {
  return {
    success: false,

    canvasWidth:
      layout.canvasWidth,

    canvasHeight:
      layout.canvasHeight,

    composition:
      createInvalidAutoComposition(),

    layout,

    error,
  };
}

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}