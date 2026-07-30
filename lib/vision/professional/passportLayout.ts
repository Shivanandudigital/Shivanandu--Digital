// lib/vision/passportLayout.ts

import type { PassportLayoutRules } from "./autoComposition";

/**
 * Shivanandu Digital Passport Engine
 *
 * এই ফাইলে শুধু passport/document size এবং composition rules থাকবে।
 * এখানে কোনো face detection বা canvas drawing হবে না।
 */

export type PassportSizeKey =
  | "india-passport"
  | "us-visa"
  | "india-pan"
  | "india-aadhaar"
  | "schengen-visa"
  | "custom";

export type PassportUnit = "mm" | "inch" | "px";

export type PassportLayout = {
  /**
   * Internal unique key।
   */
  key: PassportSizeKey;

  /**
   * UI-তে দেখানোর নাম।
   */
  name: string;

  /**
   * Country বা document category।
   */
  country: string;

  /**
   * Physical photo width।
   */
  width: number;

  /**
   * Physical photo height।
   */
  height: number;

  /**
   * Width এবং height-এর unit।
   */
  unit: PassportUnit;

  /**
   * Export resolution।
   */
  dpi: number;

  /**
   * Canvas width in pixels।
   */
  canvasWidth: number;

  /**
   * Canvas height in pixels।
   */
  canvasHeight: number;

  /**
   * Auto-composition rules।
   */
  rules: PassportLayoutRules;

  /**
   * Background-related recommendation।
   */
  background: {
    preferredColor: string;
    acceptedColors: string[];
    transparentAllowed: boolean;
  };

  /**
   * UI বা compliance panel-এর জন্য তথ্য।
   */
  notes: string[];
};

export type CustomPassportLayoutInput = {
  name?: string;

  width: number;
  height: number;

  unit?: PassportUnit;
  dpi?: number;

  rules?: Partial<PassportLayoutRules>;

  preferredBackgroundColor?: string;
};

/**
 * Generic professional 35×45 composition।
 *
 * Forehead থেকে chin পর্যন্ত head height:
 * final canvas height-এর প্রায় 68%।
 */
export const INDIA_PASSPORT_LAYOUT: PassportLayout = {
  key: "india-passport",

  name: "India Passport Photo",
  country: "India",

  width: 35,
  height: 45,
  unit: "mm",

  dpi: 300,

  canvasWidth: 413,
  canvasHeight: 531,

  rules: {
    targetHeadHeightRatio: 0.68,

    minimumHeadHeightRatio: 0.62,
    maximumHeadHeightRatio: 0.74,

    targetEyeLineRatio: 0.43,

    minimumEyeLineRatio: 0.38,
    maximumEyeLineRatio: 0.48,

    targetFaceCenterXRatio: 0.5,

    minimumTopMarginRatio: 0.05,
    maximumTopMarginRatio: 0.12,

    minimumSideMarginRatio: 0.04,

    maximumEyeRotation: 5,
    maximumVerticalTilt: 6,

    minimumScale: 0.05,
    maximumScale: 20,
  },

  background: {
    preferredColor: "#ffffff",
    acceptedColors: ["#ffffff"],
    transparentAllowed: false,
  },

  notes: [
    "Face should remain horizontally centred.",
    "Keep natural shoulders visible.",
    "Use a plain, light-coloured background.",
    "Avoid strong shadows on the face and background.",
  ],
};

/**
 * US Visa / US Passport style 2×2 inch।
 */
export const US_VISA_LAYOUT: PassportLayout = {
  key: "us-visa",

  name: "US Visa / Passport Photo",
  country: "United States",

  width: 2,
  height: 2,
  unit: "inch",

  dpi: 300,

  canvasWidth: 600,
  canvasHeight: 600,

  rules: {
    targetHeadHeightRatio: 0.62,

    minimumHeadHeightRatio: 0.5,
    maximumHeadHeightRatio: 0.69,

    targetEyeLineRatio: 0.44,

    minimumEyeLineRatio: 0.38,
    maximumEyeLineRatio: 0.5,

    targetFaceCenterXRatio: 0.5,

    minimumTopMarginRatio: 0.05,
    maximumTopMarginRatio: 0.15,

    minimumSideMarginRatio: 0.05,

    maximumEyeRotation: 5,
    maximumVerticalTilt: 6,

    minimumScale: 0.05,
    maximumScale: 20,
  },

  background: {
    preferredColor: "#ffffff",
    acceptedColors: ["#ffffff", "#f8f8f8"],
    transparentAllowed: false,
  },

  notes: [
    "The final image must be square.",
    "The complete head must remain visible.",
    "Use a plain white or off-white background.",
    "Keep the subject facing directly towards the camera.",
  ],
};

