import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetLatestWeightService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение последнего веса
   */
  async execute(userId: string) {
    const weight = await this.prisma.weight.findFirst({
      where: {
        userId,
      },
      orderBy: { date: 'desc' },
    });

    return weight;
  }
}
