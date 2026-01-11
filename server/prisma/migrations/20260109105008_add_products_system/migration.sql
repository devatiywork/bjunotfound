-- CreateEnum
CREATE TYPE "Language" AS ENUM ('RU', 'EN', 'UK', 'ES', 'FR', 'DE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('RUB', 'USD', 'EUR', 'UAH', 'KZT');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_global" (
    "id" TEXT NOT NULL,
    "barcode" TEXT,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "country" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_global_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_global_i18n" (
    "id" TEXT NOT NULL,
    "productGlobalId" TEXT NOT NULL,
    "lang" "Language" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "products_global_i18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_global_per_100" (
    "productGlobalId" TEXT NOT NULL,
    "caloriesKcal" DOUBLE PRECISION NOT NULL,
    "proteinsG" DOUBLE PRECISION NOT NULL,
    "fatsG" DOUBLE PRECISION NOT NULL,
    "carbohydratesG" DOUBLE PRECISION NOT NULL,
    "sugarsG" DOUBLE PRECISION,
    "fiberG" DOUBLE PRECISION,
    "saltG" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_global_per_100_pkey" PRIMARY KEY ("productGlobalId")
);

-- CreateTable
CREATE TABLE "products_user" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productGlobalId" TEXT,
    "barcode" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products_user_i18n" (
    "id" TEXT NOT NULL,
    "productUserId" TEXT NOT NULL,
    "lang" "Language" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "products_user_i18n_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_user_per_100" (
    "productUserId" TEXT NOT NULL,
    "caloriesKcal" DOUBLE PRECISION NOT NULL,
    "proteinsG" DOUBLE PRECISION NOT NULL,
    "fatsG" DOUBLE PRECISION NOT NULL,
    "carbohydratesG" DOUBLE PRECISION NOT NULL,
    "sugarsG" DOUBLE PRECISION,
    "fiberG" DOUBLE PRECISION,
    "saltG" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_user_per_100_pkey" PRIMARY KEY ("productUserId")
);

-- CreateTable
CREATE TABLE "product_user_packages" (
    "id" TEXT NOT NULL,
    "productUserId" TEXT NOT NULL,
    "totalWeightG" DOUBLE PRECISION,
    "totalVolumeMl" DOUBLE PRECISION,
    "priceTotal" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "purchasedAt" TIMESTAMP(3),
    "store" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_user_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_user_servings" (
    "id" TEXT NOT NULL,
    "productUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountUnits" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "weightG" DOUBLE PRECISION,
    "volumeMl" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_user_servings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "brands_normalizedName_key" ON "brands"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "products_global_barcode_key" ON "products_global"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_global_i18n_productGlobalId_lang_key" ON "products_global_i18n"("productGlobalId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "products_user_i18n_productUserId_lang_key" ON "products_user_i18n"("productUserId", "lang");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_global" ADD CONSTRAINT "products_global_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_global" ADD CONSTRAINT "products_global_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_global_i18n" ADD CONSTRAINT "products_global_i18n_productGlobalId_fkey" FOREIGN KEY ("productGlobalId") REFERENCES "products_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_global_per_100" ADD CONSTRAINT "nutrition_global_per_100_productGlobalId_fkey" FOREIGN KEY ("productGlobalId") REFERENCES "products_global"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_user" ADD CONSTRAINT "products_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_user" ADD CONSTRAINT "products_user_productGlobalId_fkey" FOREIGN KEY ("productGlobalId") REFERENCES "products_global"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_user" ADD CONSTRAINT "products_user_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_user" ADD CONSTRAINT "products_user_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_user_i18n" ADD CONSTRAINT "products_user_i18n_productUserId_fkey" FOREIGN KEY ("productUserId") REFERENCES "products_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_user_per_100" ADD CONSTRAINT "nutrition_user_per_100_productUserId_fkey" FOREIGN KEY ("productUserId") REFERENCES "products_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_user_packages" ADD CONSTRAINT "product_user_packages_productUserId_fkey" FOREIGN KEY ("productUserId") REFERENCES "products_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_user_servings" ADD CONSTRAINT "product_user_servings_productUserId_fkey" FOREIGN KEY ("productUserId") REFERENCES "products_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
