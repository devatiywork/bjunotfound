import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateGoalDto } from '../../dto/create-goal.dto';

@Injectable()
export class SetGoalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создание новой цели
   */
  async execute(userId: string, createGoalDto: CreateGoalDto) {
    const existingGoal = await this.prisma.goal.findFirst({
      where: { userId, isActive: true },
    });

    if (existingGoal) {
      await this.prisma.goal.update({
        where: { id: existingGoal.id },
        data: { isActive: false },
      });
    }

    // Получаем текущий вес для initialWeight
    const latestWeight = await this.prisma.weight.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const goalData: any = {
      userId,
      targetWeight: createGoalDto.targetWeight,
      targetCalories: createGoalDto.targetCalories,
      targetSteps: createGoalDto.targetSteps,
      targetBurnedCalories: createGoalDto.targetBurnedCalories,
      initialWeight: latestWeight?.weight, // Сохраняем начальный вес
    };

    if (createGoalDto.startDate) {
      goalData.startDate = new Date(createGoalDto.startDate);
    }
    if (createGoalDto.endDate) {
      goalData.endDate = new Date(createGoalDto.endDate);
    }

    return this.prisma.goal.create({
      data: goalData,
    });
  }
}
