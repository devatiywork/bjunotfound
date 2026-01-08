import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ArchiveGoalService {
  constructor(private prisma: PrismaService) {}

  async execute(goalId: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Цель не найдена');
    }

    // Проверка прав: пользователь может удалять только свои цели
    if (goal.userId !== userId) {
      throw new NotFoundException('У вас нет прав для удаления этой цели');
    }

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        isArchived: true,
        deletedAt: new Date(),
        deletedBy: userId,
        isActive: false,
      },
    });
  }
}
