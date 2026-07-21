"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const colors = [
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#87CEEB" },
  { name: "Red", value: "#ff4d4d" },
  { name: "Gray", value: "#dddddd" },
];

export default function BackgroundSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">
        Background Color
      </h3>

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={`h-12 w-12 rounded-full border-4 ${
              value === color.value
                ? "border-blue-600"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}