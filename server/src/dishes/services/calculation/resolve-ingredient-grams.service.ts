import { Injectable } from '@nestjs/common';
import { MeasureType } from '@prisma/client';
import { DishIssue, IssueCode } from '../../types/dish-response.types';

/**
 * Данные ингредиента для расчета граммов
 */
interface DishItemForCalculation {
  id: string;
  measureType: MeasureType;
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
}

/**
 * Результат расчета граммов для ингредиента
 */
export interface ResolvedGramsResult {
  /** Количество в граммах */
  resolvedGrams: number | null;
  /** Количество в миллилитрах (если применимо) */
  resolvedMl?: number | null;
  /** Список проблем */
  issues: DishIssue[];
}

/**
 * Сервис для конвертации любого типа измерения ингредиента в граммы.
 * Это ключевая часть системы расчетов, т.к. КБЖУ указаны на 100г.
 */
@Injectable()
export class ResolveIngredientGramsService {
  /**
   * Конвертирует количество ингредиента в граммы в зависимости от типа измерения.
   *
   * @param item - Ингредиент с информацией о количестве и порции
   * @returns Результат с граммами и возможными проблемами
   */
  execute(item: DishItemForCalculation): ResolvedGramsResult {
    const issues: DishIssue[] = [];

    switch (item.measureType) {
      case MeasureType.GRAMS:
        return this.resolveGrams(item);

      case MeasureType.MILLILITERS:
        return this.resolveMilliliters(item, issues);

      case MeasureType.SERVINGS:
        return this.resolveServings(item, issues);

      default:
        return {
          resolvedGrams: null,
          issues: [
            {
              itemId: item.id,
              code: IssueCode.SERVING_INVALID,
              message: `Неизвестный тип измерения: ${item.measureType}`,
              severity: 'error',
            },
          ],
        };
    }
  }

  /**
   * Обработка ингредиента в граммах (самый простой случай)
   */
  private resolveGrams(item: DishItemForCalculation): ResolvedGramsResult {
    if (!item.amountG || item.amountG <= 0) {
      return {
        resolvedGrams: null,
        issues: [
          {
            itemId: item.id,
            code: IssueCode.SERVING_INVALID,
            message: 'Количество в граммах должно быть больше 0',
            severity: 'error',
          },
        ],
      };
    }

    return {
      resolvedGrams: item.amountG,
      issues: [],
    };
  }

  /**
   * Обработка ингредиента в миллилитрах
   * Используем приближение 1 мл = 1 г
   */
  private resolveMilliliters(
    item: DishItemForCalculation,
    issues: DishIssue[],
  ): ResolvedGramsResult {
    if (!item.amountMl || item.amountMl <= 0) {
      return {
        resolvedGrams: null,
        resolvedMl: null,
        issues: [
          {
            itemId: item.id,
            code: IssueCode.SERVING_INVALID,
            message: 'Количество в миллилитрах должно быть больше 0',
            severity: 'error',
          },
        ],
      };
    }

    const resolvedMl = item.amountMl;
    const resolvedGrams = item.amountMl; // 1 мл = 1 г (приближение)

    return {
      resolvedGrams,
      resolvedMl,
      issues, // Пустой массив - проблем нет, это нормальное приближение
    };
  }

  /**
   * Обработка ингредиента в порциях продукта
   * Требует наличия serving с весом или объемом
   */
  private resolveServings(
    item: DishItemForCalculation,
    issues: DishIssue[],
  ): ResolvedGramsResult {
    // Проверка наличия servingId и servingsCount
    if (!item.servingId || !item.servingsCount || item.servingsCount <= 0) {
      return {
        resolvedGrams: null,
        issues: [
          {
            itemId: item.id,
            code: IssueCode.SERVING_INVALID,
            message:
              'Для типа SERVINGS необходимо указать порцию и количество > 0',
            severity: 'error',
          },
        ],
      };
    }

    // Проверка наличия информации о порции
    if (!item.serving) {
      return {
        resolvedGrams: null,
        issues: [
          {
            itemId: item.id,
            code: IssueCode.SERVING_INVALID,
            message: 'Порция не найдена',
            severity: 'error',
          },
        ],
      };
    }

    const serving = item.serving;

    // Если порция задана в граммах - просто умножаем
    if (serving.weightG && serving.weightG > 0) {
      return {
        resolvedGrams: item.servingsCount * serving.weightG,
        issues,
      };
    }

    // Если порция задана в миллилитрах - конвертируем через 1:1
    if (serving.volumeMl && serving.volumeMl > 0) {
      const resolvedMl = item.servingsCount * serving.volumeMl;
      const resolvedGrams = resolvedMl; // 1 мл = 1 г

      issues.push({
        itemId: item.id,
        code: IssueCode.VOLUME_APPROXIMATION,
        message: `Порция "${serving.name}" задана в мл. Расчет приблизительный (1 мл = 1 г)`,
        severity: 'warning',
      });

      return {
        resolvedGrams,
        resolvedMl,
        issues,
      };
    }

    // Порция не содержит ни веса, ни объема
    return {
      resolvedGrams: null,
      issues: [
        {
          itemId: item.id,
          code: IssueCode.SERVING_INVALID,
          message: `Порция "${serving.name}" не содержит информации о весе или объеме`,
          severity: 'error',
        },
      ],
    };
  }
}
