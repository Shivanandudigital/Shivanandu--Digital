export type EnhancementPreset = "natural" | "portrait" | "document" | "vivid";
export type OutputScale = "original" | "2x" | "4x";
export type OutputFormat = "jpeg" | "png";

export type EnhancementSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  clarity: number;
  highlights: number;
  shadows: number;
  noiseReduction: number;
};

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_OUTPUT_PIXELS = 12_000_000;
export const PREVIEW_MAX_DIMENSION = 1400;

export const initialSettings: EnhancementSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
  clarity: 0,
  highlights: 0,
  shadows: 0,
  noiseReduction: 0,
};

export const presetSettings: Record<EnhancementPreset, EnhancementSettings> = {
  natural: {
    brightness: 102,
    contrast: 103,
    saturation: 102,
    sharpness: 8,
    clarity: 8,
    highlights: 4,
    shadows: -4,
    noiseReduction: 6,
  },
  portrait: {
    brightness: 104,
    contrast: 108,
    saturation: 104,
    sharpness: 12,
    clarity: 16,
    highlights: 8,
    shadows: -8,
    noiseReduction: 8,
  },
  document: {
    brightness: 101,
    contrast: 110,
    saturation: 100,
    sharpness: 6,
    clarity: 12,
    highlights: 2,
    shadows: -2,
    noiseReduction: 4,
  },
  vivid: {
    brightness: 103,
    contrast: 106,
    saturation: 112,
    sharpness: 10,
    clarity: 10,
    highlights: 6,
    shadows: -6,
    noiseReduction: 6,
  },
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isNeutralSettings(settings: EnhancementSettings) {
  return (
    settings.brightness === 100 &&
    settings.contrast === 100 &&
    settings.saturation === 100 &&
    settings.sharpness === 0 &&
    settings.clarity === 0 &&
    settings.highlights === 0 &&
    settings.shadows === 0 &&
    settings.noiseReduction === 0
  );
}

export function getPresetLabel(preset: EnhancementPreset) {
  switch (preset) {
    case "natural":
      return "Natural";
    case "portrait":
      return "Portrait";
    case "document":
      return "Document";
    case "vivid":
      return "Vivid";
    default:
      return "Custom";
  }
}

export function getScaleFactor(scale: OutputScale) {
  switch (scale) {
    case "2x":
      return 2;
    case "4x":
      return 4;
    default:
      return 1;
  }
}

export function resolveOutputDimensions(width: number, height: number, scale: OutputScale) {
  const scaleFactor = getScaleFactor(scale);
  const candidatePixels = width * height * scaleFactor * scaleFactor;
  const safeScale = candidatePixels > MAX_OUTPUT_PIXELS ? Math.sqrt(MAX_OUTPUT_PIXELS / (width * height)) : scaleFactor;
  const finalScale = clamp(safeScale, 1, scaleFactor);

  return {
    width: Math.max(1, Math.round(width * finalScale)),
    height: Math.max(1, Math.round(height * finalScale)),
    scale: finalScale,
    capped: finalScale < scaleFactor,
  };
}

export function estimateOutputSizeBytes(width: number, height: number, format: OutputFormat, quality: number) {
  const pixelCount = Math.max(1, width * height);
  if (format === "png") {
    return Math.round(pixelCount * 1.2);
  }

  const compressionFactor = clamp(quality, 0.6, 0.98);
  return Math.round(pixelCount * 0.75 * compressionFactor);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getPreviewDimensions(width: number, height: number) {
  const ratio = Math.min(PREVIEW_MAX_DIMENSION / width, PREVIEW_MAX_DIMENSION / height, 1);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export async function getExifOrientation(file: File) {
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    return 1;
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return 1;
  }

  let offset = 2;

  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (marker === 0xe1 && offset + 8 + segmentLength <= bytes.length) {
      const exifHeader = bytes.slice(offset + 4, offset + 8);
      if (exifHeader[0] === 0x45 && exifHeader[1] === 0x78 && exifHeader[2] === 0x69 && exifHeader[3] === 0x66) {
        const tiffDataOffset = offset + 8;
        const endian = bytes[tiffDataOffset] === 0x49 ? "little" : "big";
        const ifdOffset = endian === "little"
          ? (bytes[tiffDataOffset + 4] | (bytes[tiffDataOffset + 5] << 8))
          : (bytes[tiffDataOffset + 4] << 8) | bytes[tiffDataOffset + 5];

        const orientationOffset = tiffDataOffset + ifdOffset + 2;
        if (orientationOffset + 2 < bytes.length) {
          const orientationValue = endian === "little"
            ? bytes[orientationOffset + 8] | (bytes[orientationOffset + 9] << 8)
            : (bytes[orientationOffset + 8] << 8) | bytes[orientationOffset + 9];
          return orientationValue >= 1 && orientationValue <= 8 ? orientationValue : 1;
        }
      }
    }

    offset += 2 + segmentLength;
  }

  return 1;
}

function createOrientedCanvas(image: HTMLImageElement, orientation: number) {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not create a canvas for image processing.");
  }

  const needsRotation = orientation >= 2 && orientation <= 8;

  if (!needsRotation) {
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    context.drawImage(image, 0, 0, sourceWidth, sourceHeight);
    return canvas;
  }

  let width = sourceWidth;
  let height = sourceHeight;
  let transform = "none";

  switch (orientation) {
    case 2:
      transform = "flip-x";
      break;
    case 3:
      transform = "rotate-180";
      break;
    case 4:
      transform = "flip-y";
      break;
    case 5:
      transform = "flip-x-rotate-90";
      width = sourceHeight;
      height = sourceWidth;
      break;
    case 6:
      transform = "rotate-90";
      width = sourceHeight;
      height = sourceWidth;
      break;
    case 7:
      transform = "flip-x-rotate-90";
      width = sourceHeight;
      height = sourceWidth;
      break;
    case 8:
      transform = "rotate-270";
      width = sourceHeight;
      height = sourceWidth;
      break;
    default:
      break;
  }

  canvas.width = width;
  canvas.height = height;
  context.save();

  switch (transform) {
    case "flip-x":
      context.translate(width, 0);
      context.scale(-1, 1);
      break;
    case "flip-y":
      context.translate(0, height);
      context.scale(1, -1);
      break;
    case "rotate-180":
      context.translate(width, height);
      context.rotate(Math.PI);
      break;
    case "rotate-90":
      context.translate(width, 0);
      context.rotate(Math.PI / 2);
      break;
    case "rotate-270":
      context.translate(0, height);
      context.rotate(-Math.PI / 2);
      break;
    case "flip-x-rotate-90":
      context.translate(width, 0);
      context.scale(-1, 1);
      context.rotate(Math.PI / 2);
      break;
    default:
      break;
  }

  context.drawImage(image, 0, 0, sourceWidth, sourceHeight);
  context.restore();
  return canvas;
}

