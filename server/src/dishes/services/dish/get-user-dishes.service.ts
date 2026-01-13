import { Injectable } from '@nestjs/common';
import { DishStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CalculateDishNutritionService } from '../calculation/calculate-dish-nutrition.service';
import { CalculateDishPriceService } from '../calculation/calculate-dish-price.service';

/**
 * Интерфейс для фильтров списка блюд
 */
export interface GetUserDishesFilters {
  /** Фильтр по статусу */
  status?: DishStatus;
  /** Показывать только архивированные */
  isArchived?: boolean;
  /** Номер страницы (начиная с 1) */
  page?: number;
  /** Количество на странице */
  limit?: number;
}

/**
 * Сервис для получения списка блюд пользователя
 */
@Injectable()
export class GetUserDishesService {
  constructor(
    private prisma: PrismaService,
    private nutritionService: CalculateDishNutritionService,
    private priceService: CalculateDishPriceService,
  ) {}

  /**
   * Получает список блюд пользователя с пагинацией и фильтрацией
   *
   * @param userId - ID пользователя
   * @param filters - Фильтры и пагинация
   * @returns Список блюд с метаданными пагинации
   */
  async execute(userId: string, filters: GetUserDishesFilters = {}) {
    const {
      status,
      isArchived = false, // По умолчанию показываем только неархивированные
      page = 1,
      limit = 20,
    } = filters;

    // Формируем условия фильтрации
    const where: any = {
      userId,
      isArchived,
    };

    if (status) {
      where.status = status;
    }

    // Рассчитываем offset для пагинации
    const skip = (page - 1) * limit;

    // Получаем общее количество для метаданных
    const total = await this.prisma.dish.count({ where });

    // Получаем блюда с ингредиентами для расчетов
    const dishes = await this.prisma.dish.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true }, // Количество ингредиентов
        },
        items: {
          include: {
            serving: true,
            productUser: {
              include: {
                nutrition: true,
                packages: {
                  orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }],
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Рассчитываем КБЖУ и цену для каждого блюда
    const dishesWithCalculations = dishes.map((dish) => {
      // Расчет КБЖУ на порцию
      const nutritionResult = this.nutritionService.execute({
        items: dish.items as any,
        portions: dish.portions,
      });

      // Расчет цены порции
      const priceResult = this.priceService.execute({
        items: dish.items as any,
        portions: dish.portions,
      });

      // Формируем результат без ингредиентов (только summary)
      const { items, ...dishData } = dish;

      return {
        ...dishData,
        perPortion: {
          nutrition: nutritionResult.nutrition.perPortion,
          price: priceResult.perPortionPrice,
          currency: priceResult.currency,
        },
      };
    });

    return {
      data: dishesWithCalculations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
