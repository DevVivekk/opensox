"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";

import { useSubscription } from "@/hooks/useSubscription";
import { trpc } from "@/lib/trpc";

import { ModulePlayer } from "../_components/ModulePlayer";
import {
  CATEGORY_LABELS,
  type ModuleCategory,
  type ProModule,
} from "../_components/module-types";

const ModuleDetailPage = (): JSX.Element => {
  const params = useParams<{ id: string }>();
  const moduleId = params?.id ?? "";

  const { isPaidUser, isLoading: subscriptionLoading } = useSubscription();
  const { data: session, status } = useSession();
  const authenticated = !!session?.user && status === "authenticated";

  const { data, isLoading, isError, error, refetch } =
    trpc.modules.getById.useQuery(
      { id: moduleId },
      {
        enabled: authenticated && isPaidUser && !!moduleId,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      }
    );

  const module = data as ProModule | undefined;

  // Pull a few more modules from the same category to suggest next.
  const { data: related } = trpc.modules.list.useQuery(
    { category: module?.category, pageSize: 5 },
    {
      enabled: authenticated && isPaidUser && !!module,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    }
  );

  const relatedModules = ((related?.items ?? []) as ProModule[])
    .filter((m) => m.id !== moduleId)
    .slice(0, 4);

  if (subscriptionLoading || (isPaidUser && isLoading)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ox-content">
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPaidUser) {
    return (
      <Centered>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-purple/10 mb-4">
          <Lock className="w-5 h-5 text-brand-purple-light" />
        </div>
        <h2 className="text-text-primary font-semibold text-xl">
          Pro members only
        </h2>
        <p className="text-text-secondary text-sm mt-2 max-w-sm">
          Upgrade to Opensox Pro to watch this module.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors"
        >
          Upgrade to Pro
        </Link>
      </Centered>
    );
  }

  // A genuine 404 comes back as a NOT_FOUND error; anything else is a transient
  // failure we let the user retry.
  if (isError && error?.data?.code !== "NOT_FOUND") {
    return (
      <Centered>
        <p className="text-text-primary font-semibold text-lg">
          Something went wrong
        </p>
        <p className="text-text-secondary text-sm mt-1">
          We couldn&apos;t load this module. Please try again.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand-purple hover:bg-brand-purple/90 text-text-primary text-sm font-medium transition-colors"
          >
            Retry
          </button>
          <Link
            href="/dashboard/pro/modules"
            className="text-brand-purple-light hover:underline text-sm"
          >
            Back to modules
          </Link>
        </div>
      </Centered>
    );
  }

  if (!module) {
    return (
      <Centered>
        <p className="text-text-primary font-semibold text-lg">
          Module not found
        </p>
        <Link
          href="/dashboard/pro/modules"
          className="text-brand-purple-light hover:underline text-sm mt-3"
        >
          Back to modules
        </Link>
      </Centered>
    );
  }

  return (
    <div className="w-full min-h-full bg-ox-content">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/dashboard/pro/modules"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to modules
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Video + meta */}
          <div className="lg:col-span-3">
            <ModulePlayer moduleId={module.id} title={module.title} />

            <span className="inline-block text-xs font-medium uppercase tracking-wider text-brand-purple-light bg-brand-purple/10 rounded-full px-2.5 py-0.5 mt-5">
              {CATEGORY_LABELS[module.category]}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-3">
              {module.title}
            </h1>
            {module.description ? (
              <p className="text-text-secondary text-base mt-3 whitespace-pre-line">
                {module.description}
              </p>
            ) : null}
          </div>

          {/* Resources + related */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider font-medium">
                Resources
              </p>
              {module.links.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {module.links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2.5 text-text-secondary hover:text-text-primary text-sm transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-brand-purple/70 mt-0.5 flex-shrink-0" />
                        <span className="min-w-0 break-words">{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-text-secondary text-sm">
                  No resources linked for this module.
                </p>
              )}
            </div>

            {relatedModules.length > 0 ? (
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider font-medium">
                  More in {CATEGORY_LABELS[module.category as ModuleCategory]}
                </p>
                <ul className="mt-3 space-y-2">
                  {relatedModules.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/dashboard/pro/modules/${m.id}`}
                        className="block text-text-secondary hover:text-text-primary text-sm transition-colors truncate"
                      >
                        {m.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

function Centered({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="w-full min-h-full bg-ox-content flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-4 py-16">
        {children}
      </div>
    </div>
  );
}

export default ModuleDetailPage;
