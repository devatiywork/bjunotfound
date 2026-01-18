import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProductUserDto } from '../../dto/update-product-user.dto';

@Injectable()
export class UpdateProductUserService {
  constructor(private prisma: PrismaService) {}

  async execute(
    id: string,
    dto: UpdateProductUserDto,
    userId: string,
    isAdmin: boolean,
  ) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${id}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Нет прав для редактирования этого продукта',
      );
    }

    // 3. Проверка связей
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

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand) {
        throw new BadRequestException(`Бренд с ID "${dto.brandId}" не найден`);
      }

      // Разрешаем использовать бренд если:
      // 1. Бренд одобрен модерацией, ИЛИ
      // 2. Бренд создан текущим пользователем (даже если не одобрен)
      if (!brand.isApproved && brand.createdBy !== userId) {
        throw new BadRequestException(
          `Бренд "${brand.name}" не одобрен модерацией`,
        );
      }
    }

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

    // 4. Обновление в транзакции
    const updated = await this.prisma.$transaction(async (tx) => {
      // Обновляем ProductUser
      await tx.productUser.update({
        where: { id },
        data: {
          barcode: dto.barcode !== undefined ? dto.barcode : product.barcode,
          categoryId:
            dto.categoryId !== undefined ? dto.categoryId : product.categoryId,
          brandId: dto.brandId !== undefined ? dto.brandId : product.brandId,
          productGlobalId:
            dto.productGlobalId !== undefined
              ? dto.productGlobalId
              : product.productGlobalId,
        },
      });

      // Обновляем/создаем ProductUserI18n
      if (dto.name || dto.lang) {
        const lang = dto.lang || Language.RU;

        await tx.productUserI18n.upsert({
          where: {
            productUserId_lang: {
              productUserId: id,
              lang,
            },
          },
          create: {
            productUserId: id,
            lang,
            name: dto.name || '',
          },
          update: {
            name: dto.name,
          },
        });
      }

      // Обновляем NutritionUserPer100
      if (dto.nutrition) {
        await tx.nutritionUserPer100.update({
          where: { productUserId: id },
          data: {
            caloriesKcal:
              dto.nutrition.caloriesKcal !== undefined
                ? dto.nutrition.caloriesKcal
                : undefined,
            proteinsG:
              dto.nutrition.proteinsG !== undefined
                ? dto.nutrition.proteinsG
                : undefined,
            fatsG:
              dto.nutrition.fatsG !== undefined
                ? dto.nutrition.fatsG
                : undefined,
            carbohydratesG:
              dto.nutrition.carbohydratesG !== undefined
                ? dto.nutrition.carbohydratesG
                : undefined,
            sugarsG:
              dto.nutrition.sugarsG !== undefined
                ? dto.nutrition.sugarsG
                : undefined,
            fiberG:
              dto.nutrition.fiberG !== undefined
                ? dto.nutrition.fiberG
                : undefined,
            saltG:
              dto.nutrition.saltG !== undefined
                ? dto.nutrition.saltG
                : undefined,
          },
        });
      }

      // Возвращаем обновленный продукт
      return tx.productUser.findUnique({
        where: { id },
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

    return updated;
  }
}
