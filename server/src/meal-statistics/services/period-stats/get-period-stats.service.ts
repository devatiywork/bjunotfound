import { Injectable } from '@nestjs/common';
import { MealEventStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { GetPeriodStatsDto } from '../../dto/index.js';

interface NutritionTotals {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface PeriodStats {
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  events: {
    total: number;
    completed: number;
    skipped: number;
    planned: number;
    completionRate: number;
  };
  nutrition: {
    total: NutritionTotals;
    averagePerDay: NutritionTotals;
  };
  dishes: {
    uniqueCount: number;
    mostFrequent: Array<{
      dishId: string;
      dishName: string;
      count: number;
    }>;
  };
}

@Injectable()
export class GetPeriodStatsService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, dto: GetPeriodStatsDto): Promise<PeriodStats> {
    const endDate = dto.endDate || new Date();
    const startDate =
      dto.startDate || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await this.prisma.mealEvent.findMany({
      where: {
        userId,
        isArchived: false,
        startAt: { gte: startOfDay, lte: endOfDay },
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
    });

    const completed = events.filter(
      (e) => e.status === MealEventStatus.COMPLETED,
    ).length;
    const skipped = events.filter(
      (e) => e.status === MealEventStatus.SKIPPED,
    ).length;
    const planned = events.filter(
      (e) => e.status === MealEventStatus.PLANNED,
    ).length;

    // КБЖУ считаем для PLANNED и COMPLETED событий (SKIPPED не учитываем)
    const nutritionEvents = events.filter(
      (e) => e.status !== MealEventStatus.SKIPPED,
    );
    const nutritionTotals = this.calculateTotalNutrition(nutritionEvents);

    const totalDays = Math.max(
      1,
      Math.ceil(
        (endOfDay.getTime() - startOfDay.getTime()) / (24 * 60 * 60 * 1000),
      ),
    );

    const averagePerDay: NutritionTotals = {
      calories: Math.round(nutritionTotals.calories / totalDays),
      proteins: Math.round((nutritionTotals.proteins / totalDays) * 10) / 10,
      fats: Math.round((nutritionTotals.fats / totalDays) * 10) / 10,
      carbs: Math.round((nutritionTotals.carbs / totalDays) * 10) / 10,
    };

    const dishCounts = new Map<string, { name: string; count: number }>();
    for (const event of events) {
      const existing = dishCounts.get(event.dishId);
      if (existing) {
        existing.count++;
      } else {
        dishCounts.set(event.dishId, { name: event.dish.name, count: 1 });
      }
    }

    const mostFrequent = Array.from(dishCounts.entries())
      .map(([dishId, data]) => ({
        dishId,
        dishName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      period: {
        startDate: startOfDay.toISOString().split('T')[0],
        endDate: endOfDay.toISOString().split('T')[0],
        totalDays,
      },
      events: {
        total: events.length,
        completed,
        skipped,
        planned,
        completionRate:
          events.length > 0 ? Math.round((completed / events.length) * 100) : 0,
      },
      nutrition: { total: nutritionTotals, averagePerDay },
      dishes: { uniqueCount: dishCounts.size, mostFrequent },
    };
  }

  private calculateTotalNutrition(events: any[]): NutritionTotals {
    let calories = 0,
      proteins = 0,
      fats = 0,
      carbs = 0;

    for (const event of events) {
      const dishNutrition = this.calculateDishNutrition(event.dish);
      const portionRatio = event.portions / event.dish.portions;
      calories += dishNutrition.calories * portionRatio;
      proteins += dishNutrition.proteins * portionRatio;
      fats += dishNutrition.fats * portionRatio;
      carbs += dishNutrition.carbs * portionRatio;
    }

    return {
      calories: Math.round(calories),
      proteins: Math.round(proteins * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
    };
  }

  private calculateDishNutrition(dish: any): NutritionTotals {
    let totalCalories = 0,
      totalProteins = 0,
      totalFats = 0,
      totalCarbs = 0;

    for (const item of dish.items || []) {
      const grams = this.resolveGrams(item);
      const nutrition = item.productUser?.nutrition;
      if (!nutrition || grams === 0) continue;

      const multiplier = grams / 100;
      totalCalories += nutrition.caloriesKcal * multiplier;
      totalProteins += nutrition.proteinsG * multiplier;
      totalFats += nutrition.fatsG * multiplier;
      totalCarbs += nutrition.carbohydratesG * multiplier;
    }

    return {
      calories: Math.round(totalCalories),
      proteins: Math.round(totalProteins * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
    };
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
