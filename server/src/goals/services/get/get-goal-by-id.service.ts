import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateExpiredGoalsService } from '../update-status/update-expired-goals.service';
import { UpdateGoalStatusesService } from '../update-status/update-goal-statuses.service';

@Injectable()
export class GetGoalByIdService {
  constructor(
    private prisma: PrismaService,
    private updateExpiredGoalsService: UpdateExpiredGoalsService,
    private updateGoalStatusesService: UpdateGoalStatusesService,
  ) {}

  async execute(userId: string, goalId: string) {
    // Проверяем просроченные цели перед выборкой
    await this.updateExpiredGoalsService.execute(userId);

    // Получаем последний вес для проверки достижения цели
    const latestWeight = await this.prisma.weight.findFirst({
      where: { userId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    if (latestWeight) {
      await this.updateGoalStatusesService.execute(userId, latestWeight.weight);
    }

    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        isArchived: false,
      },
    });

    if (!goal) {
      throw new NotFoundException('Цель не найдена');
    }

    return goal;
  }
}
