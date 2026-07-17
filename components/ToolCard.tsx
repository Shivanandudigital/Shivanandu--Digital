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
    <Link href={href}>
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
        <div className="text-5xl mb-4">{icon}</div>

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