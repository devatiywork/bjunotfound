import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RestoreGoalService {
  constructor(private prisma: PrismaService) {}

  async execute(goalId: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Цель не найдена');
    }

    if (!goal.isArchived) {
      throw new BadRequestException('Цель не архивирована');
    }

    // Проверка прав
    if (goal.userId !== userId) {
      throw new NotFoundException(
        'У вас нет прав для восстановления этой цели',
      );
    }

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        isArchived: false,
        deletedAt: null,
        deletedBy: null,
      },
    });
  }
}
