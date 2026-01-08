import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetWeightByPeriodService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение веса за период с разницей
   */
  async execute(userId: string, startDate: Date, endDate: Date) {
    const weights = await this.prisma.weight.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    if (weights.length === 0) {
      return {
        weights: [],
        startWeight: null,
        endWeight: null,
        difference: null,
        period: { start: startDate, end: endDate },
      };
    }

    const startWeight = weights[0].weight;
    const endWeight = weights[weights.length - 1].weight;
    const difference = endWeight - startWeight;

    return {
      weights,
      startWeight,
      endWeight,
      difference,
      period: { start: startDate, end: endDate },
    };
  }
}
