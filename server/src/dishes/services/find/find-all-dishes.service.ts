import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FilterDishesDto } from '../../dto/filter-dishes.dto';

@Injectable()
export class FindAllDishesService {
  constructor(private prisma: PrismaService) {}

  async execute(filters: FilterDishesDto, userId?: string) {
    const {
      page = 1,
      limit = 20,
      search,
      tagIds,
      mealType,
      cuisineType,
      dishCategory,
      difficulty,
      minCalories,
      maxCalories,
      minCookingTime,
      maxCookingTime,
      minPrice,
      maxPrice,
      source,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = {
      OR: userId ? [{ isPublic: true }, { userId }] : [{ isPublic: true }],
    };

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tagIds },
        },
      };
    }

    if (mealType) where.mealType = mealType;
    if (cuisineType) where.cuisineType = cuisineType;
    if (dishCategory) where.dishCategory = dishCategory;
    if (difficulty) where.difficulty = difficulty;
    if (source) where.source = source;
    if (isVerified !== undefined) where.isVerified = isVerified;

    if (minCalories !== undefined || maxCalories !== undefined) {
      where.caloriesPerServing = {};
      if (minCalories !== undefined) where.caloriesPerServing.gte = minCalories;
      if (maxCalories !== undefined) where.caloriesPerServing.lte = maxCalories;
    }

    if (minCookingTime !== undefined || maxCookingTime !== undefined) {
      where.cookingTimeMinutes = {};
      if (minCookingTime !== undefined)
        where.cookingTimeMinutes.gte = minCookingTime;
      if (maxCookingTime !== undefined)
        where.cookingTimeMinutes.lte = maxCookingTime;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerServing = {};
      if (minPrice !== undefined) where.pricePerServing.gte = minPrice;
      if (maxPrice !== undefined) where.pricePerServing.lte = maxPrice;
    }

    const [dishes, total] = await Promise.all([
      this.prisma.dish.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          creator: {
            select: { id: true, email: true },
          },
          ingredients: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  calories: true,
                  proteins: true,
                  fats: true,
                  carbs: true,
                  servingSize: true,
                },
              },
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.dish.count({ where }),
    ]);

    // Добавляем персональные цены пользователя к ингредиентам
    if (userId) {
      const dishesWithPrices = await Promise.all(
        dishes.map(async (dish) => {
          const ingredientsWithPrices = await Promise.all(
            dish.ingredients.map(async (ingredient) => {
              const userPrice = await this.prisma.userProductPrice.findUnique({
                where: {
                  userId_productId: {
                    userId,
                    productId: ingredient.productId,
                  },
                },
              });

              return {
                ...ingredient,
                calculatedPrice:
                  userPrice?.price && ingredient.product.servingSize
                    ? (userPrice.price / ingredient.product.servingSize) *
                      ingredient.amount
                    : null,
              };
            }),
          );

          // Пересчитываем общую стоимость на основе текущих цен
          const calculatedTotalPrice = ingredientsWithPrices.every(
            (ing) => ing.calculatedPrice !== null,
          )
            ? ingredientsWithPrices.reduce(
                (sum, ing) => sum + (ing.calculatedPrice || 0),
                0,
              )
            : null;

          const calculatedPricePerServing = calculatedTotalPrice
            ? calculatedTotalPrice / dish.servings
            : null;

          return {
            ...dish,
            ingredients: ingredientsWithPrices,
            totalPrice: calculatedTotalPrice,
            pricePerServing: calculatedPricePerServing,
          };
        }),
      );

      return {
        dishes: dishesWithPrices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    return {
      dishes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
