"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function SidebarCard({
  title,
  children,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="mb-5 border-b border-gray-100 pb-3">
  <h3 className="text-lg font-bold text-gray-800">
    {title}
  </h3>
</div>

      {children}
    </div>
  );
}