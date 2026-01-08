import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetArchivedGoalsService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: {
        userId,
        isArchived: true,
      },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        targetWeight: true,
        targetCalories: true,
        startDate: true,
        endDate: true,
        isActive: true,
        status: true,
        isArchived: true,
        deletedAt: true,
        deletedBy: true,
      },
    });

    return goals;
  }
}
