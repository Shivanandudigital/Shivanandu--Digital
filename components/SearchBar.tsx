"use client";

import { useState } from "react";

export default function SearchBar() {
  const [search, setSearch] = useState("");

  return (
    <div className="mx-auto mb-10 max-w-2xl sm:mb-12">
      <input
        type="text"
        placeholder="🔍 Search tools..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 sm:px-5 sm:py-4 sm:text-lg"
      />
    </div>
  );
}
