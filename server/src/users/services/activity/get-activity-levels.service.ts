import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetActivityLevelsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение всех уровней активности
   */
  async execute() {
    return this.prisma.activityLevel.findMany({
      orderBy: { coefficient: 'asc' },
    });
  }
}
