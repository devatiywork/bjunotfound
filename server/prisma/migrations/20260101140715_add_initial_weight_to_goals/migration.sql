/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `weights` table. All the data in the column will be lost.
  - You are about to drop the column `deletedBy` on the `weights` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `weights` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "initialWeight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "weights" DROP COLUMN "deletedAt",
DROP COLUMN "deletedBy",
DROP COLUMN "isArchived";
