import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMealEventDto } from '../../dto';

@Injectable()
export class CreateMealEventService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, dto: CreateMealEventDto) {
    // Проверяем существование блюда
    const dish = await this.prisma.dish.findFirst({
      where: { id: dto.dishId, userId, isArchived: false },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверяем существование типа приема пищи (если указан)
    if (dto.mealTypeId) {
      const mealType = await this.prisma.mealType.findFirst({
        where: {
          id: dto.mealTypeId,
          OR: [{ userId: null }, { userId, isArchived: false }],
          isActive: true,
        },
      });

      if (!mealType) {
        throw new NotFoundException('Тип приема пищи не найден');
      }
    }

    // Создаем событие
    return this.prisma.mealEvent.create({
      data: {
        userId,
        startAt: new Date(dto.startAt),
        dishId: dto.dishId,
        portions: dto.portions,
        mealTypeId: dto.mealTypeId || null,
        note: dto.note || null,
        timezone: dto.timezone || null,
        status: 'PLANNED',
      },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            portions: true,
            photos: true,
          },
        },
        mealType: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }
}
