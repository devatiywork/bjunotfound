import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ArchiveMealEventService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, eventId: string) {
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
      throw new NotFoundException('Событие уже удалено');
    }

    // Архивируем (мягкое удаление)
    return this.prisma.mealEvent.update({
      where: { id: eventId },
      data: {
        isArchived: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}
