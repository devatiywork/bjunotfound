import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  calculateAge,
  CalorieCalculationParams,
  generateGoalPaceOptions,
} from '../../../utils/calorie-calculator';
import { CalorieSettingsService } from '../../../utils/calorie-settings.service';
import { CalculateGoalPaceDto } from '../../dto/calculate-goal-pace.dto';

@Injectable()
export class CalculateGoalPaceService {
  constructor(
    private prisma: PrismaService,
    private calorieSettings: CalorieSettingsService,
  ) {}

  async execute(userId: string, calculateGoalPaceDto: CalculateGoalPaceDto) {
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

    // Получаем последнюю запись веса
    const latestWeight = await this.prisma.weight.findFirst({
      where: { userId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });

    if (!latestWeight) {
      throw new BadRequestException(
        'Не найдена запись веса. Добавьте текущий вес перед расчетом цели.',
      );
    }

    const age = calculateAge(user.birthDate);
    const formula =
      calculateGoalPaceDto.formula || user.formulaType || 'MIFFLIN_ST_JEOR';
    const startDate = calculateGoalPaceDto.startDate
      ? new Date(calculateGoalPaceDto.startDate)
      : new Date();

    const params: CalorieCalculationParams = {
      weight: latestWeight.weight,
      height: user.height,
      age,
      gender: user.gender,
      activityCoefficient: user.activityLevel.coefficient,
      formula: formula as any,
    };

    const settings = await this.calorieSettings.getSettings();
    const weightDifference =
      latestWeight.weight - calculateGoalPaceDto.targetWeight;
    const isWeightLoss = weightDifference > 0;

    // Получаем конфигурации темпа из БД
    const paceConfigs = isWeightLoss
      ? await this.calorieSettings.getWeightLossPaceConfigs()
      : await this.calorieSettings.getWeightGainPaceConfigs();

    const options = generateGoalPaceOptions(
      latestWeight.weight,
      calculateGoalPaceDto.targetWeight,
      startDate,
      params,
      settings,
      paceConfigs,
      user.activityLevelId,
      latestWeight.weight,
    );

    return {
      currentWeight: latestWeight.weight,
      targetWeight: calculateGoalPaceDto.targetWeight,
      startDate,
      options,
    };
  }
}
