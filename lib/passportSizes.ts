export type PassportSize = {
  id: string;
  name: string;
  width: number;
  height: number;
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
    id: "2x2",
    name: "🇺🇸 US Visa / Passport (2×2 inch)",
    width: 51,
    height: 51,
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

export function getPassportSize(id: string) {
  return (
    passportSizes.find((size) => size.id === id) ??
    passportSizes[0]
  );
}