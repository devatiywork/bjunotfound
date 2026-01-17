import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetMealEventByIdService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, eventId: string) {
    const event = await this.prisma.mealEvent.findUnique({
      where: { id: eventId },
      include: {
        dish: {
          select: {
            id: true,
            name: true,
            description: true,
            portions: true,
            photos: true,
            items: {
              include: {
                productUser: {
                  include: {
                    names: true,
                    nutrition: true,
                    packages: {
                      orderBy: { purchasedAt: 'desc' },
                      take: 1,
                    },
                  },
                },
                serving: true,
              },
            },
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

    if (!event) {
      throw new NotFoundException('Событие питания не найдено');
    }

    if (event.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому событию');
    }

    if (event.isArchived) {
      throw new NotFoundException('Событие было удалено');
    }

    // Рассчитываем КБЖУ и цену
    const computed = this.calculateNutrition(event);

    return {
      ...event,
      computed,
    };
  }

  private calculateNutrition(event: any) {
    const dish = event.dish;
    const eventPortions = event.portions;
    const dishPortions = dish.portions || 1;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalPrice = 0;
    const issues: { itemId: string; code: string; message: string }[] = [];

    // Считаем КБЖУ блюда на основе ингредиентов
    for (const item of dish.items || []) {
      const nutrition = item.productUser?.nutrition;
      const resolvedGrams = this.resolveGrams(item);

      if (!nutrition) {
        issues.push({
          itemId: item.id,
          code: 'MISSING_NUTRITION',
          message: `Нет КБЖУ у продукта ${item.productUser?.names?.[0]?.name || 'Неизвестный'}`,
        });
        continue;
      }

      if (resolvedGrams) {
        const k = resolvedGrams / 100;
        totalCalories += nutrition.caloriesKcal * k;
        totalProtein += nutrition.proteinsG * k;
        totalFat += nutrition.fatsG * k;
        totalCarbs += nutrition.carbohydratesG * k;

        // Рассчитываем цену
        const lastPackage = item.productUser?.packages?.[0];
        if (lastPackage && lastPackage.totalWeightG) {
          const pricePerG = lastPackage.priceTotal / lastPackage.totalWeightG;
          totalPrice += resolvedGrams * pricePerG;
        }
      }
    }

    // Пересчитываем на порции события
    const portionMultiplier = eventPortions / dishPortions;

    return {
      perPortion: {
        calories: Math.round((totalCalories / dishPortions) * 10) / 10,
        protein: Math.round((totalProtein / dishPortions) * 10) / 10,
        fat: Math.round((totalFat / dishPortions) * 10) / 10,
        carbs: Math.round((totalCarbs / dishPortions) * 10) / 10,
        price: Math.round((totalPrice / dishPortions) * 100) / 100,
      },
      total: {
        calories: Math.round(totalCalories * portionMultiplier * 10) / 10,
        protein: Math.round(totalProtein * portionMultiplier * 10) / 10,
        fat: Math.round(totalFat * portionMultiplier * 10) / 10,
        carbs: Math.round(totalCarbs * portionMultiplier * 10) / 10,
        price: Math.round(totalPrice * portionMultiplier * 100) / 100,
      },
      issues,
    };
  }

  private resolveGrams(item: any): number | null {
    if (item.measureType === 'GRAMS' && item.amountG) {
      return item.amountG;
    }

    if (item.measureType === 'MILLILITERS' && item.amountMl) {
      return item.amountMl; // Приближение: 1 мл ≈ 1 г
    }

    if (item.measureType === 'SERVINGS' && item.serving && item.servingsCount) {
      if (item.serving.weightG) {
        return item.servingsCount * item.serving.weightG;
      }
      if (item.serving.volumeMl) {
        return item.servingsCount * item.serving.volumeMl;
      }
    }

    return null;
  }
}
