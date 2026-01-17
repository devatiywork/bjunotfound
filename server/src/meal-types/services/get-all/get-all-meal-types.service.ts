import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetAllMealTypesService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
    // Получаем все активные типы: системные + пользовательские
    const mealTypes = await this.prisma.mealType.findMany({
      where: {
        OR: [
          { userId: null, isActive: true }, // Системные активные
          { userId, isActive: true, isArchived: false }, // Пользовательские активные неархивированные
        ],
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        userId: true,
        code: true,
        name: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return mealTypes;
  }
}