function applyBrightnessContrast(data: Uint8ClampedArray, settings: EnhancementSettings) {
  if (settings.brightness === 100 && settings.contrast === 100) {
    return;
  }

  const brightnessOffset = (settings.brightness - 100) * 2.55;
  const contrastFactor = clamp(settings.contrast / 100, 0.5, 1.5);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha === 0) {
      continue;
    }

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    const updatedRed = clamp((red - 128) * contrastFactor + 128 + brightnessOffset, 0, 255);
    const updatedGreen = clamp((green - 128) * contrastFactor + 128 + brightnessOffset, 0, 255);
    const updatedBlue = clamp((blue - 128) * contrastFactor + 128 + brightnessOffset, 0, 255);

    data[index] = updatedRed;
    data[index + 1] = updatedGreen;
    data[index + 2] = updatedBlue;
    data[index + 3] = alpha;
  }
}

function applySaturation(data: Uint8ClampedArray, settings: EnhancementSettings) {
  if (settings.saturation === 100) {
    return;
  }

  const saturationAmount = clamp(settings.saturation / 100, 0.5, 1.7);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha === 0) {
      continue;
    }

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = red * 0.299 + green * 0.587 + blue * 0.114;

    const saturatedRed = luminance + (red - luminance) * saturationAmount;
    const saturatedGreen = luminance + (green - luminance) * saturationAmount;
    const saturatedBlue = luminance + (blue - luminance) * saturationAmount;

    data[index] = clamp(saturatedRed, 0, 255);
    data[index + 1] = clamp(saturatedGreen, 0, 255);
    data[index + 2] = clamp(saturatedBlue, 0, 255);
    data[index + 3] = alpha;
  }
}

function applyHighlightsShadows(data: Uint8ClampedArray, settings: EnhancementSettings) {
  if (settings.highlights === 0 && settings.shadows === 0) {
    return;
  }

  const highlightStrength = settings.highlights / 100;
  const shadowStrength = settings.shadows / 100;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha === 0) {
      continue;
    }

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
    const normalized = luminance / 255;

    let adjustment = 0;
    if (normalized > 0.72) {
      adjustment = (normalized - 0.72) * 0.8 * highlightStrength;
    } else if (normalized < 0.28) {
      adjustment = (normalized - 0.28) * 0.8 * shadowStrength;
    }

    if (adjustment !== 0) {
      const boost = adjustment * 255;
      data[index] = clamp(red + boost, 0, 255);
      data[index + 1] = clamp(green + boost, 0, 255);
      data[index + 2] = clamp(blue + boost, 0, 255);
    }

    data[index + 3] = alpha;
  }
}

