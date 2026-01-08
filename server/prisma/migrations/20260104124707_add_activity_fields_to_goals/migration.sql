-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WALKING', 'FAST_WALKING', 'RUNNING', 'CUSTOM');

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "targetBurnedCalories" DOUBLE PRECISION,
ADD COLUMN     "targetSteps" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "burnedCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consumedCalories" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "activityLogId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'WALKING',
    "steps" INTEGER NOT NULL,
    "burnedCalories" DOUBLE PRECISION NOT NULL,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_logs_userId_date_key" ON "activity_logs"("userId", "date");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "activity_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
