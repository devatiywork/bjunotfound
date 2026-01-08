import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  calculateAge,
  calculateTargetCalories,
  CalorieCalculationParams,
} from '../../../utils/calorie-calculator';
import { CalorieSettingsService } from '../../../utils/calorie-settings.service';
import { CalculateCaloriesDto } from '../../dto/calculate-calories.dto';

@Injectable()
export class CalculateCaloriesService {
  constructor(
    private prisma: PrismaService,
    private calorieSettings: CalorieSettingsService,
  ) {}

  async execute(userId: string, calculateCaloriesDto: CalculateCaloriesDto) {
    // Получаем профиль пользователя с уровнем активности
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
    const formula =
      calculateCaloriesDto.formula || user.formulaType || 'MIFFLIN_ST_JEOR';

    const params: CalorieCalculationParams = {
      weight: calculateCaloriesDto.weight,
      height: user.height,
      age,
      gender: user.gender,
      activityCoefficient: user.activityLevel.coefficient,
      formula: formula as any,
    };

    const settings = await this.calorieSettings.getSettings();

    const result = calculateTargetCalories(
      calculateCaloriesDto.weight,
      calculateCaloriesDto.targetWeight,
      calculateCaloriesDto.days,
      params,
      settings,
    );

    return result;
  }
}
