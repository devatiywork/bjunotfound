import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface BrandInGroup {
  id: string;
  name: string;
  normalizedName: string;
  country: string | null;
  photos: string[];
  isApproved: boolean;
  rejectedAt: Date | null;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Date;
  createdBy: string;
  creator: {
    id: string;
    email: string;
  };
  productsCount: number;
}

export interface BrandGroup {
  groupId: string;
  brands: BrandInGroup[];
  hasApproved: boolean; // Есть ли уже одобренный бренд в группе
  totalProducts: number; // Общее количество продуктов в группе
}

@Injectable()
export class ListBrandGroupsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Возвращает группы похожих брендов для модерации.
   * Каждая группа содержит бренды, которые можно объединить.
   */
  async execute(): Promise<BrandGroup[]> {
    // 1. Получаем все бренды (pending и approved) с количеством продуктов
    const allBrands = await this.prisma.brand.findMany({
      where: {
        // Не включаем отклонённые
        rejectedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            productsGlobal: true,
            productsUser: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (allBrands.length === 0) {
      return [];
    }

    // 2. Группируем похожие бренды
    const groups: BrandGroup[] = [];
    const processedIds = new Set<string>();

    for (const brand of allBrands) {
      if (processedIds.has(brand.id)) continue;

      // Находим все похожие бренды
      const similarBrands = this.findSimilarBrands(brand, allBrands);

      // Если есть похожие (включая сам бренд)
      if (similarBrands.length > 1 || !brand.isApproved) {
        const brandsInGroup: BrandInGroup[] = similarBrands.map((b) => {
          processedIds.add(b.id);
          return {
            id: b.id,
            name: b.name,
            normalizedName: b.normalizedName,
            country: b.country,
            photos: b.photos,
            isApproved: b.isApproved,
            rejectedAt: b.rejectedAt,
            status: this.getStatus(b),
            createdAt: b.createdAt,
            createdBy: b.createdBy,
            creator: b.creator,
            productsCount: b._count.productsGlobal + b._count.productsUser,
          };
        });

        // Сортируем внутри группы: одобренные первыми, потом по количеству продуктов
        brandsInGroup.sort((a, b) => {
          // Одобренные первыми
          if (a.isApproved !== b.isApproved) {
            return a.isApproved ? -1 : 1;
          }
          // Потом по количеству продуктов (больше = важнее)
          if (a.productsCount !== b.productsCount) {
            return b.productsCount - a.productsCount;
          }
          // Потом по дате создания (старые первые)
          return a.createdAt.getTime() - b.createdAt.getTime();
        });

        const hasApproved = brandsInGroup.some((b) => b.isApproved);
        const totalProducts = brandsInGroup.reduce(
          (sum, b) => sum + b.productsCount,
          0,
        );

        groups.push({
          groupId: `group-${brand.id}`,
          brands: brandsInGroup,
          hasApproved,
          totalProducts,
        });
      } else {
        // Одиночный одобренный бренд без похожих - пропускаем
        processedIds.add(brand.id);
      }
    }

    // 3. Сортируем группы:
    // - Сначала группы БЕЗ одобренного (требуют решения)
    // - Потом группы С одобренным (есть дубликаты к существующему)
    // - Внутри по количеству продуктов
    groups.sort((a, b) => {
      if (a.hasApproved !== b.hasApproved) {
        return a.hasApproved ? 1 : -1;
      }
      return b.totalProducts - a.totalProducts;
    });

    return groups;
  }

  /**
   * Находит все похожие бренды
   */
  private findSimilarBrands(
    brand: { id: string; normalizedName: string },
    allBrands: Array<{
      id: string;
      name: string;
      normalizedName: string;
      country: string | null;
      photos: string[];
      isApproved: boolean;
      rejectedAt: Date | null;
      createdAt: Date;
      createdBy: string;
      creator: { id: string; email: string };
      _count: { productsGlobal: number; productsUser: number };
    }>,
  ) {
    const similar: typeof allBrands = [];

    for (const other of allBrands) {
      if (this.areSimilar(brand.normalizedName, other.normalizedName)) {
        similar.push(other);
      }
    }

    return similar;
  }

  /**
   * Проверяет схожесть двух названий
   */
  private areSimilar(name1: string, name2: string): boolean {
    // 1. Точное совпадение
    if (name1 === name2) return true;

    // 2. Одно содержит другое
    if (name1.includes(name2) || name2.includes(name1)) return true;

    // 3. Расстояние Левенштейна >= 70%
    const distance = this.levenshteinDistance(name1, name2);
    const maxLen = Math.max(name1.length, name2.length);
    const similarity = 1 - distance / maxLen;

    return similarity >= 0.7;
  }

  private getStatus(brand: {
    isApproved: boolean;
    rejectedAt: Date | null;
  }): 'approved' | 'pending' | 'rejected' {
    if (brand.isApproved) return 'approved';
    if (brand.rejectedAt) return 'rejected';
    return 'pending';
  }

  /**
   * Расстояние Левенштейна
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost,
        );
      }
    }

    return dp[m][n];
  }
}
