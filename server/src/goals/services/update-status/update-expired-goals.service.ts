import { Injectable } from '@nestjs/common';
import { GoalStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UpdateExpiredGoalsService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string): Promise<void> {
    const today = new Date();

    await this.prisma.goal.updateMany({
      where: {
        userId,
        status: GoalStatus.IN_PROGRESS,
        isArchived: false,
        endDate: { lt: today },
      },
      data: {
        status: GoalStatus.FAILED,
        isActive: false,
      },
    });
  }
}
