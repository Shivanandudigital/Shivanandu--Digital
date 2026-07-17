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
      id="services"
      className="scroll-mt-24 bg-gray-100 py-20"
    >
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center">
          Our Services & Tools
        </h2>

        <p className="text-center text-gray-600 mt-3 mb-10">
          Professional Digital Services & Powerful Online Tools
        </p>

        <SearchBar />

        {categories.map((category) => (
          <div key={category} className="mb-16">

            <h3 className="text-2xl font-bold mb-6">
              {category}
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

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