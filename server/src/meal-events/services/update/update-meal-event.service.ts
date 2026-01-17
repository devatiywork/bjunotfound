import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateMealEventDto } from '../../dto';

@Injectable()
export class UpdateMealEventService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, eventId: string, dto: UpdateMealEventDto) {
    // Проверяем существование события
    const event = await this.prisma.mealEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Событие питания не найдено');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому событию');
    }

    if (event.isArchived) {
      throw new NotFoundException('Событие было удалено');
    }

    // Проверяем блюдо, если меняется
    if (dto.dishId && dto.dishId !== event.dishId) {
      const dish = await this.prisma.dish.findFirst({
        where: { id: dto.dishId, userId, isArchived: false },
      });

      if (!dish) {
        throw new NotFoundException('Блюдо не найдено');
      }
    }

    // Проверяем тип приема пищи, если меняется
    if (dto.mealTypeId && dto.mealTypeId !== event.mealTypeId) {
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

    // Обновляем событие
    return this.prisma.mealEvent.update({
      where: { id: eventId },
      data: {
        startAt: dto.startAt ? new Date(dto.startAt) : undefined,
        dishId: dto.dishId,
        portions: dto.portions,
        mealTypeId: dto.mealTypeId,
        note: dto.note,
        timezone: dto.timezone,
      },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            portions: true,
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
