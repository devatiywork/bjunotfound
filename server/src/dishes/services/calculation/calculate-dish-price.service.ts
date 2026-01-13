import { Injectable } from '@nestjs/common';
import { DishIssue, IssueCode } from '../../types/dish-response.types';
import {
  ResolveIngredientGramsService,
  ResolvedGramsResult,
} from './resolve-ingredient-grams.service';

/**
 * Ингредиент с продуктом и покупками для расчета цены
 */
interface DishItemWithPackages {
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
    packages: Array<{
      id: string;
      totalWeightG: number | null;
      totalVolumeMl: number | null;
      priceTotal: number;
      currency: string;
      purchasedAt: Date | null;
      createdAt: Date;
    }>;
  };
}

/**
 * Входные данные для расчета цены блюда
 */
export interface CalculatePriceInput {
  /** Список ингредиентов с покупками */
  items: DishItemWithPackages[];
  /** Количество порций блюда */
  portions: number;
}

/**
 * Результат расчета цены блюда
 */
export interface CalculatePriceResult {
  /** Общая цена блюда */
  totalPrice: number | null;
  /** Цена одной порции */
  perPortionPrice: number | null;
  /** Валюта (берется из первой покупки) */
  currency: string | null;
  /** Список проблем */
  issues: DishIssue[];
}

/**
 * Сервис для расчета цены блюда на основе последних покупок продуктов.
 * Цена рассчитывается динамически, используя самую свежую информацию о покупках.
 */
@Injectable()
export class CalculateDishPriceService {
  constructor(private resolveGramsService: ResolveIngredientGramsService) {}

  /**
   * Рассчитывает цену блюда: общую и на порцию.
   *
   * @param input - Ингредиенты и количество порций
   * @returns Рассчитанные цены и список проблем
   */
  execute(input: CalculatePriceInput): CalculatePriceResult {
    const allIssues: DishIssue[] = [];

    // Проверка корректности количества порций
    if (input.portions <= 0) {
      allIssues.push({
        code: IssueCode.INVALID_PORTIONS,
        message: 'Количество порций должно быть больше 0',
        severity: 'error',
      });

      return {
        totalPrice: null,
        perPortionPrice: null,
        currency: null,
        issues: allIssues,
      };
    }

    let totalPrice = 0;
    let currency: string | null = null;
    let hasAtLeastOnePrice = false;

    // Расчет цены для каждого ингредиента
    for (const item of input.items) {
      const itemResult = this.calculateItemPrice(item);

      // Добавляем проблемы ингредиента
      allIssues.push(...itemResult.issues);

      // Если есть рассчитанная цена
      if (itemResult.price !== null) {
        totalPrice += itemResult.price;
        hasAtLeastOnePrice = true;

        // Берем валюту из первого ингредиента с ценой
        if (!currency) {
          currency = itemResult.currency;
        }
      }
    }

    // Если ни один ингредиент не имеет цены
    if (!hasAtLeastOnePrice) {
      return {
        totalPrice: null,
        perPortionPrice: null,
        currency: null,
        issues: allIssues,
      };
    }

    // Расчет цены на порцию
    const perPortionPrice = this.round(totalPrice / input.portions);

    return {
      totalPrice: this.round(totalPrice),
      perPortionPrice,
      currency,
      issues: allIssues,
    };
  }

  /**
   * Рассчитывает цену для одного ингредиента
   */
  private calculateItemPrice(item: DishItemWithPackages): {
    price: number | null;
    currency: string | null;
    issues: DishIssue[];
  } {
    const issues: DishIssue[] = [];

    // Шаг 1: Конвертируем количество в граммы/миллилитры
    const gramsResult: ResolvedGramsResult = this.resolveGramsService.execute(
      item as any,
    );
    issues.push(...gramsResult.issues);

    // Если не удалось рассчитать граммы - пропускаем
    if (!gramsResult.resolvedGrams) {
      return { price: null, currency: null, issues };
    }

    // Шаг 2: Получаем последнюю покупку
    const lastPackage = this.getLatestPackage(item.productUser.packages);

    if (!lastPackage) {
      issues.push({
        itemId: item.id,
        code: IssueCode.MISSING_PURCHASE,
        message: 'У продукта нет информации о покупках',
        severity: 'warning',
      });
      return { price: null, currency: null, issues };
    }

    // Шаг 3: Рассчитываем цену на основе типа упаковки
    let itemPrice: number | null = null;

    // Если упаковка в граммах
    if (lastPackage.totalWeightG && lastPackage.totalWeightG > 0) {
      const pricePerG = lastPackage.priceTotal / lastPackage.totalWeightG;
      itemPrice = pricePerG * gramsResult.resolvedGrams;
    }
    // Если упаковка в миллилитрах
    else if (lastPackage.totalVolumeMl && lastPackage.totalVolumeMl > 0) {
      // Если у нас есть resolvedMl - используем его
      if (gramsResult.resolvedMl) {
        const pricePerMl = lastPackage.priceTotal / lastPackage.totalVolumeMl;
        itemPrice = pricePerMl * gramsResult.resolvedMl;
      } else {
        // Иначе используем resolvedGrams как приближение (1г = 1мл)
        const pricePerMl = lastPackage.priceTotal / lastPackage.totalVolumeMl;
        itemPrice = pricePerMl * gramsResult.resolvedGrams;

        issues.push({
          itemId: item.id,
          code: IssueCode.VOLUME_APPROXIMATION,
          message: 'Покупка в мл, расчет цены приблизительный (1г = 1мл)',
          severity: 'warning',
        });
      }
    } else {
      issues.push({
        itemId: item.id,
        code: IssueCode.MISSING_PURCHASE,
        message: 'Покупка не содержит информации о весе или объеме',
        severity: 'warning',
      });
      return { price: null, currency: null, issues };
    }

    return {
      price: itemPrice,
      currency: lastPackage.currency,
      issues,
    };
  }

  /**
   * Возвращает последнюю покупку (сортировка по purchasedAt, затем по createdAt)
   */
  private getLatestPackage(
    packages: Array<{
      id: string;
      totalWeightG: number | null;
      totalVolumeMl: number | null;
      priceTotal: number;
      currency: string;
      purchasedAt: Date | null;
      createdAt: Date;
    }>,
  ) {
    if (!packages || packages.length === 0) {
      return null;
    }

    // Сортируем: сначала по purchasedAt (если есть), затем по createdAt
    const sorted = [...packages].sort((a, b) => {
      const dateA = a.purchasedAt || a.createdAt;
      const dateB = b.purchasedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });

    return sorted[0];
  }

  /**
   * Округляет значение до 2 знаков после запятой
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
