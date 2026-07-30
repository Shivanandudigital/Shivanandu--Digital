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
    <div className="space-y-3">
      <div>
        <label className="block text-base font-semibold text-gray-900">
          Passport / Visa Size
        </label>

        <p className="mt-1 text-sm text-gray-500">
          Select the required document size.
        </p>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 rounded-xl border border-gray-300 bg-white p-3 text-sm font-medium outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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

      <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
        {value === "25x35" && (
          <>
            📷 <strong>25 × 35 mm</strong>
            <br />
            Standard Photo / PAN Card / General ID
          </>
        )}

        {value === "35x45" && (
          <>
            🇮🇳 <strong>35 × 45 mm</strong>
            <br />
            India Passport / Visa
          </>
        )}

        {value === "2x2" && (
          <>
            🇺🇸 <strong>2 × 2 inch</strong>
            <br />
            US Passport / Visa
          </>
        )}

        {value === "schengen" && (
          <>
            🇪🇺 <strong>35 × 45 mm</strong>
            <br />
            Schengen Visa
          </>
        )}

        {value === "canada" && (
          <>
            🇨🇦 <strong>50 × 70 mm</strong>
            <br />
            Canada Visa
          </>
        )}

        {value === "uk" && (
          <>
            🇬🇧 <strong>35 × 45 mm</strong>
            <br />
            UK Passport
          </>
        )}

        {value === "australia" && (
          <>
            🇦🇺 <strong>35 × 45 mm</strong>
            <br />
            Australia Visa
          </>
        )}
      </div>
    </div>
  );
}
