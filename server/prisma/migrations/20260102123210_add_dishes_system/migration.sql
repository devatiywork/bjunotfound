/*
  Warnings:

  - You are about to drop the `dish_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CuisineType" AS ENUM ('RUSSIAN', 'ITALIAN', 'ASIAN', 'MEXICAN', 'FRENCH', 'JAPANESE', 'AMERICAN', 'INDIAN', 'MEDITERRANEAN', 'MIDDLE_EASTERN', 'OTHER');

-- CreateEnum
CREATE TYPE "DishCategory" AS ENUM ('MAIN_COURSE', 'SOUP', 'SALAD', 'SIDE_DISH', 'DESSERT', 'BEVERAGE', 'APPETIZER', 'BREAKFAST', 'SAUCE', 'OTHER');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('DIETARY', 'MEAL_TIME', 'COOKING_TIME', 'DIFFICULTY', 'CUISINE', 'OCCASION', 'SPECIAL');

-- DropForeignKey
ALTER TABLE "dish_products" DROP CONSTRAINT "dish_products_dishId_fkey";

-- DropForeignKey
ALTER TABLE "dish_products" DROP CONSTRAINT "dish_products_productId_fkey";

-- AlterTable
ALTER TABLE "dishes" ADD COLUMN     "caloriesPerServing" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "carbsPerServing" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cookingTimeMinutes" INTEGER,
ADD COLUMN     "cuisineType" "CuisineType",
ADD COLUMN     "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "dishCategory" "DishCategory",
ADD COLUMN     "fatsPerServing" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mealType" "MealType",
ADD COLUMN     "pricePerServing" DOUBLE PRECISION,
ADD COLUMN     "proteinsPerServing" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "servingSize" DOUBLE PRECISION,
ADD COLUMN     "servings" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "source" "DataSource" NOT NULL DEFAULT 'USER',
ADD COLUMN     "totalCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalFats" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalFiber" DOUBLE PRECISION,
ADD COLUMN     "totalPrice" DOUBLE PRECISION,
ADD COLUMN     "totalProteins" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalSugar" DOUBLE PRECISION,
ADD COLUMN     "totalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "dish_products";

-- CreateTable
CREATE TABLE "dish_ingredients" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" "UnitType" NOT NULL DEFAULT 'G',

    CONSTRAINT "dish_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TagCategory",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dish_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_tag_relations" (
    "dishId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "dish_tag_relations_pkey" PRIMARY KEY ("dishId","tagId")
);

-- CreateTable
CREATE TABLE "favorite_dishes" (
    "userId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_dishes_pkey" PRIMARY KEY ("userId","dishId")
);

-- CreateIndex
CREATE UNIQUE INDEX "dish_ingredients_dishId_productId_key" ON "dish_ingredients"("dishId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "dish_tags_name_key" ON "dish_tags"("name");

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_tag_relations" ADD CONSTRAINT "dish_tag_relations_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_tag_relations" ADD CONSTRAINT "dish_tag_relations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "dish_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_dishes" ADD CONSTRAINT "favorite_dishes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_dishes" ADD CONSTRAINT "favorite_dishes_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
