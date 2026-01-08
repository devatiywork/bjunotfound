import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CalculateNutritionService {
  constructor(private prisma: PrismaService) {}

  async execute(ingredients: any[], products: any[]) {
    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbs = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalWeight = 0;

    for (const ingredient of ingredients) {
      const product = products.find((p) => p.id === ingredient.productId);
      if (!product) continue;

      // КБЖУ рассчитывается на 100г, нужно пропорционально пересчитать
      const ratio = ingredient.amount / 100;

      totalCalories += product.calories * ratio;
      totalProteins += product.proteins * ratio;
      totalFats += product.fats * ratio;
      totalCarbs += product.carbs * ratio;

      if (product.fiber) totalFiber += product.fiber * ratio;
      if (product.sugar) totalSugar += product.sugar * ratio;

      totalWeight += ingredient.amount;
    }

    return {
      totalCalories: Math.round(totalCalories * 100) / 100,
      totalProteins: Math.round(totalProteins * 100) / 100,
      totalFats: Math.round(totalFats * 100) / 100,
      totalCarbs: Math.round(totalCarbs * 100) / 100,
      totalFiber: totalFiber > 0 ? Math.round(totalFiber * 100) / 100 : null,
      totalSugar: totalSugar > 0 ? Math.round(totalSugar * 100) / 100 : null,
      totalWeight: Math.round(totalWeight * 100) / 100,
    };
  }
}
