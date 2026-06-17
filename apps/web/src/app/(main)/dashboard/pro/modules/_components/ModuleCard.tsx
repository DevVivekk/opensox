"use client";

import Link from "next/link";
import { Play } from "lucide-react";

import { CATEGORY_LABELS, type ProModule } from "./module-types";

type ModuleCardProps = {
  module: ProModule;
};

export function ModuleCard({ module }: ModuleCardProps): JSX.Element {
  return (
    <Link
      href={`/dashboard/pro/modules/${module.id}`}
      className="group bg-dash-surface border border-dash-border rounded-xl p-5 flex flex-col gap-3 hover:border-brand-purple/40 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-block text-xs font-medium uppercase tracking-wider text-brand-purple-light bg-brand-purple/10 rounded-full px-2.5 py-0.5">
          {CATEGORY_LABELS[module.category]}
        </span>
        <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-purple/10 group-hover:bg-brand-purple transition-colors duration-200">
          <Play className="w-4 h-4 text-brand-purple-light group-hover:text-text-primary" />
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="text-text-primary font-semibold text-lg truncate">
          {module.title}
        </h3>
        {module.description ? (
          <p className="text-text-secondary text-sm mt-1 line-clamp-2">
            {module.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
