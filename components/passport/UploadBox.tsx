"use client";

type UploadBoxProps = {
  onSelect: (file: File) => void;
};

export default function UploadBox({ onSelect }: UploadBoxProps) {
  return (
    <label className="block cursor-pointer">
      <div className="border-2 border-dashed border-blue-400 rounded-2xl p-16 text-center hover:bg-blue-50 transition">
        <div className="text-6xl mb-4">📷</div>

        <h2 className="text-2xl font-bold">
          Upload Your Photo
        </h2>

        <p className="text-gray-500 mt-3">
          JPG • PNG • WEBP
        </p>
      </div>

      <input
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </label>
  );
}