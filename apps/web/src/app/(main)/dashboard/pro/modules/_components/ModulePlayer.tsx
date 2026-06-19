"use client";

import { trpc } from "@/lib/trpc";

type ModulePlayerProps = {
  moduleId: string;
  title: string;
};

// Fetches the short-lived signed embed URL for this module and renders it. The
// URL is only ever requested here, on play, so it never rides along in any list
// payload. It expires quickly, so we don't cache it.
export function ModulePlayer({
  moduleId,
  title,
}: ModulePlayerProps): JSX.Element {
  const { data, isLoading, isError } =
    trpc.modules.getPlaybackUrl.useQuery(
      { moduleId },
      { staleTime: 0, gcTime: 0, refetchOnWindowFocus: false }
    );

  const embedUrl = data?.embedUrl ?? null;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden border border-dash-border bg-dash-base">
      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="h-full w-full flex items-center justify-center"
        >
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <span className="sr-only">Loading video...</span>
        </div>
      ) : embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title}
          className="h-full w-full"
          allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center p-6">
          <p className="text-text-secondary text-sm text-center">
            {isError
              ? "Couldn't load this video. Please try again."
              : "This module video is unavailable."}
          </p>
        </div>
      )}
    </div>
  );
}
