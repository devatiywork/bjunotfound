import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FindOneDishService {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, userId?: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, email: true },
        },
        ingredients: {
          include: {
            product: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверка доступа к личному блюду
    if (!dish.isPublic && dish.userId !== userId) {
      throw new ForbiddenException('Доступ к этому блюду запрещен');
    }

    // Добавляем персональные цены пользователя к ингредиентам
    if (userId) {
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
    }

    return dish;
  }
}
