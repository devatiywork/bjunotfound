import { ActivityType } from '@prisma/client';

/**
 * Коэффициенты калорий на 1 шаг в зависимости от типа активности
 */
const CALORIES_PER_STEP = {
  WALKING: 0.04, // Обычная ходьба
  FAST_WALKING: 0.06, // Быстрая ходьба (в 1.5 раза больше)
  RUNNING: 0.09, // Бег (в 2.25 раза больше)
  CUSTOM: 0.04, // По умолчанию как обычная ходьба
} as const;

/**
 * Расчет сожженных калорий на основе типа активности, шагов и веса
 * @param steps - количество шагов
 * @param weightKg - вес пользователя в килограммах
 * @param activityType - тип активности
 * @returns количество сожженных калорий (округлено до 2 знаков)
 */
export function calculateActivityCalories(
  steps: number,
  weightKg: number,
  activityType: ActivityType = 'WALKING',
): number {
  const caloriesPerStep = CALORIES_PER_STEP[activityType];
  const standardWeight = 70; // стандартный вес для базового расчета

  // Формула: шаги × коэффициент × (вес_пользователя / стандартный_вес)
  const calories = steps * caloriesPerStep * (weightKg / standardWeight);

  return Math.round(calories * 100) / 100;
}
