import { Injectable } from '@nestjs/common';
import { GoalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UpdateGoalStatusesService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, currentWeight: number): Promise<void> {
    // Получаем все цели IN_PROGRESS
    const goalsInProgress = await this.prisma.goal.findMany({
      where: {
        userId,
        status: GoalStatus.IN_PROGRESS,
        isArchived: false,
        targetWeight: { not: null },
      },
    });

    // Проверяем каждую цель на достижение
    for (const goal of goalsInProgress) {
      if (!goal.targetWeight) continue;

      // Определяем направление (похудение или набор)
      const isWeightLoss = goal.initialWeight
        ? goal.initialWeight > goal.targetWeight
        : currentWeight > goal.targetWeight;

      // Проверяем достижение с допуском ±0.5 кг
      const goalReached = isWeightLoss
        ? currentWeight <= goal.targetWeight + 0.5
        : currentWeight >= goal.targetWeight - 0.5;

      if (goalReached) {
        await this.prisma.goal.update({
          where: { id: goal.id },
          data: {
            status: GoalStatus.COMPLETED,
            isActive: false,
          },
        });
      }
    }
  }
}