/**
 * PAN-card style compact photo।
 *
 * এটি practical studio composition preset।
 */
export const INDIA_PAN_LAYOUT: PassportLayout = {
  key: "india-pan",

  name: "India PAN Card Photo",
  country: "India",

  width: 25,
  height: 35,
  unit: "mm",

  dpi: 300,

  canvasWidth: 295,
  canvasHeight: 413,

  rules: {
    targetHeadHeightRatio: 0.66,

    minimumHeadHeightRatio: 0.58,
    maximumHeadHeightRatio: 0.73,

    targetEyeLineRatio: 0.43,

    minimumEyeLineRatio: 0.37,
    maximumEyeLineRatio: 0.49,

    targetFaceCenterXRatio: 0.5,

    minimumTopMarginRatio: 0.05,
    maximumTopMarginRatio: 0.13,

    minimumSideMarginRatio: 0.04,

    maximumEyeRotation: 5,
    maximumVerticalTilt: 6,

    minimumScale: 0.05,
    maximumScale: 20,
  },

  background: {
    preferredColor: "#ffffff",
    acceptedColors: ["#ffffff"],
    transparentAllowed: false,
  },

  notes: [
    "Keep the full face clearly visible.",
    "Use a clean white background.",
    "Avoid cropping the chin or top of the head.",
  ],
};

/**
 * Aadhaar / general Indian ID style compact photo।
 */
export const INDIA_AADHAAR_LAYOUT: PassportLayout = {
  key: "india-aadhaar",

  name: "India Aadhaar Photo",
  country: "India",

  width: 35,
  height: 45,
  unit: "mm",

  dpi: 300,

  canvasWidth: 413,
  canvasHeight: 531,

  rules: {
    targetHeadHeightRatio: 0.66,

    minimumHeadHeightRatio: 0.58,
    maximumHeadHeightRatio: 0.73,

    targetEyeLineRatio: 0.43,

    minimumEyeLineRatio: 0.37,
    maximumEyeLineRatio: 0.49,

    targetFaceCenterXRatio: 0.5,

    minimumTopMarginRatio: 0.05,
    maximumTopMarginRatio: 0.13,

    minimumSideMarginRatio: 0.04,

    maximumEyeRotation: 5,
    maximumVerticalTilt: 6,

    minimumScale: 0.05,
    maximumScale: 20,
  },

  background: {
    preferredColor: "#ffffff",
    acceptedColors: ["#ffffff", "#f7f7f7"],
    transparentAllowed: false,
  },

  notes: [
    "Keep a neutral facial expression.",
    "Face should be clearly visible and centred.",
    "Avoid harsh lighting or deep shadows.",
  ],
};

/**
 * Schengen Visa 35×45 mm preset।
 */
export const SCHENGEN_VISA_LAYOUT: PassportLayout = {
  key: "schengen-visa",

  name: "Schengen Visa Photo",
  country: "Schengen Area",

  width: 35,
  height: 45,
  unit: "mm",

  dpi: 300,

  canvasWidth: 413,
  canvasHeight: 531,

  rules: {
    targetHeadHeightRatio: 0.72,

    minimumHeadHeightRatio: 0.7,
    maximumHeadHeightRatio: 0.8,

    targetEyeLineRatio: 0.44,

    minimumEyeLineRatio: 0.39,
    maximumEyeLineRatio: 0.5,

    targetFaceCenterXRatio: 0.5,

    minimumTopMarginRatio: 0.03,
    maximumTopMarginRatio: 0.1,

    minimumSideMarginRatio: 0.04,

    maximumEyeRotation: 5,
    maximumVerticalTilt: 6,

    minimumScale: 0.05,
    maximumScale: 20,
  },

  background: {
    preferredColor: "#f5f5f5",
    acceptedColors: [
      "#ffffff",
      "#f5f5f5",
      "#eeeeee",
      "#e8e8e8",
    ],
    transparentAllowed: false,
  },

  notes: [
    "The head should occupy approximately 70% to 80% of the photo height.",
    "Use a plain light background.",
    "The subject must face the camera directly.",
    "Keep both sides of the face clearly visible.",
  ],
};

