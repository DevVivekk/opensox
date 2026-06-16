"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectTitleStore } from "@/store/useProjectTitleStore";
import { DashboardProjectsProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

type ProjectsContainerProps = { projects: DashboardProjectsProps[] };

const LEGACY_BLOG_PATH = "/blog/why-100-percent-software-isnt-good";

const languageColors: Record<string, string> = {
  javascript: "bg-yellow-500/15 text-yellow-500",
  typescript: "bg-blue-500/15 text-blue-500",
  python: "bg-emerald-500/15 text-emerald-500",
  go: "bg-cyan-500/15 text-cyan-500",
  rust: "bg-orange-500/15 text-orange-500",
  java: "bg-red-500/15 text-red-500",
  "c#": "bg-purple-500/15 text-purple-500",
  "c++": "bg-indigo-500/15 text-indigo-500",
  c: "bg-gray-500/15 text-gray-500",
  php: "bg-violet-500/15 text-violet-500",
  swift: "bg-pink-500/15 text-pink-500",
  kotlin: "bg-sky-500/15 text-sky-500",
  ruby: "bg-rose-500/15 text-rose-500",
  scala: "bg-teal-500/15 text-teal-500",
  html: "bg-orange-400/15 text-orange-400",
  elixir: "bg-purple-600/15 text-purple-600",
};

const getColor = (c?: string) =>
  languageColors[(c || "").toLowerCase()] || "bg-gray-200/10 text-gray-300";

const tableColumns = [
  "Project",
  "Issues",
  "Language",
  "Popularity",
  "Stage",
  "Competition",
  "Activity",
];

export default function ProjectsContainer({
  projects,
}: ProjectsContainerProps) {
  const pathname = usePathname();
  const { projectTitle } = useProjectTitleStore();
  const { setShowFilters } = useFilterStore();
  const isProjectsPage = pathname === "/dashboard/projects";
  const [showLegacyBanner, setShowLegacyBanner] = useState(true);

  return (
    <div className="w-full p-6 sm:p-6">
      {isProjectsPage && showLegacyBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-dash-border bg-ox-content px-4 py-3">
          <InformationCircleIcon className="mt-0.5 size-4 shrink-0 text-brand-purple" />
          <p className="flex-1 text-sm text-text-muted">
            This is a legacy feature of Opensox.{" "}
            <Link
              href={LEGACY_BLOG_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-medium text-text-primary bg-brand-purple px-2 py-0.5 rounded-md hover:bg-brand-purple-light transition-colors"
            >
              Here&apos;s more about it
            </Link>
            .
          </p>
          <button
            type="button"
            aria-label="Dismiss legacy feature notice"
            onClick={() => setShowLegacyBanner(false)}
            className="rounded-md p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <XMarkIcon className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text-primary tracking-tight">
          {projectTitle}
        </h2>
        {isProjectsPage && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              variant="outline"
              className="gap-2 border-dash-border bg-transparent text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-5 text-text-primary hover:bg-white/5 rounded-md"
            >
              <Link href="/pricing" target="_blank" rel="noopener noreferrer">
                <SparklesIcon className="size-4 text-brand-purple" />
                Get hand-picked OSS projects
              </Link>
            </Button>
            <Button
              className="font-semibold text-text-primary bg-ox-purple text-sm sm:text-base h-10 sm:h-11 px-5 sm:px-6 hover:bg-white-500 rounded-md"
              onClick={() => setShowFilters(true)}
            >
              Find projects
            </Button>
          </div>
        )}
      </div>

      {projects && projects.length > 0 ? (
        <div
          className="
            w-full bg-ox-content border border-dash-border rounded-lg
            h-[80vh] overflow-y-auto overflow-x-auto relative
            [&::-webkit-scrollbar]:w-2
      
            [&::-webkit-scrollbar]:h-1
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-brand-purple/30
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:hover:bg-brand-purple/50
          "
        >
          <Table className="w-full min-w-[820px] table-fixed">
            {/* Sticky header row */}
            <TableHeader>
              <TableRow className="border-b border-brand-purple-dark hover:bg-transparent">
                {tableColumns.map((name, i) => (
                  <TableHead
                    key={name}
                    className={[
                      "px-4 py-3.5 font-semibold text-text-primary text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap",
                      "sticky top-0 z-30 bg-brand-purple",
                      i === 0 ? "text-left w-[34%] min-w-[220px]" : "text-center",
                    ].join(" ")}
                  >
                    {name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map((p) => {
                const openProject = () =>
                  window.open(p.url, "_blank", "noopener,noreferrer");
                return (
                <TableRow
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${p.name} on GitHub`}
                  className="group border-b border-ox-gray/60 cursor-pointer hover:bg-brand-purple/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/50"
                  onClick={openProject}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openProject();
                    }
                  }}
                >
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full overflow-hidden inline-block h-6 w-6 sm:h-7 sm:w-7 border border-dash-border shrink-0">
                        <Image
                          src={p.avatarUrl}
                          className="w-full h-full object-cover"
                          alt={p.name}
                          width={28}
                          height={28}
                        />
                      </div>
                      <span className="text-text-primary text-xs sm:text-sm font-semibold group-hover:text-brand-purple transition-colors">
                        {p.name}
                      </span>
                      <ArrowUpRightIcon className="size-3.5 shrink-0 text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>

                  <TableCell className="text-text-primary text-xs sm:text-sm text-center px-4 py-3.5 whitespace-nowrap">
                    {p.totalIssueCount}
                  </TableCell>

                  <TableCell className="text-center px-4 py-3.5">
                    <Badge
                      variant="secondary"
                      className={`${getColor(p.primaryLanguage)} text-[11px] sm:text-xs font-medium whitespace-nowrap`}
                    >
                      {p.primaryLanguage}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-text-primary text-xs sm:text-sm text-center font-medium px-4 py-3.5 whitespace-nowrap">
                    {p.popularity}
                  </TableCell>
                  <TableCell className="text-text-primary text-xs sm:text-sm text-center font-medium px-4 py-3.5 whitespace-nowrap">
                    {p.stage}
                  </TableCell>
                  <TableCell className="text-text-primary text-xs sm:text-sm text-center font-medium px-4 py-3.5 whitespace-nowrap">
                    {p.competition}
                  </TableCell>
                  <TableCell className="text-text-primary text-xs sm:text-sm text-center font-medium px-4 py-3.5 whitespace-nowrap">
                    {p.activity}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : isProjectsPage ? (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-text-muted space-y-6">
          <div className="flex flex-col items-center gap-2">
            <MagnifyingGlassIcon className="size-12 text-brand-purple animate-pulse" />
            <p className="text-xl font-medium">Find Your Next Project</p>
          </div>
          <p className="text-base text-center max-w-md">
            Click the &apos;Find projects&apos; button above to discover open
            source projects that match your interests
          </p>
        </div>
      ) : null}
    </div>
  );
}
