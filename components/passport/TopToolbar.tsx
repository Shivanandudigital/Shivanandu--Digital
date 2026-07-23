"use client";

import SizeSelector from "./SizeSelector";
import BackgroundSelector from "./BackgroundSelector";
import BackgroundRemover from "./BackgroundRemover";

type Props = {
  size: string;
  onSizeChange: (value: string) => void;

  backgroundColor: string;
  onBackgroundChange: (value: string) => void;

  loading: boolean;
  onRemoveBackground: () => void;
};

export default function TopToolbar({
  size,
  onSizeChange,
  backgroundColor,
  onBackgroundChange,
  loading,
  onRemoveBackground,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid gap-5 md:grid-cols-3">

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
  Passport Size
</h3>

          <SizeSelector
            value={size}
            onChange={onSizeChange}
          />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
  Background
</h3>

          <BackgroundSelector
            value={backgroundColor}
            onChange={onBackgroundChange}
          />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
  AI Tools
</h3>

          <BackgroundRemover
            loading={loading}
            onRemove={onRemoveBackground}
          />
        </div>

      </div>
    </div>
  );
}