import { Injectable } from '@nestjs/common';
import { MealEventStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { GetPeriodStatsDto } from '../../dto/index.js';
import { getPeriodBoundaries, formatDateInTimezone } from '../../../utils/timezone.utils.js';

interface DayStats {
  date: string;
  events: {
    total: number;
    completed: number;
    skipped: number;
    planned: number;
  };
  calories: number;
}

export interface CalendarStats {
  period: { startDate: string; endDate: string };
  days: DayStats[];
  summary: {
    totalDays: number;
    daysWithEvents: number;
    averageEventsPerDay: number;
    averageCaloriesPerDay: number;
  };
}

@Injectable()
export class GetCalendarStatsService {
  constructor(private prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: GetPeriodStatsDto,
  ): Promise<CalendarStats> {
    // Получаем часовой пояс пользователя из БД
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timezone = user?.timezone || 'UTC';

    const now = new Date();
    const endDate =
      dto.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate =
      dto.startDate || new Date(now.getFullYear(), now.getMonth(), 1);

    // Вычисляем границы периода с учетом часового пояса
    const { startOfPeriod, endOfPeriod } = getPeriodBoundaries(startDate, endDate, timezone);

    const events = await this.prisma.mealEvent.findMany({
      where: {
        userId,
        isArchived: false,
        startAt: { gte: startOfPeriod, lte: endOfPeriod },
      },
      include: {
        dish: {
          include: {
            items: {
              include: {
                productUser: { include: { nutrition: true } },
                serving: true,
              },
            },
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    const dayMap = new Map<
      string,
      { events: any[]; completed: number; skipped: number; planned: number }
    >();

    for (const event of events) {
      const dateKey = formatDateInTimezone(event.startAt, timezone);
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          events: [],
          completed: 0,
          skipped: 0,
          planned: 0,
        });
      }
      const day = dayMap.get(dateKey)!;
      day.events.push(event);
      if (event.status === MealEventStatus.COMPLETED) day.completed++;
      else if (event.status === MealEventStatus.SKIPPED) day.skipped++;
      else day.planned++;
    }

    const days: DayStats[] = [];
    let totalCalories = 0,
      totalEvents = 0;

    const currentDate = new Date(startOfPeriod);
    while (currentDate <= endOfPeriod) {
      const dateKey = formatDateInTimezone(currentDate, timezone);
      const dayData = dayMap.get(dateKey);

      if (dayData) {
        const dayCalories = this.calculateDayCalories(dayData.events);
        totalCalories += dayCalories;
        totalEvents += dayData.events.length;
        days.push({
          date: dateKey,
          events: {
            total: dayData.events.length,
            completed: dayData.completed,
            skipped: dayData.skipped,
            planned: dayData.planned,
          },
          calories: dayCalories,
        });
      } else {
        days.push({
          date: dateKey,
          events: { total: 0, completed: 0, skipped: 0, planned: 0 },
          calories: 0,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const daysWithEvents = days.filter((d) => d.events.total > 0).length;

    return {
      period: {
        startDate: formatDateInTimezone(startDate, timezone),
        endDate: formatDateInTimezone(endDate, timezone),
      },
      days,
      summary: {
        totalDays: days.length,
        daysWithEvents,
        averageEventsPerDay:
          daysWithEvents > 0
            ? Math.round((totalEvents / daysWithEvents) * 10) / 10
            : 0,
        averageCaloriesPerDay:
          daysWithEvents > 0 ? Math.round(totalCalories / daysWithEvents) : 0,
      },
    };
  }

  private calculateDayCalories(events: any[]): number {
    let totalCalories = 0;
    for (const event of events) {
      // КБЖУ считаем для PLANNED и COMPLETED событий (SKIPPED не учитываем)
      if (event.status === MealEventStatus.SKIPPED) continue;
      const dishCalories = this.calculateDishCalories(event.dish);
      const portionRatio = event.portions / event.dish.portions;
      totalCalories += dishCalories * portionRatio;
    }
    return Math.round(totalCalories);
  }

  private calculateDishCalories(dish: any): number {
    let totalCalories = 0;
    for (const item of dish.items || []) {
      const grams = this.resolveGrams(item);
      const nutrition = item.productUser?.nutrition;
      if (!nutrition || grams === 0) continue;
      totalCalories += (nutrition.caloriesKcal * grams) / 100;
    }
    return totalCalories;
  }

  private resolveGrams(item: any): number {
    if (item.amountG !== null) return item.amountG;
    if (item.amountMl !== null) return item.amountMl;
    if (item.servingsCount !== null && item.serving) {
      // Порция может быть в граммах или миллилитрах
      if (item.serving.weightG)
        return item.servingsCount * item.serving.weightG;
      if (item.serving.volumeMl)
        return item.servingsCount * item.serving.volumeMl;
    }
    return 0;
  }
}
