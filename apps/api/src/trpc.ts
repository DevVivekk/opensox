import { initTRPC, TRPCError, type AnyProcedure } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";
import { verifyToken } from "./utils/auth.js";
import type { User } from "@prisma/client";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.substring(7);

  try {
    const user = await verifyToken(token);
    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired token",
    });
  }
});

export type ProtectedContext = Context & { user: User };

// Admins are just an allowlist of emails in env. No role column needed: this is
// only for the lightweight modules CMS, and the list rarely changes.
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

const isAdmin = t.middleware(async ({ ctx, next }) => {
  const user = (ctx as ProtectedContext).user;

  if (!isAdminEmail(user?.email)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure: typeof t.procedure = t.procedure.use(
  isAuthed
) as any;
// Logged in AND on the admin allowlist. Used by the modules CMS endpoints.
export const adminProcedure: typeof t.procedure = t.procedure
  .use(isAuthed)
  .use(isAdmin) as any;
