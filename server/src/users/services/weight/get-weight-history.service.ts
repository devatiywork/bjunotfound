import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetWeightHistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение истории веса
   */
  async execute(userId: string) {
    const weights = await this.prisma.weight.findMany({
      where: {
        userId,
      },
      orderBy: [
        { date: 'desc' },
        { id: 'desc' }, // Для записей с одинаковой датой - по ID
      ],
      take: 50,
    });

    return weights;
  }
}
