import type { ModuleCategory, Prisma, PrismaClient } from "@prisma/client";
import type { ExtendedPrismaClient } from "../prisma.js";
import { SUBSCRIPTION_STATUS } from "../constants/subscription.js";
import { AuthorizationError } from "./session.service.js";
import { buildSignedEmbedUrl } from "../utils/bunny.js";

type Db = ExtendedPrismaClient | PrismaClient;

// What the client is allowed to see. Note bunnyVideoId is deliberately absent:
// the raw video GUID never goes over the wire.
const PUBLIC_MODULE_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  order: true,
  createdAt: true,
  links: {
    select: { id: true, label: true, url: true, order: true },
    orderBy: { order: "asc" },
  },
} satisfies Prisma.ProModuleSelect;

export type PublicModule = Prisma.ProModuleGetPayload<{
  select: typeof PUBLIC_MODULE_SELECT;
}>;

export type PaginatedModules = {
  items: PublicModule[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export type ModuleLinkInput = { label: string; url: string };

export type ModuleInput = {
  title: string;
  description?: string | null | undefined;
  category: ModuleCategory;
  bunnyVideoId: string;
  order?: number | undefined;
  links: ModuleLinkInput[];
};

async function assertActiveSubscription(db: Db, userId: string): Promise<void> {
  const subscription = await db.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { gte: new Date() },
    },
  });

  if (!subscription) {
    throw new AuthorizationError(
      "Active subscription required to access modules"
    );
  }
}

export const moduleService = {
  /**
   * List modules for a paid user, one page at a time. Supports a plain text
   * search over title and description plus an optional category filter. Never
   * returns bunnyVideoId.
   */
  async getModules(
    db: Db,
    userId: string,
    options: {
      search?: string | undefined;
      category?: ModuleCategory | undefined;
      page?: number | undefined;
      pageSize?: number | undefined;
    } = {}
  ): Promise<PaginatedModules> {
    await assertActiveSubscription(db, userId);

    const search = options.search?.trim();
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE))
    );

    const where: Prisma.ProModuleWhereInput = {};

    if (options.category) {
      where.category = options.category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // One transaction so the total count and the page rows come from the same
    // snapshot, keeping pagination consistent if modules change mid-request.
    const [total, items] = await db.$transaction([
      db.proModule.count({ where }),
      db.proModule.findMany({
        where,
        select: PUBLIC_MODULE_SELECT,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  /**
   * A single module for the detail page. Gated, and still omits bunnyVideoId.
   * The video is fetched separately via getPlaybackUrl when the user plays it.
   */
  async getModuleById(
    db: Db,
    userId: string,
    id: string
  ): Promise<PublicModule | null> {
    await assertActiveSubscription(db, userId);

    return db.proModule.findUnique({
      where: { id },
      select: PUBLIC_MODULE_SELECT,
    });
  },

  /**
   * The only path that touches the video GUID. Gate again, look it up, and hand
   * back a short-lived signed embed URL.
   */
  async getPlaybackUrl(
    db: Db,
    userId: string,
    moduleId: string
  ): Promise<{ embedUrl: string } | null> {
    await assertActiveSubscription(db, userId);

    const module = await db.proModule.findUnique({
      where: { id: moduleId },
      select: { bunnyVideoId: true },
    });

    // A missing module is a 404, surfaced by the router. (A failed subscription
    // check throws AuthorizationError above and becomes a 403.)
    if (!module) {
      return null;
    }

    return { embedUrl: buildSignedEmbedUrl(module.bunnyVideoId) };
  },

  // --- Admin CMS (gated by adminProcedure in the router) ---

  /**
   * Full module list for the CMS, including bunnyVideoId so admins can see and
   * edit it. Only ever reached behind the admin allowlist.
   */
  async listAllForAdmin(db: Db) {
    return db.proModule.findMany({
      include: { links: { orderBy: { order: "asc" } } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  },

  async createModule(db: Db, input: ModuleInput) {
    return db.proModule.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        bunnyVideoId: input.bunnyVideoId,
        order: input.order ?? 0,
        links: {
          create: input.links.map((link, index) => ({
            label: link.label,
            url: link.url,
            order: index,
          })),
        },
      },
      include: { links: { orderBy: { order: "asc" } } },
    });
  },

  async updateModule(db: Db, id: string, input: ModuleInput) {
    // Links are small and fully managed by the form, so replace the set rather
    // than diffing it.
    return db.proModule.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        bunnyVideoId: input.bunnyVideoId,
        order: input.order ?? 0,
        links: {
          deleteMany: {},
          create: input.links.map((link, index) => ({
            label: link.label,
            url: link.url,
            order: index,
          })),
        },
      },
      include: { links: { orderBy: { order: "asc" } } },
    });
  },

  async deleteModule(db: Db, id: string) {
    await db.proModule.delete({ where: { id } });
    return { id };
  },
};
