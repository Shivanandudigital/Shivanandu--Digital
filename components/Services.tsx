"use client";

import { useMemo, useState } from "react";
import ToolCard from "./ToolCard";
import SearchBar from "./SearchBar";
import { tools } from "../data/tools";

const categories = [
  "Photo Tools",
  "PDF Tools",
  "AI Tools",
  "Online Services",
];

export default function Services() {
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tools;
    }

    return tools.filter((tool) => {
      const searchableText = [
        tool.name,
        tool.description,
        tool.category,
        tool.slug,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [search]);

  return (
    <section
      id="tools"
      className="scroll-mt-24 bg-gray-100 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Our Services &amp; Tools
        </h2>

        <p className="mb-8 mt-3 text-center text-sm text-gray-600 sm:mb-10 sm:text-base">
          Professional Digital Services &amp; Powerful Online Tools
        </p>

        <SearchBar
          value={search}
          onChange={setSearch}
          resultCount={filteredTools.length}
        />

        {filteredTools.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="text-5xl" aria-hidden="true">
              🔎
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-800">
              No tools found
            </h3>

            <p className="mt-2 text-slate-600">
              Try searching for passport, photo, PDF or OCR.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-6 rounded-lg bg-[#29205F] px-5 py-2.5 font-semibold text-white transition hover:bg-[#009B83]"
            >
              View All Tools
            </button>
          </div>
        ) : (
          categories.map((category) => {
            const categoryTools = filteredTools.filter(
              (tool) => tool.category === category
            );

            if (categoryTools.length === 0) {
              return null;
            }

            return (
              <div key={category} className="mb-12 sm:mb-16">
                <h3 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">
                  {category}
                </h3>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                  {categoryTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      title={tool.name}
                      description={tool.description}
                      icon={tool.icon}
                      href={`/tools/${tool.slug}`}
                      status={tool.status}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}