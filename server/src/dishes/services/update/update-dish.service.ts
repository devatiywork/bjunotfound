import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateDishDto } from '../../dto/update-dish.dto';
import { CalculateNutritionService } from '../calculate-nutrition/calculate-nutrition.service';

@Injectable()
export class UpdateDishService {
  constructor(
    private prisma: PrismaService,
    private calculateNutritionService: CalculateNutritionService,
  ) {}

  async execute(
    id: string,
    dto: UpdateDishDto,
    userId: string,
    isAdmin: boolean,
  ) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверка прав доступа
    if (!isAdmin && dish.userId !== userId) {
      throw new ForbiddenException('Недостаточно прав для редактирования');
    }

    // Валидация ингредиентов (если обновляются)
    if (dto.ingredients) {
      if (dto.ingredients.length === 0) {
        throw new BadRequestException(
          'Блюдо должно содержать хотя бы один ингредиент',
        );
      }

      const productIds = dto.ingredients.map((ing) => ing.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException(
          'Один или несколько продуктов не найдены',
        );
      }
    }

    // Валидация тегов (если обновляются)
    if (dto.tagIds) {
      const tags = await this.prisma.dishTag.findMany({
        where: { id: { in: dto.tagIds } },
      });

      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('Один или несколько тегов не найдены');
      }
    }

    const { ingredients, tagIds, servings, ...dishData } = dto;

    // Если изменились ингредиенты или порции - пересчитываем КБЖУ и цену
    let nutritionUpdate = {};
    if (ingredients || servings) {
      const finalIngredients = ingredients || dish.ingredients;
      const finalServings = servings || dish.servings;

      const productIds = finalIngredients.map((ing) => ing.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const nutrition = await this.calculateNutritionService.execute(
        finalIngredients,
        products,
      );
      const perServing = {
        caloriesPerServing: nutrition.totalCalories / finalServings,
        proteinsPerServing: nutrition.totalProteins / finalServings,
        fatsPerServing: nutrition.totalFats / finalServings,
        carbsPerServing: nutrition.totalCarbs / finalServings,
      };

      nutritionUpdate = {
        totalCalories: nutrition.totalCalories,
        totalProteins: nutrition.totalProteins,
        totalFats: nutrition.totalFats,
        totalCarbs: nutrition.totalCarbs,
        totalFiber: nutrition.totalFiber,
        totalSugar: nutrition.totalSugar,
        totalWeight: nutrition.totalWeight,
        ...perServing,
      };
    }

    // Обновление блюда
    const updatedDish = await this.prisma.dish.update({
      where: { id },
      data: {
        ...dishData,
        ...nutritionUpdate,
        ...(servings && { servings }),
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients.map((ing) => ({
              productId: ing.productId,
              amount: ing.amount,
              unit: ing.unit,
            })),
          },
        }),
        ...(tagIds && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
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

    return updatedDish;
  }
}
