import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ChangeStatusDto } from '../../dto';

@Injectable()
export class ChangeStatusMealEventService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, eventId: string, dto: ChangeStatusDto) {
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

    // Обновляем статус и записываем время выполнения
    return this.prisma.mealEvent.update({
      where: { id: eventId },
      data: {
        status: dto.status,
        completedAt: new Date(),
      },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
          },
        },
        mealType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
