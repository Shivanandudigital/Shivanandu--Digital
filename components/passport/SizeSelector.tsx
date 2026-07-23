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
<div>

      <label className="mb-2 block text-base font-semibold">
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