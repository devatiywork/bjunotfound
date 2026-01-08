import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetAvailablePeriodService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение доступного периода данных
   */
  async execute(userId: string) {
    const firstWeight = await this.prisma.weight.findFirst({
      where: {
        userId,
      },
      orderBy: { date: 'asc' },
    });

    if (!firstWeight) {
      return {
        start: null,
        end: null,
        hasData: false,
      };
    }

    return {
      start: firstWeight.date,
      end: new Date(),
      hasData: true,
    };
  }
}
