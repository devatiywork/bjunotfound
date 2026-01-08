import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CalculateNutritionService } from '../calculate-nutrition/calculate-nutrition.service';

@Injectable()
export class RecalculateDishService {
  constructor(
    private prisma: PrismaService,
    private calculateNutritionService: CalculateNutritionService,
  ) {}

  async execute(id: string, userId: string, isAdmin: boolean) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Только создатель или админ
    if (!isAdmin && dish.userId !== userId) {
      throw new ForbiddenException('Недостаточно прав');
    }

    const productIds = dish.ingredients.map((ing) => ing.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const nutrition = await this.calculateNutritionService.execute(
      dish.ingredients,
      products,
    );
    const perServing = {
      caloriesPerServing: nutrition.totalCalories / dish.servings,
      proteinsPerServing: nutrition.totalProteins / dish.servings,
      fatsPerServing: nutrition.totalFats / dish.servings,
      carbsPerServing: nutrition.totalCarbs / dish.servings,
    };

    const updated = await this.prisma.dish.update({
      where: { id },
      data: {
        totalCalories: nutrition.totalCalories,
        totalProteins: nutrition.totalProteins,
        totalFats: nutrition.totalFats,
        totalCarbs: nutrition.totalCarbs,
        totalFiber: nutrition.totalFiber,
        totalSugar: nutrition.totalSugar,
        totalWeight: nutrition.totalWeight,
        ...perServing,
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

    return updated;
  }
}
