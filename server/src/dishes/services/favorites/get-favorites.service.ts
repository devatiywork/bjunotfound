import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetFavoritesService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
    const favorites = await this.prisma.favoriteDish.findMany({
      where: { userId },
      include: {
        dish: {
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
        },
      },
      orderBy: { addedAt: 'desc' },
    });

    const dishes = favorites.map((fav) => fav.dish);

    // Добавляем персональные цены пользователя к ингредиентам
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

    return dishesWithPrices;
  }
}
