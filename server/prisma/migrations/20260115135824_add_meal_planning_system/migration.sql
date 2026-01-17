-- CreateEnum
CREATE TYPE "MealEventStatus" AS ENUM ('PLANNED', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "meal_types" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "dishId" TEXT NOT NULL,
    "portions" DOUBLE PRECISION NOT NULL,
    "mealTypeId" TEXT,
    "note" TEXT,
    "status" "MealEventStatus" NOT NULL DEFAULT 'PLANNED',
    "timezone" TEXT,
    "completedAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_types_userId_isActive_sortOrder_idx" ON "meal_types"("userId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "meal_types_userId_code_key" ON "meal_types"("userId", "code");

-- CreateIndex
CREATE INDEX "meal_events_userId_isArchived_startAt_idx" ON "meal_events"("userId", "isArchived", "startAt");

-- CreateIndex
CREATE INDEX "meal_events_userId_status_startAt_idx" ON "meal_events"("userId", "status", "startAt");

-- CreateIndex
CREATE INDEX "meal_events_userId_dishId_startAt_idx" ON "meal_events"("userId", "dishId", "startAt");

-- CreateIndex
CREATE INDEX "meal_events_userId_mealTypeId_startAt_idx" ON "meal_events"("userId", "mealTypeId", "startAt");

-- AddForeignKey
ALTER TABLE "meal_types" ADD CONSTRAINT "meal_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_events" ADD CONSTRAINT "meal_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_events" ADD CONSTRAINT "meal_events_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_events" ADD CONSTRAINT "meal_events_mealTypeId_fkey" FOREIGN KEY ("mealTypeId") REFERENCES "meal_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
