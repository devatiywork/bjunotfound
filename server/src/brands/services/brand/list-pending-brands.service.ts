import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface PotentialDuplicate {
  id: string;
  name: string;
  normalizedName: string;
  isApproved: boolean;
  rejectedAt: Date | null;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Date;
  similarity: 'exact' | 'high' | 'medium';
  reason: string;
}

export interface PendingBrandWithDuplicates {
  id: string;
  name: string;
  normalizedName: string;
  country: string | null;
  photos: string[];
  createdBy: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    email: string;
  };
  potentialDuplicates: PotentialDuplicate[];
}

@Injectable()
export class ListPendingBrandsService {
  constructor(private prisma: PrismaService) {}

  async execute(): Promise<PendingBrandWithDuplicates[]> {
    // 1. Получаем бренды на модерации
    const pendingBrands = await this.prisma.brand.findMany({
      where: {
        isApproved: false,
        rejectedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (pendingBrands.length === 0) {
      return [];
    }

    // 2. Получаем все существующие бренды для поиска дубликатов
    const allBrands = await this.prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        normalizedName: true,
        isApproved: true,
        rejectedAt: true,
        createdAt: true,
      },
    });

    // 3. Для каждого pending бренда ищем дубликаты
    const result: PendingBrandWithDuplicates[] = pendingBrands.map((brand) => {
      const duplicates = this.findPotentialDuplicates(brand, allBrands);

      return {
        ...brand,
        potentialDuplicates: duplicates,
      };
    });

    // 4. Сортируем: сначала бренды с дубликатами
    result.sort((a, b) => {
      const aHasDuplicates = a.potentialDuplicates.length > 0 ? 0 : 1;
      const bHasDuplicates = b.potentialDuplicates.length > 0 ? 0 : 1;
      if (aHasDuplicates !== bHasDuplicates) {
        return aHasDuplicates - bHasDuplicates;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return result;
  }

  /**
   * Поиск потенциальных дубликатов для бренда
   */
  private findPotentialDuplicates(
    brand: { id: string; name: string; normalizedName: string },
    allBrands: {
      id: string;
      name: string;
      normalizedName: string;
      isApproved: boolean;
      rejectedAt: Date | null;
      createdAt: Date;
    }[],
  ): PotentialDuplicate[] {
    const duplicates: PotentialDuplicate[] = [];

    // Хелпер для определения статуса
    const getStatus = (b: {
      isApproved: boolean;
      rejectedAt: Date | null;
    }): 'approved' | 'pending' | 'rejected' => {
      if (b.isApproved) return 'approved';
      if (b.rejectedAt) return 'rejected';
      return 'pending';
    };

    for (const other of allBrands) {
      // Пропускаем сам бренд
      if (other.id === brand.id) continue;

      // 1. Точное совпадение normalizedName
      if (other.normalizedName === brand.normalizedName) {
        duplicates.push({
          ...other,
          status: getStatus(other),
          similarity: 'exact',
          reason: 'Точное совпадение нормализованного названия',
        });
        continue;
      }

      // 2. Один содержит другой (подстрока)
      if (
        other.normalizedName.includes(brand.normalizedName) ||
        brand.normalizedName.includes(other.normalizedName)
      ) {
        duplicates.push({
          ...other,
          status: getStatus(other),
          similarity: 'high',
          reason: 'Одно название содержит другое',
        });
        continue;
      }

      // 3. Расстояние Левенштейна (для коротких названий)
      const distance = this.levenshteinDistance(
        brand.normalizedName,
        other.normalizedName,
      );
      const maxLen = Math.max(
        brand.normalizedName.length,
        other.normalizedName.length,
      );
      const similarity = 1 - distance / maxLen;

      // Высокая схожесть (> 80%)
      if (similarity >= 0.8) {
        duplicates.push({
          ...other,
          status: getStatus(other),
          similarity: 'high',
          reason: `Схожесть названий: ${Math.round(similarity * 100)}%`,
        });
        continue;
      }

      // Средняя схожесть (> 60%) - только для коротких названий
      if (similarity >= 0.6 && maxLen <= 15) {
        duplicates.push({
          ...other,
          status: getStatus(other),
          similarity: 'medium',
          reason: `Возможное сходство: ${Math.round(similarity * 100)}%`,
        });
      }
    }

    // Сортируем: сначала exact, потом high, потом medium
    // Внутри группы - одобренные первыми
    duplicates.sort((a, b) => {
      const order = { exact: 0, high: 1, medium: 2 };
      if (order[a.similarity] !== order[b.similarity]) {
        return order[a.similarity] - order[b.similarity];
      }
      // Одобренные бренды важнее (уже есть в системе)
      if (a.isApproved !== b.isApproved) {
        return a.isApproved ? -1 : 1;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return duplicates;
  }

  /**
   * Расстояние Левенштейна между двумя строками
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Оптимизация для пустых строк
    if (m === 0) return n;
    if (n === 0) return m;

    // Матрица расстояний
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // удаление
          dp[i][j - 1] + 1, // вставка
          dp[i - 1][j - 1] + cost, // замена
        );
      }
    }

    return dp[m][n];
  }
}
