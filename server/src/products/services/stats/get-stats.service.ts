import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить статистику продуктов (только для админов)
   */
  async execute() {
    const [total, bySource, byCategory, recentCount] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.groupBy({
        by: ['source'],
        _count: true,
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        _count: true,
        orderBy: {
          _count: {
            categoryId: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.product.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // последние 7 дней
          },
        },
      }),
    ]);

    return {
      total,
      bySource,
      topCategories: byCategory,
      recentlyAdded: recentCount,
    };
  }
}
