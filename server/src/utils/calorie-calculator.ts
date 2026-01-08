/**
 * Утилиты для расчета калорий на основе различных формул
 */

import { FormulaType, Gender } from '@prisma/client';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export interface CalorieCalculationParams {
  weight: number; // кг
  height: number; // см
  age: number; // лет
  gender: Gender;
  activityCoefficient: number; // из таблицы ActivityLevel
  formula: FormulaType;
}

export interface CalorieRecommendation {
  maintenance: number; // калории для поддержания веса
  deficit: number; // дефицит калорий
  targetCalories: number; // целевые калории
  isRealistic: boolean; // реалистична ли цель
  warning?: string; // предупреждение
  alternatives?: {
    // альтернативные варианты
    extendedDays?: number; // увеличенный срок
    moderateWeight?: number; // умеренная цель по весу
  };
}

export interface CalorieSettings {
  minCaloriesFemale: number;
  minCaloriesMale: number;
  maxDeficit: number;
  maxSurplus: number;
  caloriesPerKgFat: number;
}

export interface GoalPaceOption {
  id: string;
  label: string;
  description: string;
  targetCalories: number;
  deficit: number;
  days: number;
  endDate: Date;
  targetSteps?: number; // рекомендуемые шаги в день
  targetBurnedCalories?: number; // рекомендуемые сожженные калории в день
  isRecommended?: boolean;
  isRealistic: boolean;
  warning?: string;
}

export interface PaceConfig {
  id: string;
  label: string;
  deficit: number;
}

/**
 * Конвертация Gender enum в пол для формул
 */
export function isGenderMale(gender: Gender): boolean {
  return gender === 'MALE';
}

/**
 * Расчет возраста по дате рождения
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Расчет базального метаболизма (BMR) по формуле Миффлина-Сан Жеора
 * Более точная современная формула
 */
