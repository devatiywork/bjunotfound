import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DishIssue, DishResponse } from '../../types/dish-response.types';
import {
  CalculateDishNutritionService,
  CalculateNutritionInput,
} from '../calculation/calculate-dish-nutrition.service';
import {
  CalculateDishPriceService,
  CalculatePriceInput,
} from '../calculation/calculate-dish-price.service';

/**
 * Сервис для получения блюда с полными расчетами КБЖУ и цены
 */
@Injectable()
export class GetDishService {
  constructor(
    private prisma: PrismaService,
    private nutritionService: CalculateDishNutritionService,
    private priceService: CalculateDishPriceService,
  ) {}

  /**
   * Получает блюдо по ID с расчетами КБЖУ и цены
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @returns Полный ответ с блюдом, ингредиентами, расчетами и issues
   */
  async execute(userId: string, dishId: string): Promise<DishResponse> {
    // Получаем блюдо с ингредиентами, продуктами, nutrition и покупками
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            productUser: {
              include: {
                names: true,
                nutrition: true,
                packages: {
                  orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }],
                },
              },
            },
            serving: true,
          },
        },
      },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверка владельца
    if (dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Расчет КБЖУ
    const nutritionInput: CalculateNutritionInput = {
      items: dish.items as any,
      portions: dish.portions,
    };

    const nutritionResult = this.nutritionService.execute(nutritionInput);

    // Расчет цены
    const priceInput: CalculatePriceInput = {
      items: dish.items as any,
      portions: dish.portions,
    };

    const priceResult = this.priceService.execute(priceInput);

    // Объединяем issues
    const allIssues: DishIssue[] = [
      ...nutritionResult.issues,
      ...priceResult.issues,
    ];

    // Формируем ответ
    return {
      dish: {
        id: dish.id,
        userId: dish.userId,
        name: dish.name,
        description: dish.description,
        portions: dish.portions,
        photos: dish.photos,
        status: dish.status,
        isArchived: dish.isArchived,
        createdAt: dish.createdAt,
        updatedAt: dish.updatedAt,
      },
      items: dish.items.map((item) => ({
        id: item.id,
        dishId: item.dishId,
        productUserId: item.productUserId,
        sortOrder: item.sortOrder,
        note: item.note,
        measureType: item.measureType,
        amountG: item.amountG,
        amountMl: item.amountMl,
        servingId: item.servingId,
        servingsCount: item.servingsCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        productUser: {
          id: item.productUser.id,
          names: item.productUser.names.map((n) => ({
            lang: n.lang,
            name: n.name,
          })),
          nutrition: item.productUser.nutrition
            ? {
                caloriesKcal: item.productUser.nutrition.caloriesKcal,
                proteinsG: item.productUser.nutrition.proteinsG,
                fatsG: item.productUser.nutrition.fatsG,
                carbohydratesG: item.productUser.nutrition.carbohydratesG,
              }
            : null,
          packages: item.productUser.packages.map((p) => ({
            id: p.id,
            totalWeightG: p.totalWeightG,
            totalVolumeMl: p.totalVolumeMl,
            priceTotal: p.priceTotal,
            currency: p.currency,
            purchasedAt: p.purchasedAt,
            createdAt: p.createdAt,
          })),
        },
        serving: item.serving
          ? {
              id: item.serving.id,
              name: item.serving.name,
              amountUnits: item.serving.amountUnits,
              weightG: item.serving.weightG,
              volumeMl: item.serving.volumeMl,
            }
          : undefined,
      })),
      computed: {
        totalIngredientsWeight: nutritionResult.totalIngredientsWeight,
        totals: {
          ...nutritionResult.nutrition.totals,
          price: priceResult.totalPrice,
          currency: priceResult.currency || undefined,
        },
        perPortion: {
          ...nutritionResult.nutrition.perPortion,
          price: priceResult.perPortionPrice,
          currency: priceResult.currency || undefined,
        },
        per100g: nutritionResult.nutrition.per100g,
      },
      issues: allIssues,
    };
  }
}
