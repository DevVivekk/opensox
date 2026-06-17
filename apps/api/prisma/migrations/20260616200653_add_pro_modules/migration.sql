-- CreateEnum
CREATE TYPE "ModuleCategory" AS ENUM ('open_source', 'build_in_public', 'first_principles');

-- CreateTable
CREATE TABLE "ProModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ModuleCategory" NOT NULL,
    "bunnyVideoId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProModuleLink" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProModuleLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProModule_category_idx" ON "ProModule"("category");

-- CreateIndex
CREATE INDEX "ProModule_order_idx" ON "ProModule"("order");

-- CreateIndex
CREATE INDEX "ProModule_createdAt_idx" ON "ProModule"("createdAt");

-- CreateIndex
CREATE INDEX "ProModuleLink_moduleId_order_idx" ON "ProModuleLink"("moduleId", "order");

-- AddForeignKey
ALTER TABLE "ProModuleLink" ADD CONSTRAINT "ProModuleLink_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
