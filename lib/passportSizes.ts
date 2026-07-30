export type PassportSize = {
  id: string;
  name: string;

  /**
   * Physical photo width in millimetres.
   */
  width: number;

  /**
   * Physical photo height in millimetres.
   */
  height: number;

  /**
   * Width divided by height.
   * Used by cropper, preview and renderer.
   */
  aspect: number;
};

export const passportSizes: PassportSize[] = [
  {
    id: "35x45",
    name: "🇮🇳 India Passport (35×45 mm)",
    width: 35,
    height: 45,
    aspect: 35 / 45,
  },

  {
    id: "25x35",
    name: "📷 Standard Photo (25×35 mm)",
    width: 25,
    height: 35,
    aspect: 25 / 35,
  },

  {
    id: "2x2",
    name: "🇺🇸 US Visa / Passport (2×2 inch)",
    width: 50.8,
    height: 50.8,
    aspect: 1,
  },

  {
    id: "schengen",
    name: "🇪🇺 Schengen Visa (35×45 mm)",
    width: 35,
    height: 45,
    aspect: 35 / 45,
  },

  {
    id: "canada",
    name: "🇨🇦 Canada Visa (50×70 mm)",
    width: 50,
    height: 70,
    aspect: 50 / 70,
  },

  {
    id: "uk",
    name: "🇬🇧 UK Passport (35×45 mm)",
    width: 35,
    height: 45,
    aspect: 35 / 45,
  },

  {
    id: "australia",
    name: "🇦🇺 Australia Visa (35×45 mm)",
    width: 35,
    height: 45,
    aspect: 35 / 45,
  },
];

export function getPassportSize(id: string): PassportSize {
  return (
    passportSizes.find((size) => size.id === id) ??
    passportSizes[0]
  );
}

/**
 * Converts the physical passport-photo size into pixels.
 *
 * Example:
 * 25 × 35 mm at 300 DPI ≈ 295 × 413 px
 * 35 × 45 mm at 300 DPI ≈ 413 × 531 px
 */
export function getPassportSizePixels(
  id: string,
  dpi = 300
): {
  width: number;
  height: number;
} {
  const size = getPassportSize(id);

  const millimetresPerInch = 25.4;

  return {
    width: Math.round(
      (size.width / millimetresPerInch) * dpi
    ),
    height: Math.round(
      (size.height / millimetresPerInch) * dpi
    ),
  };
}