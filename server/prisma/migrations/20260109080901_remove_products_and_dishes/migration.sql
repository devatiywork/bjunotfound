/*
  Warnings:

  - You are about to drop the column `dishId` on the `meal_plans` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `meal_plans` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dish_ingredients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dish_tag_relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dish_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dishes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorite_dishes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_product_prices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dish_ingredients" DROP CONSTRAINT "dish_ingredients_dishId_fkey";

-- DropForeignKey
ALTER TABLE "dish_ingredients" DROP CONSTRAINT "dish_ingredients_productId_fkey";

-- DropForeignKey
ALTER TABLE "dish_tag_relations" DROP CONSTRAINT "dish_tag_relations_dishId_fkey";

-- DropForeignKey
ALTER TABLE "dish_tag_relations" DROP CONSTRAINT "dish_tag_relations_tagId_fkey";

-- DropForeignKey
ALTER TABLE "dishes" DROP CONSTRAINT "dishes_userId_fkey";

-- DropForeignKey
ALTER TABLE "favorite_dishes" DROP CONSTRAINT "favorite_dishes_dishId_fkey";

-- DropForeignKey
ALTER TABLE "favorite_dishes" DROP CONSTRAINT "favorite_dishes_userId_fkey";

-- DropForeignKey
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_dishId_fkey";

-- DropForeignKey
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_tags" DROP CONSTRAINT "product_tags_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_tags" DROP CONSTRAINT "product_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_product_prices" DROP CONSTRAINT "user_product_prices_productId_fkey";

-- DropForeignKey
ALTER TABLE "user_product_prices" DROP CONSTRAINT "user_product_prices_userId_fkey";

-- AlterTable
ALTER TABLE "meal_plans" DROP COLUMN "dishId",
DROP COLUMN "productId";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "dish_ingredients";

-- DropTable
DROP TABLE "dish_tag_relations";

-- DropTable
DROP TABLE "dish_tags";

-- DropTable
DROP TABLE "dishes";

-- DropTable
DROP TABLE "favorite_dishes";

-- DropTable
DROP TABLE "product_tags";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "tags";

-- DropTable
DROP TABLE "user_product_prices";

-- DropEnum
DROP TYPE "CuisineType";

-- DropEnum
DROP TYPE "DataSource";

-- DropEnum
DROP TYPE "DifficultyLevel";

-- DropEnum
DROP TYPE "DishCategory";

-- DropEnum
DROP TYPE "TagCategory";

-- DropEnum
DROP TYPE "UnitType";
