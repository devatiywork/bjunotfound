import { Injectable } from '@nestjs/common';
import { MealEventStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { GetDailyNutritionDto } from '../../dto/index.js';
import { getDayBoundaries, formatDateInTimezone } from '../../../utils/timezone.utils.js';

interface MealNutrition {
  mealTypeId: string | null;
  mealTypeName: string | null;
  events: Array<{
    eventId: string;
    dishId: string;
    dishName: string;
    portions: number;
    status: MealEventStatus;
    startAt: string;
    nutrition: {
      calories: number;
      proteins: number;
      fats: number;
      carbs: number;
    };
  }>;
  totals: { calories: number; proteins: number; fats: number; carbs: number };
}

export interface DailyNutrition {
  date: string;
  meals: MealNutrition[];
  totals: {
    consumed: {
      calories: number;
      proteins: number;
      fats: number;
      carbs: number;
    };
    planned: {
      calories: number;
      proteins: number;
      fats: number;
      carbs: number;
    };
  };
  goal: {
    calories: number | null;
    proteins: number | null;
    fats: number | null;
    carbs: number | null;
  } | null;
  remaining: {
    calories: number | null;
    proteins: number | null;
    fats: number | null;
    carbs: number | null;
  } | null;
}

@Injectable()
export class GetDailyNutritionService {
  constructor(private prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: GetDailyNutritionDto,
  ): Promise<DailyNutrition> {
    // Получаем часовой пояс пользователя из БД
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const timezone = user?.timezone || 'UTC';

    const { startOfDay, endOfDay } = getDayBoundaries(dto.date, timezone);

    const events = await this.prisma.mealEvent.findMany({
      where: {
        userId,
        isArchived: false,
        startAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        mealType: true,
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

    const activeGoal = await this.prisma.goal.findFirst({
      where: { userId, isActive: true, isArchived: false },
    });

    const mealMap = new Map<string | null, any[]>();
    for (const event of events) {
      const key = event.mealTypeId;
      if (!mealMap.has(key)) mealMap.set(key, []);
      mealMap.get(key)!.push(event);
    }

    const mealTypes = await this.prisma.mealType.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
        isActive: true,
        isArchived: false,
      },
      orderBy: { sortOrder: 'asc' },
    });

    const meals: MealNutrition[] = [];
    let consumedCalories = 0,
      consumedProteins = 0,
      consumedFats = 0,
      consumedCarbs = 0;
    let plannedCalories = 0,
      plannedProteins = 0,
      plannedFats = 0,
      plannedCarbs = 0;

    for (const mealType of mealTypes) {
      const mealEvents = mealMap.get(mealType.id);
      if (!mealEvents) continue;

      const mealNutrition = this.buildMealNutrition(
        mealType.id,
        mealType.name,
        mealEvents,
      );
      meals.push(mealNutrition);

      for (const evt of mealEvents) {
        const nutrition = this.calculateEventNutrition(evt);
        if (evt.status === MealEventStatus.COMPLETED) {
          consumedCalories += nutrition.calories;
          consumedProteins += nutrition.proteins;
          consumedFats += nutrition.fats;
          consumedCarbs += nutrition.carbs;
        } else if (evt.status === MealEventStatus.PLANNED) {
          plannedCalories += nutrition.calories;
          plannedProteins += nutrition.proteins;
          plannedFats += nutrition.fats;
          plannedCarbs += nutrition.carbs;
        }
      }
      mealMap.delete(mealType.id);
    }

    const noTypeEvents = mealMap.get(null);
    if (noTypeEvents && noTypeEvents.length > 0) {
      const mealNutrition = this.buildMealNutrition(null, null, noTypeEvents);
      meals.push(mealNutrition);

      for (const evt of noTypeEvents) {
        const nutrition = this.calculateEventNutrition(evt);
        if (evt.status === MealEventStatus.COMPLETED) {
          consumedCalories += nutrition.calories;
          consumedProteins += nutrition.proteins;
          consumedFats += nutrition.fats;
          consumedCarbs += nutrition.carbs;
        } else if (evt.status === MealEventStatus.PLANNED) {
          plannedCalories += nutrition.calories;
          plannedProteins += nutrition.proteins;
          plannedFats += nutrition.fats;
          plannedCarbs += nutrition.carbs;
        }
      }
    }

    const goal = activeGoal
      ? {
          calories: activeGoal.targetCalories,
          proteins: null,
          fats: null,
          carbs: null,
        }
      : null;

    const remaining = goal?.calories
      ? {
          calories: goal.calories - consumedCalories,
          proteins: null,
          fats: null,
          carbs: null,
        }
      : null;

    return {
      date: formatDateInTimezone(dto.date || new Date(), timezone),
      meals,
      totals: {
        consumed: {
          calories: Math.round(consumedCalories),
          proteins: Math.round(consumedProteins * 10) / 10,
          fats: Math.round(consumedFats * 10) / 10,
          carbs: Math.round(consumedCarbs * 10) / 10,
        },
        planned: {
          calories: Math.round(plannedCalories),
          proteins: Math.round(plannedProteins * 10) / 10,
          fats: Math.round(plannedFats * 10) / 10,
          carbs: Math.round(plannedCarbs * 10) / 10,
        },
      },
      goal,
      remaining,
    };
  }

  private buildMealNutrition(
    mealTypeId: string | null,
    mealTypeName: string | null,
    events: any[],
  ): MealNutrition {
    const eventData: MealNutrition['events'] = [];
    let totalCalories = 0,
      totalProteins = 0,
      totalFats = 0,
      totalCarbs = 0;

    for (const evt of events) {
      const nutrition = this.calculateEventNutrition(evt);
      eventData.push({
        eventId: evt.id,
        dishId: evt.dishId,
        dishName: evt.dish.name,
        portions: evt.portions,
        status: evt.status,
        startAt: evt.startAt.toISOString(),
        nutrition,
      });

      if (evt.status === MealEventStatus.COMPLETED) {
        totalCalories += nutrition.calories;
        totalProteins += nutrition.proteins;
        totalFats += nutrition.fats;
        totalCarbs += nutrition.carbs;
      }
    }

    return {
      mealTypeId,
      mealTypeName,
      events: eventData,
      totals: {
        calories: Math.round(totalCalories),
        proteins: Math.round(totalProteins * 10) / 10,
        fats: Math.round(totalFats * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
      },
    };
  }

  private calculateEventNutrition(event: any): {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
  } {
    const dishNutrition = this.calculateDishNutrition(event.dish);
    const portionRatio = event.portions / event.dish.portions;

    return {
      calories: Math.round(dishNutrition.calories * portionRatio),
      proteins: Math.round(dishNutrition.proteins * portionRatio * 10) / 10,
      fats: Math.round(dishNutrition.fats * portionRatio * 10) / 10,
      carbs: Math.round(dishNutrition.carbs * portionRatio * 10) / 10,
    };
  }

  private calculateDishNutrition(dish: any): {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
  } {
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
