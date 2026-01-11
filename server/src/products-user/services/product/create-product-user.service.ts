import { BadRequestException, Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductUserDto } from '../../dto/create-product-user.dto';

@Injectable()
export class CreateProductUserService {
  constructor(private prisma: PrismaService) {}

  async execute(dto: CreateProductUserDto, userId: string) {
    // 1. Проверка categoryId
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(
          `Категория с ID "${dto.categoryId}" не найдена`,
        );
      }
    }

    // 2. Проверка brandId
    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new BadRequestException(`Бренд с ID "${dto.brandId}" не найден`);
      }

      if (!brand.isApproved) {
        throw new BadRequestException(
          `Бренд "${brand.name}" не одобрен модерацией`,
        );
      }
    }

    // 3. Проверка productGlobalId
    if (dto.productGlobalId) {
      const productGlobal = await this.prisma.productGlobal.findUnique({
        where: { id: dto.productGlobalId },
      });

      if (!productGlobal) {
        throw new BadRequestException(
          `Глобальный продукт с ID "${dto.productGlobalId}" не найден`,
        );
      }
    }

    // 4. Создание продукта + i18n + nutrition в транзакции
    const product = await this.prisma.$transaction(async (tx) => {
      // Создаем ProductUser
      const createdProduct = await tx.productUser.create({
        data: {
          userId,
          barcode: dto.barcode || null,
          categoryId: dto.categoryId || null,
          brandId: dto.brandId || null,
          productGlobalId: dto.productGlobalId || null,
        },
      });

      // Создаем ProductUserI18n
      await tx.productUserI18n.create({
        data: {
          productUserId: createdProduct.id,
          lang: dto.lang || Language.RU,
          name: dto.name,
        },
      });

      // Создаем NutritionUserPer100
      await tx.nutritionUserPer100.create({
        data: {
          productUserId: createdProduct.id,
          caloriesKcal: dto.nutrition.caloriesKcal,
          proteinsG: dto.nutrition.proteinsG,
          fatsG: dto.nutrition.fatsG,
          carbohydratesG: dto.nutrition.carbohydratesG,
          sugarsG: dto.nutrition.sugarsG || null,
          fiberG: dto.nutrition.fiberG || null,
          saltG: dto.nutrition.saltG || null,
        },
      });

      // Возвращаем продукт со всеми связями
      return tx.productUser.findUnique({
        where: { id: createdProduct.id },
        include: {
          names: true,
          nutrition: true,
          category: true,
          brand: true,
          productGlobal: {
            include: {
              names: true,
              nutrition: true,
            },
          },
        },
      });
    });

    return product;
  }
}
