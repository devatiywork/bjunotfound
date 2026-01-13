/**
 * Типы для ответов API модуля Dishes.
 * Определяют структуру данных, возвращаемых клиенту.
 */

/**
 * Код проблемы/предупреждения при расчете блюда
 */
export enum IssueCode {
  /** У продукта отсутствует информация о пищевой ценности */
  MISSING_NUTRITION = 'MISSING_NUTRITION',
  /** У продукта отсутствует информация о покупках */
  MISSING_PURCHASE = 'MISSING_PURCHASE',
  /** Порция продукта не найдена или некорректна */
  SERVING_INVALID = 'SERVING_INVALID',
  /** Расчет приблизительный (объем конвертирован в граммы как 1:1) */
  VOLUME_APPROXIMATION = 'VOLUME_APPROXIMATION',
  /** Продукт не найден */
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  /** Некорректное количество порций (должно быть > 0) */
  INVALID_PORTIONS = 'INVALID_PORTIONS',
}

/**
 * Уровень серьезности проблемы
 */
export type IssueSeverity = 'warning' | 'error';

/**
 * Проблема или предупреждение при расчете блюда
 */
export interface DishIssue {
  /** ID ингредиента (если проблема связана с конкретным ингредиентом) */
  itemId?: string;
  /** Код проблемы */
  code: IssueCode;
  /** Человекочитаемое описание */
  message: string;
  /** Уровень серьезности */
  severity: IssueSeverity;
}

/**
 * Рассчитанные показатели КБЖУ
 */
export interface NutritionData {
  /** Калории (ккал) */
  kcal: number;
  /** Белки (г) */
  proteins: number;
  /** Жиры (г) */
  fats: number;
  /** Углеводы (г) */
  carbs: number;
}

/**
 * Рассчитанные показатели КБЖУ с ценой
 */
export interface NutritionWithPrice extends NutritionData {
  /** Цена в валюте последней покупки */
  price: number | null;
  /** Валюта цены (если цена есть) */
  currency?: string;
}

/**
 * Вычисленные значения для блюда (не хранятся в БД)
 */
export interface ComputedNutrition {
  /** Суммарный вес всех ингредиентов в граммах */
  totalIngredientsWeight: number;
  /** Итоговые значения для всего блюда */
  totals: NutritionWithPrice;
  /** Значения на одну порцию */
  perPortion: NutritionWithPrice;
  /** Значения на 100г готового блюда */
  per100g?: NutritionData;
}

/**
 * Данные блюда из БД
 */
export interface DishData {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  portions: number;
  photos: string[];
  status: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Данные ингредиента с информацией о продукте
 */
export interface DishItemWithProduct {
  id: string;
  dishId: string;
  productUserId: string;
  sortOrder: number;
  note: string | null;
  measureType: string;
  amountG: number | null;
  amountMl: number | null;
  servingId: string | null;
  servingsCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  /** Информация о продукте */
  productUser: {
    id: string;
    names: Array<{ lang: string; name: string }>;
    nutrition: {
      caloriesKcal: number;
      proteinsG: number;
      fatsG: number;
      carbohydratesG: number;
    } | null;
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
  /** Информация о порции (если measureType = SERVINGS) */
  serving?: {
    id: string;
    name: string;
    amountUnits: number;
    weightG: number | null;
    volumeMl: number | null;
  } | null;
}

/**
 * Полный ответ для блюда с расчетами
 */
export interface DishResponse {
  /** Данные блюда */
  dish: DishData;
  /** Список ингредиентов с продуктами */
  items: DishItemWithProduct[];
  /** Вычисленные значения КБЖУ и цены */
  computed: ComputedNutrition;
  /** Список проблем и предупреждений */
  issues: DishIssue[];
}
