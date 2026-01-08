import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DeactivateGoalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Деактивация цели
   */
  async execute(userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { userId, isActive: true },
    });

    if (!goal) {
      throw new NotFoundException('Активная цель не найдена');
    }

    return this.prisma.goal.update({
      where: { id: goal.id },
      data: { isActive: false },
    });
  }
}
