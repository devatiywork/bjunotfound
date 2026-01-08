import { Injectable } from '@nestjs/common';
import { GoalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetGoalsHistoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение истории целей
   */
  async execute(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    const goalsWithStatus = await Promise.all(
      goals.map(async (goal) => {
        if (goal.isActive && goal.status === GoalStatus.IN_PROGRESS) {
          const updatedGoal = await this.updateGoalStatus(goal);
          return updatedGoal;
        }
        return goal;
      }),
    );

    return goalsWithStatus;
  }

  /**
   * Обновление статуса цели на основе истории веса
   */
  private async updateGoalStatus(goal: any) {
    if (!goal.endDate || new Date(goal.endDate) > new Date()) {
      return goal;
    }

    if (!goal.targetWeight) {
      return this.prisma.goal.update({
        where: { id: goal.id },
        data: {
          status: GoalStatus.COMPLETED,
          isActive: false,
        },
      });
    }

    const finalWeight = await this.prisma.weight.findFirst({
      where: {
        userId: goal.userId,
        date: { lte: goal.endDate },
      },
      orderBy: { date: 'desc' },
    });

    if (!finalWeight) {
      return goal;
    }

    const achieved = Math.abs(finalWeight.weight - goal.targetWeight) <= 2;
    const newStatus = achieved ? GoalStatus.COMPLETED : GoalStatus.FAILED;

    return this.prisma.goal.update({
      where: { id: goal.id },
      data: {
        status: newStatus,
        isActive: false,
      },
    });
  }
}
