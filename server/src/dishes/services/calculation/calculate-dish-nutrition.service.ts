import { Injectable } from '@nestjs/common';
import {
  DishIssue,
  IssueCode,
  NutritionData,
} from '../../types/dish-response.types';
import {
  ResolveIngredientGramsService,
  ResolvedGramsResult,
} from './resolve-ingredient-grams.service';

/**
 * Ингредиент с продуктом для расчета КБЖУ
 */
interface DishItemWithNutrition {
  id: string;
  measureType: string;
  amountG: number | null;
  amountMl: number | null;
  servingId: string | null;
  servingsCount: number | null;
  serving?: {
    id: string;
    name: string;
    weightG: number | null;
    volumeMl: number | null;
  } | null;
  productUser: {
    nutrition: {
      caloriesKcal: number;
      proteinsG: number;
      fatsG: number;
      carbohydratesG: number;
    } | null;
  };
}

/**
 * Входные данные для расчета КБЖУ блюда
 */
export interface CalculateNutritionInput {
  /** Список ингредиентов с продуктами */
  items: DishItemWithNutrition[];
  /** Количество порций блюда */
  portions: number;
}

/**
 * Результат расчета КБЖУ блюда
 */
export interface CalculateNutritionResult {
  /** Итоговые значения и на порцию */
  nutrition: {
    totals: NutritionData;
    perPortion: NutritionData;
    per100g?: NutritionData;
  };
  /** Суммарный вес всех ингредиентов в граммах */
  totalIngredientsWeight: number;
  /** Список проблем */
  issues: DishIssue[];
}

/**
 * Сервис для расчета КБЖУ блюда на основе его ингредиентов.
 * Суммирует КБЖУ всех ингредиентов и рассчитывает значения на порцию и на 100г.
 */
@Injectable()
export class CalculateDishNutritionService {
  constructor(private resolveGramsService: ResolveIngredientGramsService) {}

  /**
   * Рассчитывает КБЖУ блюда: итоговые значения, на порцию и на 100г.
   *
   * @param input - Ингредиенты и количество порций
   * @returns Рассчитанные значения и список проблем
   */
  execute(input: CalculateNutritionInput): CalculateNutritionResult {
    const allIssues: DishIssue[] = [];

    // Проверка корректности количества порций
    if (input.portions <= 0) {
      allIssues.push({
        code: IssueCode.INVALID_PORTIONS,
        message: 'Количество порций должно быть больше 0',
        severity: 'error',
      });

      return this.createEmptyResult(allIssues);
    }

    // Инициализация аккумулятора для суммирования
    const totals: NutritionData = {
      kcal: 0,
      proteins: 0,
      fats: 0,
      carbs: 0,
    };

    let totalGrams = 0; // Суммарный вес всех ингредиентов

    // Расчет КБЖУ для каждого ингредиента
    for (const item of input.items) {
      const itemResult = this.calculateItemNutrition(item);

      // Добавляем проблемы ингредиента
      allIssues.push(...itemResult.issues);

      // Если есть рассчитанные значения - добавляем к итогу
      if (itemResult.nutrition) {
        totals.kcal += itemResult.nutrition.kcal;
        totals.proteins += itemResult.nutrition.proteins;
        totals.fats += itemResult.nutrition.fats;
        totals.carbs += itemResult.nutrition.carbs;
      }

      // Накапливаем вес ингредиентов
      if (itemResult.resolvedGrams) {
        totalGrams += itemResult.resolvedGrams;
      }
    }

    // Расчет на одну порцию
    const perPortion: NutritionData = {
      kcal: this.round(totals.kcal / input.portions),
      proteins: this.round(totals.proteins / input.portions),
      fats: this.round(totals.fats / input.portions),
      carbs: this.round(totals.carbs / input.portions),
    };

    // Расчет на 100г блюда (от суммы веса ингредиентов)
    let per100g: NutritionData | undefined;
    if (totalGrams > 0) {
      per100g = {
        kcal: this.round((totals.kcal * 100) / totalGrams),
        proteins: this.round((totals.proteins * 100) / totalGrams),
        fats: this.round((totals.fats * 100) / totalGrams),
        carbs: this.round((totals.carbs * 100) / totalGrams),
      };
    }

    return {
      nutrition: {
        totals: this.roundNutrition(totals),
        perPortion: this.roundNutrition(perPortion),
        per100g: per100g ? this.roundNutrition(per100g) : undefined,
      },
      totalIngredientsWeight: Math.round(totalGrams * 100) / 100,
      issues: allIssues,
    };
  }

  /**
   * Рассчитывает КБЖУ для одного ингредиента
   */
  private calculateItemNutrition(item: DishItemWithNutrition): {
    nutrition: NutritionData | null;
    resolvedGrams: number;
    issues: DishIssue[];
  } {
    const issues: DishIssue[] = [];

    // Шаг 1: Конвертируем количество в граммы
    const gramsResult: ResolvedGramsResult = this.resolveGramsService.execute(
      item as any,
    );
    issues.push(...gramsResult.issues);

    // Если не удалось рассчитать граммы - пропускаем
    if (!gramsResult.resolvedGrams) {
      return { nutrition: null, resolvedGrams: 0, issues };
    }

    // Шаг 2: Проверяем наличие информации о пищевой ценности
    if (!item.productUser.nutrition) {
      issues.push({
        itemId: item.id,
        code: IssueCode.MISSING_NUTRITION,
        message: 'У продукта отсутствует информация о пищевой ценности',
        severity: 'error',
      });
      return {
        nutrition: null,
        resolvedGrams: gramsResult.resolvedGrams,
        issues,
      };
    }

    const nutrition = item.productUser.nutrition;

    // Шаг 3: Рассчитываем КБЖУ на основе веса
    // КБЖУ указаны на 100г, поэтому коэффициент = resolvedGrams / 100
    const coefficient = gramsResult.resolvedGrams / 100;

    const itemNutrition: NutritionData = {
      kcal: nutrition.caloriesKcal * coefficient,
      proteins: nutrition.proteinsG * coefficient,
      fats: nutrition.fatsG * coefficient,
      carbs: nutrition.carbohydratesG * coefficient,
    };

    return {
      nutrition: itemNutrition,
      resolvedGrams: gramsResult.resolvedGrams,
      issues,
    };
  }

  /**
   * Создает пустой результат (когда расчет невозможен)
   */
  private createEmptyResult(issues: DishIssue[]): CalculateNutritionResult {
    const empty: NutritionData = { kcal: 0, proteins: 0, fats: 0, carbs: 0 };
    return {
      nutrition: {
        totals: empty,
        perPortion: empty,
        per100g: undefined,
      },
      totalIngredientsWeight: 0,
      issues,
    };
  }

  /**
   * Округляет значение до 2 знаков после запятой
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Округляет все значения в объекте NutritionData
   */
  private roundNutrition(nutrition: NutritionData): NutritionData {
    return {
      kcal: this.round(nutrition.kcal),
      proteins: this.round(nutrition.proteins),
      fats: this.round(nutrition.fats),
      carbs: this.round(nutrition.carbs),
    };
  }
}
