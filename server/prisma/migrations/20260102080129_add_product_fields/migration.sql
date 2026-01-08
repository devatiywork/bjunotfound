/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('G', 'ML', 'PIECE', 'PORTION');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('ADMIN', 'USER', 'API', 'IMPORT');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "fiber" DOUBLE PRECISION,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saturatedFat" DOUBLE PRECISION,
ADD COLUMN     "servingSize" DOUBLE PRECISION,
ADD COLUMN     "sodium" DOUBLE PRECISION,
ADD COLUMN     "source" "DataSource" NOT NULL DEFAULT 'USER',
ADD COLUMN     "sugar" DOUBLE PRECISION,
ADD COLUMN     "unit" "UnitType" NOT NULL DEFAULT 'G',
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
