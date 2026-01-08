import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateExpiredGoalsService } from '../update-status/update-expired-goals.service';
import { UpdateGoalStatusesService } from '../update-status/update-goal-statuses.service';

@Injectable()
export class GetGoalProgressService {
  constructor(
    private prisma: PrismaService,
    private updateExpiredGoalsService: UpdateExpiredGoalsService,
    private updateGoalStatusesService: UpdateGoalStatusesService,
  ) {}

  async execute(userId: string, goalId: string) {
    // Проверяем статусы перед получением
    await this.updateExpiredGoalsService.execute(userId);

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

    if (!goal.targetWeight || !goal.endDate) {
      throw new BadRequestException(
        'У цели отсутствует целевой вес или дата окончания',
      );
    }

    // Получаем текущий вес
    const latestWeight = await this.prisma.weight.findFirst({
      where: { userId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    if (!latestWeight) {
      throw new BadRequestException('Не найдена запись веса');
    }

    // Обновляем статус на основе текущего веса
    await this.updateGoalStatusesService.execute(userId, latestWeight.weight);

    // Перечитываем цель после обновления
    const updatedGoal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!updatedGoal) {
      throw new NotFoundException('Цель не найдена');
    }

    const today = new Date();
    const startDate = new Date(updatedGoal.startDate);
    const endDate = new Date(updatedGoal.endDate!);

    // Расчет дней
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysPassed = Math.max(
      0,
      Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    );

    // Расчет прогресса по весу
    let initialWeight = updatedGoal.initialWeight;
    if (!initialWeight) {
      const firstWeight = await this.prisma.weight.findFirst({
        where: { userId },
        orderBy: { date: 'asc' },
      });
      initialWeight = firstWeight?.weight || latestWeight.weight;
    }

    const currentWeight = latestWeight.weight;
    const targetWeight = updatedGoal.targetWeight!;

    // Определяем направление цели
    const isWeightLoss = initialWeight > targetWeight;

    const weightToChange = Math.abs(initialWeight - targetWeight);
    let weightChanged = 0;
    let weightRemaining = 0;

    if (isWeightLoss) {
      weightChanged = initialWeight - currentWeight;
      weightRemaining = currentWeight - targetWeight;
    } else {
      weightChanged = currentWeight - initialWeight;
      weightRemaining = targetWeight - currentWeight;
    }

    const progressPercent =
      weightToChange > 0
        ? Math.round((weightChanged / weightToChange) * 100)
        : 0;
    const timeProgressPercent =
      totalDays > 0 ? Math.round((daysPassed / totalDays) * 100) : 0;

    const onTrack =
      progressPercent >= timeProgressPercent && progressPercent >= 0;
    const progressDiff = progressPercent - timeProgressPercent;

    let recommendation = '';
    if (updatedGoal.status === GoalStatus.COMPLETED) {
      recommendation = 'Поздравляем! Цель достигнута! 🎉';
    } else if (updatedGoal.status === GoalStatus.FAILED) {
      recommendation = 'Цель не выполнена в срок.';
    } else if (progressPercent < 0) {
      const direction = isWeightLoss ? 'набрали' : 'сбросили';
      recommendation = `Внимание! Вы ${direction} вес вместо достижения цели. Рекомендуем пересмотреть план питания.`;
    } else if (progressDiff > 10) {
      recommendation = `Отлично! Вы опережаете график на ${progressDiff}%`;
    } else if (progressDiff < -10) {
      recommendation = `Вы отстаёте от графика на ${Math.abs(progressDiff)}%. Рекомендуем пересмотреть план питания.`;
    } else {
      recommendation = 'Вы идёте по графику!';
    }

    return {
      goalId: updatedGoal.id,
      status: updatedGoal.status,
      initialWeight,
      currentWeight,
      targetWeight,
      daysTotal: totalDays,
      daysPassed,
      daysRemaining,
      weightToChange,
      weightChanged,
      weightRemaining: Math.abs(weightRemaining),
      progressPercent,
      timeProgressPercent,
      onTrack,
      recommendation,
      targetCalories: updatedGoal.targetCalories,
    };
  }
}
