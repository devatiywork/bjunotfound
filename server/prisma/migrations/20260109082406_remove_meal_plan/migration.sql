/*
  Warnings:

  - You are about to drop the `meal_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_userId_fkey";

-- DropTable
DROP TABLE "meal_plans";

-- DropEnum
DROP TYPE "MealType";
