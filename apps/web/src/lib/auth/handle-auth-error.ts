import { TRPCClientError } from "@trpc/client";
import { signOut } from "next-auth/react";

// An expired or invalid session comes back as UNAUTHORIZED. FORBIDDEN is a
// different thing: the user is logged in but not allowed (like premium-only
// routes), so we leave those alone and don't sign anyone out.
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED"
  );
}

// Only redirect once even if a whole batch of requests fails at the same time.
let isHandlingAuthError = false;

// When the session expires, any tRPC call starts failing. Clear the stale
// session and send the user to login, remembering where they were.
export function handleAuthError(error: unknown): void {
  if (typeof window === "undefined") return;
  if (!isAuthError(error)) return;
  if (isHandlingAuthError) return;

  // Already on login, so there's nowhere to send them. Match the /login route
  // itself (and its subpaths), not lookalikes like /login-help.
  const { pathname } = window.location;
  if (pathname === "/login" || pathname.startsWith("/login/")) return;

  isHandlingAuthError = true;

  const callbackUrl = window.location.pathname + window.location.search;

  signOut({ redirect: false }).finally(() => {
    window.location.href = `/login?callbackUrl=${encodeURIComponent(
      callbackUrl
    )}`;
  });
}