/**
 * সব available preset।
 */
export const PASSPORT_LAYOUTS: Record<
  Exclude<PassportSizeKey, "custom">,
  PassportLayout
> = {
  "india-passport": INDIA_PASSPORT_LAYOUT,
  "us-visa": US_VISA_LAYOUT,
  "india-pan": INDIA_PAN_LAYOUT,
  "india-aadhaar": INDIA_AADHAAR_LAYOUT,
  "schengen-visa": SCHENGEN_VISA_LAYOUT,
};

/**
 * String key থেকে passport layout পাওয়া।
 *
 * Unknown value হলে India Passport fallback হবে।
 */
export function getPassportLayout(
  key: string
): PassportLayout {
  if (isPassportLayoutKey(key) && key !== "custom") {
    return PASSPORT_LAYOUTS[key];
  }

  return INDIA_PASSPORT_LAYOUT;
}

/**
 * UI-এর পুরোনো size names support করার জন্য।
 *
 * আপনার বর্তমান SizeSelector যদি এই ধরনের value দেয়:
 *
 * "35x45"
 * "india-passport"
 * "2x2"
 * "us-visa"
 *
 * তাহলে এই function সঠিক preset return করবে।
 */
export function getPassportLayoutFromSize(
  size: string
): PassportLayout {
  const normalisedSize = size
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "x");

  const aliases: Record<string, PassportSizeKey> = {
    "35x45": "india-passport",
    "35x45mm": "india-passport",
    "india": "india-passport",
    "indiapassport": "india-passport",
    "india-passport": "india-passport",

    "2x2": "us-visa",
    "2x2inch": "us-visa",
    "2x2in": "us-visa",
    "us": "us-visa",
    "usvisa": "us-visa",
    "us-visa": "us-visa",
    "uspassport": "us-visa",

    "25x35": "india-pan",
    "25x35mm": "india-pan",
    "pan": "india-pan",
    "pancard": "india-pan",
    "india-pan": "india-pan",

    "aadhaar": "india-aadhaar",
    "aadhar": "india-aadhaar",
    "india-aadhaar": "india-aadhaar",

    "schengen": "schengen-visa",
    "schengenvisa": "schengen-visa",
    "schengen-visa": "schengen-visa",
  };

  const matchedKey =
    aliases[normalisedSize];

  if (!matchedKey || matchedKey === "custom") {
    return INDIA_PASSPORT_LAYOUT;
  }

  return PASSPORT_LAYOUTS[matchedKey];
}

/**
 * Custom photo size তৈরি করে।
 */
export function createCustomPassportLayout(
  input: CustomPassportLayoutInput
): PassportLayout {
  const unit = input.unit ?? "mm";
  const dpi = input.dpi ?? 300;

  if (
    !Number.isFinite(input.width) ||
    !Number.isFinite(input.height) ||
    input.width <= 0 ||
    input.height <= 0
  ) {
    throw new Error(
      "Custom passport width and height must be positive numbers."
    );
  }

  if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new Error(
      "Custom passport DPI must be a positive number."
    );
  }

  const canvasWidth = convertLengthToPixels(
    input.width,
    unit,
    dpi
  );

  const canvasHeight = convertLengthToPixels(
    input.height,
    unit,
    dpi
  );

  return {
    key: "custom",

    name:
      input.name?.trim() ||
      `Custom ${input.width}×${input.height} ${unit}`,

    country: "Custom",

    width: input.width,
    height: input.height,
    unit,

    dpi,

    canvasWidth,
    canvasHeight,

    rules: {
      ...INDIA_PASSPORT_LAYOUT.rules,
      ...input.rules,
    },

    background: {
      preferredColor:
        input.preferredBackgroundColor ??
        "#ffffff",

      acceptedColors: [
        input.preferredBackgroundColor ??
          "#ffffff",
      ],

      transparentAllowed: true,
    },

    notes: [
      "This is a custom photo layout.",
      "Confirm the exact document requirements before final export.",
    ],
  };
}

