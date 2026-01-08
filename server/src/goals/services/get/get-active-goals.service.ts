import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateExpiredGoalsService } from '../update-status/update-expired-goals.service';
import { UpdateGoalStatusesService } from '../update-status/update-goal-statuses.service';

@Injectable()
export class GetActiveGoalsService {
  constructor(
    private prisma: PrismaService,
    private updateExpiredGoalsService: UpdateExpiredGoalsService,
    private updateGoalStatusesService: UpdateGoalStatusesService,
  ) {}

  async execute(userId: string) {
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

    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
        isActive: true,
        isArchived: false,
      },
      orderBy: { startDate: 'desc' },
    });

    return goals;
  }
}
