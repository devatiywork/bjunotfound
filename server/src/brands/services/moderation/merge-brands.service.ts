import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface MergeResult {
  approvedBrand: {
    id: string;
    name: string;
  };
  rejectedBrands: Array<{
    id: string;
    name: string;
    productsUserMigrated: number;
    productsGlobalMigrated: number;
  }>;
  totalProductsMigrated: number;
}

@Injectable()
export class MergeBrandsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Объединяет несколько брендов в один:
   * 1. Одобряет выбранный бренд (targetBrandId)
   * 2. Переносит все продукты с других брендов на целевой
   * 3. Отклоняет остальные бренды
   *
   * @param targetBrandId - ID бренда, который будет одобрен
   * @param brandIdsToMerge - ID брендов для объединения (включая targetBrandId)
   * @param adminId - ID администратора
   */
  async execute(
    targetBrandId: string,
    brandIdsToMerge: string[],
    adminId: string,
  ): Promise<MergeResult> {
    // 1. Валидация: targetBrandId должен быть в списке
    if (!brandIdsToMerge.includes(targetBrandId)) {
      throw new BadRequestException(
        'Целевой бренд должен быть в списке объединяемых брендов',
      );
    }

    // 2. Проверяем существование всех брендов
    const brands = await this.prisma.brand.findMany({
      where: {
        id: { in: brandIdsToMerge },
      },
      include: {
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
    });

    if (brands.length !== brandIdsToMerge.length) {
      const foundIds = brands.map((b) => b.id);
      const missingIds = brandIdsToMerge.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Бренды не найдены: ${missingIds.join(', ')}`,
      );
    }

    const targetBrand = brands.find((b) => b.id === targetBrandId);
    const brandsToReject = brands.filter((b) => b.id !== targetBrandId);

    // 3. Проверяем, что целевой бренд не отклонён
    if (targetBrand!.rejectedAt) {
      throw new BadRequestException(
        `Нельзя одобрить отклонённый бренд "${targetBrand!.name}"`,
      );
    }

    // 4. Выполняем объединение в транзакции
    const result = await this.prisma.$transaction(async (tx) => {
      const rejectedResults: MergeResult['rejectedBrands'] = [];
      let totalMigrated = 0;

      // 4.1. Для каждого бренда (кроме целевого) - переносим продукты
      for (const brand of brandsToReject) {
        // Переносим пользовательские продукты
        const userProductsResult = await tx.productUser.updateMany({
          where: { brandId: brand.id },
          data: { brandId: targetBrandId },
        });

        // Переносим глобальные продукты
        const globalProductsResult = await tx.productGlobal.updateMany({
          where: { brandId: brand.id },
          data: { brandId: targetBrandId },
        });

        const migratedCount =
          userProductsResult.count + globalProductsResult.count;
        totalMigrated += migratedCount;

        rejectedResults.push({
          id: brand.id,
          name: brand.name,
          productsUserMigrated: userProductsResult.count,
          productsGlobalMigrated: globalProductsResult.count,
        });

        // 4.2. Отклоняем бренд
        await tx.brand.update({
          where: { id: brand.id },
          data: {
            rejectedAt: new Date(),
            rejectionReason: `Объединён с брендом "${targetBrand!.name}" (ID: ${targetBrandId})`,
          },
        });
      }

      // 4.3. Одобряем целевой бренд (если ещё не одобрен)
      if (!targetBrand!.isApproved) {
        await tx.brand.update({
          where: { id: targetBrandId },
          data: {
            isApproved: true,
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        });
      }

      return {
        approvedBrand: {
          id: targetBrand!.id,
          name: targetBrand!.name,
        },
        rejectedBrands: rejectedResults,
        totalProductsMigrated: totalMigrated,
      };
    });

    return result;
  }
}
