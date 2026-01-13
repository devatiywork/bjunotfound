-- CreateEnum
CREATE TYPE "MeasureType" AS ENUM ('GRAMS', 'MILLILITERS', 'SERVINGS');

-- CreateEnum
CREATE TYPE "DishStatus" AS ENUM ('DRAFT', 'READY');

-- CreateTable
CREATE TABLE "dishes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "portions" INTEGER NOT NULL,
    "totalYieldG" INTEGER,
    "status" "DishStatus" NOT NULL DEFAULT 'DRAFT',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_items" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "productUserId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "measureType" "MeasureType" NOT NULL,
    "amountG" INTEGER,
    "amountMl" INTEGER,
    "servingId" TEXT,
    "servingsCount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dish_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dishes_userId_name_idx" ON "dishes"("userId", "name");

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_items" ADD CONSTRAINT "dish_items_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_items" ADD CONSTRAINT "dish_items_productUserId_fkey" FOREIGN KEY ("productUserId") REFERENCES "products_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_items" ADD CONSTRAINT "dish_items_servingId_fkey" FOREIGN KEY ("servingId") REFERENCES "product_user_servings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
