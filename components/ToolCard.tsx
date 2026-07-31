import Link from "next/link";
import type { ToolStatus } from "../data/tools";

type ToolCardProps = {
  title: string;
  description: string;
  icon: string;
  href: string;
  status: ToolStatus;
};

export default function ToolCard({
  title,
  description,
  icon,
  href,
  status,
}: ToolCardProps) {
  const isReady = status === "ready";

  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#009B83] focus-visible:ring-offset-2"
      aria-label={`${title} — ${isReady ? "Open tool" : "Coming soon"}`}
    >
      <article className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#009B83]/40 group-hover:shadow-xl sm:p-6">
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[#009B83]/5 transition-transform duration-300 group-hover:scale-150"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#29205F]/10 to-[#009B83]/10 text-4xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            {icon}
          </div>

          <span
            className={
              isReady
                ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700"
            }
          >
            <span
              aria-hidden="true"
              className={
                isReady
                  ? "h-2 w-2 rounded-full bg-emerald-500"
                  : "h-2 w-2 rounded-full bg-amber-500"
              }
            />

            {isReady ? "Ready" : "Coming Soon"}
          </span>
        </div>

        <h3 className="relative mt-5 text-xl font-extrabold leading-tight text-[#29205F]">
          {title}
        </h3>

        <p className="relative mt-3 flex-1 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div className="relative mt-6">
          <span
            className={
              isReady
                ? "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#29205F] px-4 py-3 text-sm font-bold text-white transition group-hover:bg-[#009B83]"
                : "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition group-hover:bg-amber-50 group-hover:text-amber-700"
            }
          >
            {isReady ? "Open Tool" : "View Details"}

            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}