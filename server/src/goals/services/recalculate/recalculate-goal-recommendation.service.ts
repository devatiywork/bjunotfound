import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  calculateAge,
  calculateTargetCalories,
  CalorieCalculationParams,
} from '../../../utils/calorie-calculator';
import { CalorieSettingsService } from '../../../utils/calorie-settings.service';

@Injectable()
export class RecalculateGoalRecommendationService {
  constructor(
    private prisma: PrismaService,
    private calorieSettings: CalorieSettingsService,
  ) {}

  async execute(userId: string, goalId: string) {
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

    if (goal.status !== GoalStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Пересчет доступен только для целей в процессе выполнения',
      );
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

    // Получаем профиль пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        activityLevel: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const age = calculateAge(user.birthDate);

    const params: CalorieCalculationParams = {
      weight: latestWeight.weight,
      height: user.height,
      age,
      gender: user.gender,
      activityCoefficient: user.activityLevel.coefficient,
      formula: user.formulaType,
    };

    // Рассчитываем оставшиеся дни
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const remainingDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (remainingDays <= 0) {
      throw new BadRequestException('Срок цели истек');
    }

    const settings = await this.calorieSettings.getSettings();

    const recommendation = calculateTargetCalories(
      latestWeight.weight,
      goal.targetWeight,
      remainingDays,
      params,
      settings,
    );

    let message = '';
    if (goal.targetCalories === recommendation.targetCalories) {
      message = 'Текущие калории оптимальны, изменение не требуется.';
    } else if (
      goal.targetCalories &&
      recommendation.targetCalories > goal.targetCalories
    ) {
      message = `Рекомендуем увеличить калории на ${recommendation.targetCalories - goal.targetCalories} ккал/день`;
    } else if (
      goal.targetCalories &&
      recommendation.targetCalories < goal.targetCalories
    ) {
      message = `Рекомендуем снизить калории на ${goal.targetCalories - recommendation.targetCalories} ккал/день`;
    }

    return {
      goalId: goal.id,
      currentCalories: goal.targetCalories,
      recommendedCalories: recommendation.targetCalories,
      currentWeight: latestWeight.weight,
      targetWeight: goal.targetWeight,
      remainingDays,
      isRealistic: recommendation.isRealistic,
      warning: recommendation.warning,
      message,
    };
  }
}
