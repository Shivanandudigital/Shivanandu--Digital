"use client";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export default function SearchBar({
  value,
  onChange,
  resultCount,
}: SearchBarProps) {
  return (
    <div className="mx-auto mb-10 max-w-2xl sm:mb-12">
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg"
        >
          🔍
        </span>

        <input
          type="search"
          placeholder="Search passport, photo, PDF, OCR..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Search digital tools"
          className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-12 text-base outline-none transition focus:border-[#009B83] focus:ring-2 focus:ring-[#009B83]/20 sm:py-4 sm:text-lg"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            ×
          </button>
        )}
      </div>

      {value && (
        <p className="mt-3 text-center text-sm text-slate-600">
          {resultCount === 0
            ? "No matching tools found"
            : `${resultCount} ${
                resultCount === 1 ? "tool" : "tools"
              } found`}
        </p>
      )}
    </div>
  );
}