function calculateBMRMifflinStJeor(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
): number {
  if (isGenderMale(gender)) {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Расчет базального метаболизма (BMR) по формуле Харриса-Бенедикта
 * Классическая формула
 */
function calculateBMRHarrisBenedict(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
): number {
  if (isGenderMale(gender)) {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
}

/**
 * Расчет калорий для поддержания веса (TDEE)
 */
export function calculateMaintenanceCalories(
  params: CalorieCalculationParams,
): number {
  const { weight, height, age, gender, activityCoefficient, formula } = params;

  // Рассчитываем BMR по выбранной формуле
  let bmr: number;
  if (formula === FormulaType.MIFFLIN_ST_JEOR) {
    bmr = calculateBMRMifflinStJeor(weight, height, age, gender);
  } else {
    bmr = calculateBMRHarrisBenedict(weight, height, age, gender);
  }

  // Умножаем на коэффициент активности
  const tdee = bmr * activityCoefficient;

  return Math.round(tdee);
}

/**
 * Расчет рекомендуемых калорий для достижения цели
 */
export function calculateTargetCalories(
  currentWeight: number,
  targetWeight: number,
  days: number,
  params: CalorieCalculationParams,
  settings: CalorieSettings,
): CalorieRecommendation {
  // Калории для поддержания текущего веса
  const maintenanceCalories = calculateMaintenanceCalories(params);

  // Разница в весе
  const weightDifference = currentWeight - targetWeight;

  // 1 кг жира = калорийность из настроек
  const totalCalorieDeficit =
    Math.abs(weightDifference) * settings.caloriesPerKgFat;

  // Дефицит в день
  const dailyDeficit = totalCalorieDeficit / days;

  // Целевые калории
  let targetCalories: number;
  if (weightDifference > 0) {
    // Похудение - вычитаем дефицит
    targetCalories = maintenanceCalories - dailyDeficit;
  } else {
    // Набор веса - добавляем профицит
    targetCalories = maintenanceCalories + dailyDeficit;
  }

  targetCalories = Math.round(targetCalories);

  // Проверка реалистичности (используем настройки из БД)
  const minCalories = isGenderMale(params.gender)
    ? settings.minCaloriesMale
    : settings.minCaloriesFemale;
  let isRealistic = true;
  let warning: string | undefined;
  let alternatives:
    | { extendedDays?: number; moderateWeight?: number }
    | undefined;

  if (weightDifference > 0) {
    // Похудение
    if (targetCalories < minCalories) {
      isRealistic = false;
      warning = `Целевые калории (${targetCalories} ккал) слишком низкие! Минимум ${minCalories} ккал/день для здоровья.`;

      // Рассчитываем альтернативы
      const maxSafeDeficit = maintenanceCalories - minCalories;
      const safeWeightLoss =
        (maxSafeDeficit * days) / settings.caloriesPerKgFat;

      // Альтернатива 1: увеличить срок
      const realisticDays = Math.ceil(
        totalCalorieDeficit / settings.maxDeficit,
      );

      // Альтернатива 2: умеренная цель
      const moderateWeight = currentWeight - safeWeightLoss;

      alternatives = {
        extendedDays: realisticDays,
        moderateWeight: Math.round(moderateWeight * 10) / 10,
      };
    } else if (dailyDeficit > settings.maxDeficit) {
      warning = `Очень быстрое похудение! Рекомендуется дефицит не более ${settings.maxDeficit} ккал/день.`;
    }
  } else if (weightDifference < 0) {
    // Набор веса
    if (dailyDeficit > settings.maxSurplus) {
      isRealistic = false;
      warning = `Слишком быстрый набор веса! Рекомендуется профицит не более ${settings.maxSurplus} ккал/день.`;

      // Рассчитываем альтернативу
      const realisticDays = Math.ceil(
        totalCalorieDeficit / settings.maxSurplus,
      );
      alternatives = {
        extendedDays: realisticDays,
      };
    }
  }

  return {
    maintenance: maintenanceCalories,
    deficit: Math.round(dailyDeficit),
    targetCalories,
    isRealistic,
    warning,
    alternatives,
  };
}

/**
 * Генерация вариантов темпа достижения цели
 */
export function generateGoalPaceOptions(
  currentWeight: number,
  targetWeight: number,
  startDate: Date,
  params: CalorieCalculationParams,
  settings: CalorieSettings,
  paceConfigs: PaceConfig[],
  activityLevelId?: string, // уровень активности для расчета шагов
  userWeight?: number, // вес пользователя для расчета калорий от шагов
): GoalPaceOption[] {
  const maintenanceCalories = calculateMaintenanceCalories(params);
  const weightDifference = currentWeight - targetWeight;
  const isWeightLoss = weightDifference > 0;

  // Границы безопасности из настроек
  const MIN_CALORIES = isGenderMale(params.gender)
    ? settings.minCaloriesMale
    : settings.minCaloriesFemale;

  // Рекомендации по шагам на основе уровня активности
  const STEPS_BY_ACTIVITY: Record<string, number> = {
    sedentary: 5000, // сидячий образ жизни
    light: 7500, // легкая активность
    moderate: 10000, // умеренная активность
    active: 12500, // активный образ жизни
    very_active: 15000, // очень активный
  };

  // Базовые шаги по умолчанию
  const baseSteps = activityLevelId
    ? STEPS_BY_ACTIVITY[activityLevelId] || 10000
    : 10000;

  const options: GoalPaceOption[] = [];

  for (const config of paceConfigs) {
    // config.deficit содержит кг/неделю, преобразуем в ккал/день
    const dailyCalorieDeficit =
      (config.deficit * settings.caloriesPerKgFat) / 7;

    // Рассчитываем сколько дней потребуется
    const totalCaloriesNeeded =
      Math.abs(weightDifference) * settings.caloriesPerKgFat;
    const days = Math.ceil(totalCaloriesNeeded / dailyCalorieDeficit);

    // Рассчитываем целевые калории
    let targetCalories: number;
    if (isWeightLoss) {
      targetCalories = maintenanceCalories - dailyCalorieDeficit;
    } else {
      targetCalories = maintenanceCalories + dailyCalorieDeficit;
    }

    // Проверка реалистичности
    let isRealistic = true;
    let warning: string | undefined;

    // Проверка 1: Не ниже минимума калорий (КРИТИЧНО для здоровья!)
    if (isWeightLoss && targetCalories < MIN_CALORIES) {
      isRealistic = false;
      warning = `Калории ниже безопасного минимума (${MIN_CALORIES} ккал/день для ${isGenderMale(params.gender) ? 'мужчин' : 'женщин'})`;
    }

    // Проверка 2: Дефицит не более максимального (медицинская рекомендация)
    if (isWeightLoss && dailyCalorieDeficit > settings.maxDeficit) {
      // Проверяем, не приведет ли это к калориям ниже минимума
      const effectiveMinCalories = maintenanceCalories - settings.maxDeficit;
      if (effectiveMinCalories < MIN_CALORIES) {
        isRealistic = false;
        warning = `При безопасном дефиците (${settings.maxDeficit} ккал/день) калории будут ниже минимума. Рекомендуется более медленный темп.`;
      } else if (!warning) {
        // Только если нет более критичного warning
        warning = `Дефицит превышает рекомендуемый максимум (${settings.maxDeficit} ккал/день). Требуется контроль специалиста.`;
      }
    }

    // Проверка 3: Для набора веса - профицит не более максимального
    if (!isWeightLoss && dailyCalorieDeficit > settings.maxSurplus) {
      warning = `Профицит превышает рекомендуемый максимум (${settings.maxSurplus} ккал/день). Риск набора жира вместо мышц.`;
    }

    // Рассчитываем дату окончания
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    // Рассчитываем рекомендуемые шаги и сожженные калории
    // На основе темпа: чем быстрее темп, тем больше активности
    let targetSteps: number;
    let targetBurnedCalories: number;

    // Вес для расчета калорий (используем currentWeight если userWeight не передан)
    const weightForCalories = userWeight || currentWeight;

    if (config.id === 'comfortable') {
      // Комфортный темп - базовый уровень активности
      targetSteps = baseSteps;
      // Расчет калорий с учетом веса пользователя (коэффициент 0.04 для WALKING)
      targetBurnedCalories = Math.round(
        baseSteps * 0.04 * (weightForCalories / 70),
      );
    } else if (config.id === 'moderate') {
      // Средний темп - увеличиваем на 25%
      targetSteps = Math.round(baseSteps * 1.25);
      targetBurnedCalories = Math.round(
        targetSteps * 0.04 * (weightForCalories / 70),
      );
    } else if (config.id === 'fast') {
      // Быстрый темп - увеличиваем на 50%
      targetSteps = Math.round(baseSteps * 1.5);
      targetBurnedCalories = Math.round(
        targetSteps * 0.04 * (weightForCalories / 70),
      );
    } else if (config.id === 'very-fast') {
      // Очень быстрый темп - увеличиваем на 75%
      targetSteps = Math.round(baseSteps * 1.75);
      targetBurnedCalories = Math.round(
        targetSteps * 0.04 * (weightForCalories / 70),
      );
    } else {
      // Для набора веса или других случаев
      targetSteps = baseSteps;
      targetBurnedCalories = Math.round(
        baseSteps * 0.04 * (weightForCalories / 70),
      );
    }

    // Описание
    let description: string;
    const weeklyWeightChange = config.deficit; // кг/неделю
    if (isWeightLoss) {
      description = `${Math.round(dailyCalorieDeficit)} ккал/день дефицит • ~${weeklyWeightChange.toFixed(1)} кг/неделя • ${targetSteps.toLocaleString()} шагов`;
    } else {
      description = `${Math.round(dailyCalorieDeficit)} ккал/день профицит • ~${weeklyWeightChange.toFixed(1)} кг/неделя • ${targetSteps.toLocaleString()} шагов`;
    }

    options.push({
      id: config.id,
      label: config.label,
      description,
      targetCalories: Math.round(targetCalories),
      deficit: Math.round(dailyCalorieDeficit), // возвращаем дефицит в ккал/день
      days,
      endDate,
      targetSteps,
      targetBurnedCalories,
      isRecommended: config.id === 'moderate', // Средний темп - рекомендуемый
      isRealistic,
      warning,
    });
  }

  // Фильтруем только реалистичные варианты или добавляем хотя бы один
  const realisticOptions = options.filter((opt) => opt.isRealistic);
  return realisticOptions.length > 0
    ? realisticOptions
    : [options[options.length - 1]];
}

/**
 * Форматирование калорий для отображения
 */
export function formatCalories(calories: number): string {
  return `${calories.toLocaleString('ru-RU')} ккал`;
}
