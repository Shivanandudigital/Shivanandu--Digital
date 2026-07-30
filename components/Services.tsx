import ToolCard from "./ToolCard";
import SearchBar from "./SearchBar";
import { tools } from "../data/tools";

export default function Services() {
  const categories = [
    "Photo Tools",
    "PDF Tools",
    "AI Tools",
    "Online Services",
  ];

  return (
    <section
      id="tools"
      className="scroll-mt-24 bg-gray-100 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Our Services & Tools
        </h2>

        <p className="mb-8 mt-3 text-center text-sm text-gray-600 sm:mb-10 sm:text-base">
          Professional Digital Services & Powerful Online Tools
        </p>

        <SearchBar />

        {categories.map((category) => (
          <div key={category} className="mb-12 sm:mb-16">

            <h3 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">
              {category}
            </h3>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">

              {tools
                .filter((tool) => tool.category === category)
                .map((tool) => (
                  <ToolCard
                    key={tool.id}
                    title={tool.name}
                    description={tool.description}
                    icon={tool.icon}
                    href={`/tools/${tool.slug}`}
                  />
                ))}

            </div>

          </div>
        ))}

      </div>
    </section>
  );
}
