"use client";

import { passportSizes } from "@/lib/passportSizes";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SizeSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <label className="mb-3 block text-lg font-semibold">
        Passport / Visa Size
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
      >
        {passportSizes.map((size) => (
          <option
            key={size.id}
            value={size.id}
          >
            {size.name}
          </option>
        ))}
      </select>

    </div>
  );
}