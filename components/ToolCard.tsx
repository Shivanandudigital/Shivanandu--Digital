import Link from "next/link";

type ToolCardProps = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

export default function ToolCard({
  title,
  description,
  icon,
  href,
}: ToolCardProps) {
  return (
    <Link href={href} className="block h-full">
      <div className="h-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6">
        <div className="mb-4 text-4xl sm:text-5xl">{icon}</div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-sm leading-6">
          {description}
        </p>

        <div className="mt-6">
          <span className="inline-flex items-center text-blue-600 font-semibold">
            Open Tool →
          </span>
        </div>
      </div>
    </Link>
  );
}
