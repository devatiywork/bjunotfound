import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetGoalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение активной цели
   */
  async execute(userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { userId, isActive: true },
      orderBy: { startDate: 'desc' },
    });

    return goal;
  }
}
