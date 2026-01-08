import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDishDto } from '../../dto/create-dish.dto';
import { CalculateNutritionService } from '../calculate-nutrition/calculate-nutrition.service';

@Injectable()
export class CreateDishService {
  constructor(
    private prisma: PrismaService,
    private calculateNutritionService: CalculateNutritionService,
  ) {}

  async execute(dto: CreateDishDto, userId: string, isAdmin: boolean) {
    // Валидация: минимум 1 ингредиент
    if (!dto.ingredients || dto.ingredients.length === 0) {
      throw new BadRequestException(
        'Блюдо должно содержать хотя бы один ингредиент',
      );
    }

    // Проверка существования всех продуктов
    const productIds = dto.ingredients.map((ing) => ing.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Один или несколько продуктов не найдены');
    }

    // Проверка тегов (если указаны)
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.prisma.dishTag.findMany({
        where: { id: { in: dto.tagIds } },
      });

      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('Один или несколько тегов не найдены');
      }
    }

    // Расчет КБЖУ из ингредиентов
    const nutrition = await this.calculateNutritionService.execute(
      dto.ingredients,
      products,
    );

    // Расчет на порцию
    const perServing = {
      caloriesPerServing: nutrition.totalCalories / dto.servings,
      proteinsPerServing: nutrition.totalProteins / dto.servings,
      fatsPerServing: nutrition.totalFats / dto.servings,
      carbsPerServing: nutrition.totalCarbs / dto.servings,
    };

    const { ingredients, tagIds, ...dishData } = dto;

    // Создание блюда без totalPrice и pricePerServing
    const dish = await this.prisma.dish.create({
      data: {
        ...dishData,
        totalCalories: nutrition.totalCalories,
        totalProteins: nutrition.totalProteins,
        totalFats: nutrition.totalFats,
        totalCarbs: nutrition.totalCarbs,
        totalFiber: nutrition.totalFiber,
        totalSugar: nutrition.totalSugar,
        totalWeight: nutrition.totalWeight,
        ...perServing,
        userId,
        isVerified: isAdmin,
        source: isAdmin ? 'ADMIN' : 'USER',
        ingredients: {
          create: ingredients.map((ing) => ({
            productId: ing.productId,
            amount: ing.amount,
            unit: ing.unit,
          })),
        },
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
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

    return dish;
  }
}
