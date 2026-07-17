"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const sizes = [
  { label: "India Passport (35×45 mm)", value: "35x45" },
  { label: "US Visa (2×2 inch)", value: "2x2" },
  { label: "Custom", value: "custom" },
];

export default function SizeSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">
        Passport Size
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      >
        {sizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </div>
  );
}