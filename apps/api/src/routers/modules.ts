import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ModuleCategory } from "@prisma/client";
import {
  router,
  protectedProcedure,
  adminProcedure,
  isAdminEmail,
  type ProtectedContext,
} from "../trpc.js";
import { moduleService } from "../services/module.service.js";
import { AuthorizationError } from "../services/session.service.js";

// Derived from the Prisma enum so the two can't drift apart.
const categorySchema = z.nativeEnum(ModuleCategory);

const moduleInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  category: categorySchema,
  bunnyVideoId: z.string().trim().min(1, "Bunny video id is required"),
  order: z.number().int().optional(),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1),
        url: z.string().trim().url(),
      })
    )
    .default([]),
});

// AuthorizationError means "logged in but not allowed" (no active subscription),
// which maps to FORBIDDEN, same as the sessions router.
function toTRPCError(error: unknown): never {
  if (error instanceof AuthorizationError) {
    throw new TRPCError({ code: "FORBIDDEN", message: error.message });
  }
  throw error;
}

export const modulesRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          category: categorySchema.optional(),
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(50).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      try {
        return await moduleService.getModules(ctx.db.prisma, userId, {
          search: input?.search,
          category: input?.category,
          page: input?.page,
          pageSize: input?.pageSize,
        });
      } catch (error) {
        toTRPCError(error);
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      try {
        const module = await moduleService.getModuleById(
          ctx.db.prisma,
          userId,
          input.id
        );
        if (!module) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Module not found" });
        }
        return module;
      } catch (error) {
        toTRPCError(error);
      }
    }),

  getPlaybackUrl: protectedProcedure
    .input(z.object({ moduleId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx as ProtectedContext).user.id;
      try {
        const playback = await moduleService.getPlaybackUrl(
          ctx.db.prisma,
          userId,
          input.moduleId
        );
        if (!playback) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Module not found" });
        }
        return playback;
      } catch (error) {
        toTRPCError(error);
      }
    }),

  // Lets the CMS UI decide whether to render. Real protection is on the admin
  // mutations below, not here.
  isAdmin: protectedProcedure.query(({ ctx }) => {
    return isAdminEmail((ctx as ProtectedContext).user.email);
  }),

  adminList: adminProcedure.query(async ({ ctx }) => {
    return moduleService.listAllForAdmin(ctx.db.prisma);
  }),

  adminCreate: adminProcedure
    .input(moduleInputSchema)
    .mutation(async ({ ctx, input }) => {
      return moduleService.createModule(ctx.db.prisma, input);
    }),

  adminUpdate: adminProcedure
    .input(z.object({ id: z.string().min(1), data: moduleInputSchema }))
    .mutation(async ({ ctx, input }) => {
      return moduleService.updateModule(ctx.db.prisma, input.id, input.data);
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return moduleService.deleteModule(ctx.db.prisma, input.id);
    }),
});
