import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetEventsPeriodDto } from '../../dto';

@Injectable()
export class GetMealEventsByPeriodService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, dto: GetEventsPeriodDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    endDate.setHours(23, 59, 59, 999); // Включаем весь последний день

    if (startDate > endDate) {
      throw new BadRequestException(
        'Дата начала не может быть позже даты окончания',
      );
    }

    // Формируем условия фильтрации
    const where: any = {
      userId,
      isArchived: false,
      startAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.mealTypeId) {
      where.mealTypeId = dto.mealTypeId;
    }

    const events = await this.prisma.mealEvent.findMany({
      where,
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            photos: true,
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
      orderBy: { startAt: 'asc' },
    });

    // Считаем статистику
    const summary = {
      totalEvents: events.length,
      planned: events.filter((e) => e.status === 'PLANNED').length,
      completed: events.filter((e) => e.status === 'COMPLETED').length,
      skipped: events.filter((e) => e.status === 'SKIPPED').length,
    };

    return {
      period: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
      events,
      summary,
    };
  }
}
