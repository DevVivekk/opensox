"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Lock, Search } from "lucide-react";

import { useSubscription } from "@/hooks/useSubscription";
import { trpc } from "@/lib/trpc";

import { ModuleCard } from "./_components/ModuleCard";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type ModuleCategory,
  type ProModule,
} from "./_components/module-types";

type CategoryFilter = "all" | ModuleCategory;

const PAGE_SIZE = 12;

const ProModulesPage = (): JSX.Element => {
  const { isPaidUser, isLoading: subscriptionLoading } = useSubscription();
  const { data: session, status } = useSession();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);

  // Debounce the search so we don't fire a query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any new filter starts the list back at page one.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  const authenticated = !!session?.user && status === "authenticated";

  const { data, isLoading, isError } = trpc.modules.list.useQuery(
    {
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      page,
      pageSize: PAGE_SIZE,
    },
    {
      // Only members ever fetch real data, so nothing leaks to non-pro users.
      enabled: authenticated && isPaidUser,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    }
  );

  const modules = (data?.items ?? []) as ProModule[];
  const totalPages = data?.totalPages ?? 1;

  const isInitialLoading =
    subscriptionLoading || (isPaidUser && isLoading && !data);

  if (isInitialLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ox-content">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-ox-content">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Opensox Pro Modules
          </h1>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl mt-3">
            Focused modules on open source, building in public, and first
            principles thinking, with the resources to go deeper.
          </p>
        </div>

        {isPaidUser ? (
          <ProContent
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            modules={modules}
            isError={isError}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : (
          <LockedContent />
        )}
      </div>
    </div>
  );
};

type ProContentProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  modules: ProModule[];
  isError: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function ProContent({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  modules,
  isError,
  page,
  totalPages,
  onPageChange,
}: ProContentProps): JSX.Element {
  const tabs: { value: CategoryFilter; label: string }[] = useMemo(
    () => [
      { value: "all", label: "All" },
      ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        {/* Category toggle */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onCategoryChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                category === tab.value
                  ? "bg-brand-purple text-text-primary"
                  : "bg-dash-surface text-text-secondary hover:bg-dash-hover border border-dash-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search modules..."
            className="w-full bg-dash-surface border border-dash-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-brand-purple/50 focus-visible:outline-none"
          />
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <p className="text-text-secondary text-lg">
            Failed to load modules. Please try again later.
          </p>
        </div>
      ) : modules.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>

          {totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
          <p className="text-text-secondary text-lg">No modules found.</p>
          <p className="text-text-muted text-sm">
            Try a different search or category.
          </p>
        </div>
      )}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-surface border border-dash-border text-text-secondary hover:bg-dash-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-text-secondary text-sm px-2">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dash-surface border border-dash-border text-text-secondary hover:bg-dash-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Non-pro users see the grid behind a blur with an upgrade prompt, so they get
// a sense of what's there without any real data being fetched.
function LockedContent(): JSX.Element {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 blur-sm pointer-events-none select-none"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-dash-surface border border-dash-border rounded-xl p-5 h-40"
          >
            <div className="h-5 w-24 bg-dash-raised rounded-full" />
            <div className="h-5 w-3/4 bg-dash-raised rounded mt-4" />
            <div className="h-4 w-full bg-dash-raised rounded mt-3" />
            <div className="h-4 w-2/3 bg-dash-raised rounded mt-2" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-dash-surface border border-dash-border rounded-2xl shadow-xl px-8 py-10 text-center max-w-md mx-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-purple/10 mb-4">
            <Lock className="w-5 h-5 text-brand-purple-light" />
          </div>
          <h2 className="text-text-primary font-semibold text-xl">
            Pro members only
          </h2>
          <p className="text-text-secondary text-sm mt-2">
            Upgrade to Opensox Pro to unlock these modules along with sessions
            and references.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors duration-200"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProModulesPage;
