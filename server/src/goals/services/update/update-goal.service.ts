import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateGoalDto } from '../../dto/update-goal.dto';

@Injectable()
export class UpdateGoalService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, goalId: string, updateGoalDto: UpdateGoalDto) {
    // Проверяем существование цели
    const existingGoal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
        isArchived: false,
      },
    });

    if (!existingGoal) {
      throw new NotFoundException('Цель не найдена');
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id: goalId },
      data: updateGoalDto,
    });

    return updatedGoal;
  }
}