/**
 * Physical unit থেকে pixels-এ convert করে।
 */
export function convertLengthToPixels(
  value: number,
  unit: PassportUnit,
  dpi = 300
): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  if (!Number.isFinite(dpi) || dpi <= 0) {
    return 0;
  }

  switch (unit) {
    case "inch":
      return Math.round(value * dpi);

    case "mm":
      return Math.round(
        (value / 25.4) * dpi
      );

    case "px":
      return Math.round(value);

    default:
      return 0;
  }
}

/**
 * Canvas pixels থেকে physical measurement বের করে।
 */
export function convertPixelsToLength(
  pixels: number,
  unit: PassportUnit,
  dpi = 300
): number {
  if (!Number.isFinite(pixels) || pixels <= 0) {
    return 0;
  }

  if (!Number.isFinite(dpi) || dpi <= 0) {
    return 0;
  }

  switch (unit) {
    case "inch":
      return pixels / dpi;

    case "mm":
      return (pixels / dpi) * 25.4;

    case "px":
      return pixels;

    default:
      return 0;
  }
}

/**
 * Key valid passport layout key কি না।
 */
export function isPassportLayoutKey(
  value: string
): value is PassportSizeKey {
  return [
    "india-passport",
    "us-visa",
    "india-pan",
    "india-aadhaar",
    "schengen-visa",
    "custom",
  ].includes(value);
}

/**
 * UI dropdown-এর জন্য option list।
 */
export function getPassportLayoutOptions(): Array<{
  value: PassportSizeKey;
  label: string;
  width: number;
  height: number;
  unit: PassportUnit;
}> {
  return Object.values(PASSPORT_LAYOUTS).map(
    (layout) => ({
      value: layout.key,
      label: layout.name,
      width: layout.width,
      height: layout.height,
      unit: layout.unit,
    })
  );
}

/**
 * Layout-এর aspect ratio।
 */
export function getPassportAspectRatio(
  layout: PassportLayout
): number {
  if (
    layout.canvasWidth <= 0 ||
    layout.canvasHeight <= 0
  ) {
    return 1;
  }

  return (
    layout.canvasWidth /
    layout.canvasHeight
  );
}

/**
 * Export canvas dimensions।
 */
export function getPassportCanvasSize(
  layout: PassportLayout
): {
  width: number;
  height: number;
} {
  return {
    width: layout.canvasWidth,
    height: layout.canvasHeight,
  };
}

/**
 * Preview-এর জন্য ছোট canvas size।
 *
 * Original aspect ratio ঠিক থাকবে।
 */
export function getPassportPreviewSize(
  layout: PassportLayout,
  maximumWidth = 240,
  maximumHeight = 300
): {
  width: number;
  height: number;
} {
  const widthScale =
    maximumWidth / layout.canvasWidth;

  const heightScale =
    maximumHeight / layout.canvasHeight;

  const scale = Math.min(
    widthScale,
    heightScale,
    1
  );

  return {
    width: Math.max(
      1,
      Math.round(
        layout.canvasWidth * scale
      )
    ),

    height: Math.max(
      1,
      Math.round(
        layout.canvasHeight * scale
      )
    ),
  };
}

/**
 * Background colour accepted list-এর মধ্যে আছে কি না।
 */
export function isBackgroundColorAccepted(
  layout: PassportLayout,
  color: string
): boolean {
  const normalisedColor =
    normaliseHexColor(color);

  return layout.background.acceptedColors.some(
    (acceptedColor) =>
      normaliseHexColor(acceptedColor) ===
      normalisedColor
  );
}

function normaliseHexColor(
  color: string
): string {
  return color.trim().toLowerCase();
}