function applyClarity(data: Uint8ClampedArray, width: number, height: number, settings: EnhancementSettings) {
  if (settings.clarity === 0) {
    return;
  }

  const strength = clamp(settings.clarity / 140, 0, 0.2);
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const center = index;
      const avg = [
        copy[index] * 0.25 + copy[index - 4] * 0.2 + copy[index + 4] * 0.2 + copy[index - width * 4] * 0.2 + copy[index + width * 4] * 0.2,
        copy[index + 1] * 0.25 + copy[index - 3] * 0.2 + copy[index + 5] * 0.2 + copy[index - width * 4 + 1] * 0.2 + copy[index + width * 4 + 1] * 0.2,
        copy[index + 2] * 0.25 + copy[index - 2] * 0.2 + copy[index + 6] * 0.2 + copy[index - width * 4 + 2] * 0.2 + copy[index + width * 4 + 2] * 0.2,
      ];

      const delta = [copy[center] - avg[0], copy[center + 1] - avg[1], copy[center + 2] - avg[2]];
      data[center] = clamp(copy[center] + delta[0] * strength, 0, 255);
      data[center + 1] = clamp(copy[center + 1] + delta[1] * strength, 0, 255);
      data[center + 2] = clamp(copy[center + 2] + delta[2] * strength, 0, 255);
      data[center + 3] = copy[center + 3];
    }
  }
}

function applySharpening(data: Uint8ClampedArray, width: number, height: number, settings: EnhancementSettings) {
  if (settings.sharpness === 0) {
    return;
  }

  const strength = clamp(settings.sharpness / 300, 0, 0.16);
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const center = index;
      const edge = [
        -copy[center] * 0.35 + copy[index - 4] * 0.15 + copy[index + 4] * 0.15 + copy[index - width * 4] * 0.15 + copy[index + width * 4] * 0.15,
        -copy[center + 1] * 0.35 + copy[index - 3] * 0.15 + copy[index + 5] * 0.15 + copy[index - width * 4 + 1] * 0.15 + copy[index + width * 4 + 1] * 0.15,
        -copy[center + 2] * 0.35 + copy[index - 2] * 0.15 + copy[index + 6] * 0.15 + copy[index - width * 4 + 2] * 0.15 + copy[index + width * 4 + 2] * 0.15,
      ];

      data[center] = clamp(copy[center] + edge[0] * strength, 0, 255);
      data[center + 1] = clamp(copy[center + 1] + edge[1] * strength, 0, 255);
      data[center + 2] = clamp(copy[center + 2] + edge[2] * strength, 0, 255);
      data[center + 3] = copy[center + 3];
    }
  }
}

function applyNoiseReduction(data: Uint8ClampedArray, width: number, height: number, settings: EnhancementSettings) {
  if (settings.noiseReduction === 0) {
    return;
  }

  const amount = clamp(settings.noiseReduction / 100, 0, 0.35);
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      const neighbors = [
        copy[index],
        copy[index - 4],
        copy[index + 4],
        copy[index - width * 4],
        copy[index + width * 4],
      ];

      const average = neighbors.reduce((sum, value) => sum + value, 0) / neighbors.length;
      data[index] = clamp(copy[index] + (average - copy[index]) * amount, 0, 255);
      data[index + 1] = clamp(copy[index + 1] + (average - copy[index + 1]) * amount, 0, 255);
      data[index + 2] = clamp(copy[index + 2] + (average - copy[index + 2]) * amount, 0, 255);
      data[index + 3] = copy[index + 3];
    }
  }
}

export async function renderEnhancedCanvas(image: HTMLImageElement, settings: EnhancementSettings, width: number, height: number, orientation: number) {
  const sourceCanvas = createOrientedCanvas(image, orientation);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not create a canvas for image processing.");
  }

  context.drawImage(sourceCanvas, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);

  if (!isNeutralSettings(settings)) {
    applyBrightnessContrast(imageData.data, settings);
    applySaturation(imageData.data, settings);
    applyHighlightsShadows(imageData.data, settings);
    applyClarity(imageData.data, width, height, settings);
    applySharpening(imageData.data, width, height, settings);
    applyNoiseReduction(imageData.data, width, height, settings);
  }

  context.putImageData(imageData, 0, 0);
  return canvas;
}
