/**
 * Утилиты для расчета калорий на основе различных формул
 */

import type { FormulaType } from '../api/types/users.ts'

export type CalorieFormula = 'mifflin-st-jeor' | 'harris-benedict'
export type ActivityLevel =
	| 'sedentary'
	| 'light'
	| 'moderate'
	| 'active'
	| 'very-active'
	| 'very_active'

export interface CalorieCalculationParams {
	weight: number // кг
	height: number // см
	age: number // лет
	gender: 'MALE' | 'FEMALE'
	activityLevel: ActivityLevel
	formula: CalorieFormula
}

export interface CalorieRecommendation {
	maintenance: number // калории для поддержания веса
	deficit: number // дефицит калорий
	targetCalories: number // целевые калории
	isRealistic: boolean // реалистична ли цель
	warning?: string // предупреждение
	alternatives?: {
		// альтернативные варианты
		extendedDays?: number // увеличенный срок
		moderateWeight?: number // умеренная цель по весу
	}
}

export interface GoalPaceOption {
	id: string
	label: string
	description: string
	targetCalories: number
	deficit: number
	days: number
	endDate: Date
	isRecommended?: boolean
	isRealistic: boolean
	warning?: string
}

/**
 * Конвертация типа формулы с бэкенда в локальный тип
 */
export function convertFormulaType(formulaType: FormulaType): CalorieFormula {
	if (formulaType === 'MIFFLIN_ST_JEOR') return 'mifflin-st-jeor'
	if (formulaType === 'HARRIS_BENEDICT') return 'harris-benedict'
	return 'mifflin-st-jeor' // по умолчанию
}

/**
 * Конвертация ID уровня активности с бэкенда в локальный тип
 */
export function convertActivityLevelId(id: string): ActivityLevel {
	// Бэкенд может использовать underscore вместо дефиса
	if (id === 'very_active') return 'very-active'
	if (
		id === 'sedentary' ||
		id === 'light' ||
		id === 'moderate' ||
		id === 'active'
	) {
		return id as ActivityLevel
	}
	return 'sedentary' // по умолчанию
}

/**
 * Коэффициенты активности
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
	sedentary: 1.2, // сидячий образ жизни
	light: 1.375, // легкие упражнения 1-3 раза в неделю
	moderate: 1.55, // умеренные упражнения 3-5 раз в неделю
	active: 1.725, // интенсивные упражнения 6-7 раз в неделю
	'very-active': 1.9, // очень интенсивные упражнения или физическая работа
	very_active: 1.9, // альтернативное написание с underscore
}

/**
 * Названия уровней активности
 */
export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
	sedentary: 'Сидячий образ жизни',
	light: 'Легкая активность (1-3 раза в неделю)',
	moderate: 'Умеренная активность (3-5 раз в неделю)',
	active: 'Активный образ жизни (6-7 раз в неделю)',
	'very-active': 'Очень активный (интенсивные тренировки)',
	very_active: 'Очень активный (интенсивные тренировки)', // альтернативное написание с underscore
}

/**
 * Названия формул расчета
 */
export const FORMULA_LABELS: Record<CalorieFormula, string> = {
	'mifflin-st-jeor': 'Миффлина-Сан Жеора (рекомендуется)',
	'harris-benedict': 'Харриса-Бенедикта (классическая)',
}

/**
 * Расчет базального метаболизма (BMR) по формуле Миффлина-Сан Жеора
 * Более точная современная формула
 */
function calculateBMRMifflinStJeor(
	weight: number,
	height: number,
	age: number,
	gender: 'MALE' | 'FEMALE'
): number {
	if (gender === 'MALE') {
		return 10 * weight + 6.25 * height - 5 * age + 5
	} else {
		return 10 * weight + 6.25 * height - 5 * age - 161
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
	gender: 'MALE' | 'FEMALE'
): number {
	if (gender === 'MALE') {
		return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
	} else {
		return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
	}
}

/**
 * Расчет калорий для поддержания веса (TDEE)
 * @deprecated Используйте API эндпоинт POST /goals/calculate-calories вместо локальных расчетов
 */
export function calculateMaintenanceCalories(
	params: CalorieCalculationParams
): number {
	const { weight, height, age, gender, activityLevel, formula } = params

	// Рассчитываем BMR по выбранной формуле
	let bmr: number
	if (formula === 'mifflin-st-jeor') {
		bmr = calculateBMRMifflinStJeor(weight, height, age, gender)
	} else {
		bmr = calculateBMRHarrisBenedict(weight, height, age, gender)
	}

	// Умножаем на коэффициент активности
	const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel]

	return Math.round(tdee)
}

/**
 * Расчет рекомендуемых калорий для достижения цели
 * @deprecated Используйте API эндпоинт POST /goals/calculate-calories для расчета калорий на бекенде
 */
export function calculateTargetCalories(
	currentWeight: number,
	targetWeight: number,
	days: number,
	params: CalorieCalculationParams
): CalorieRecommendation {
	// Калории для поддержания текущего веса
	const maintenanceCalories = calculateMaintenanceCalories(params)

	// Разница в весе
	const weightDifference = currentWeight - targetWeight

	// 1 кг жира = примерно 7700 калорий
	const totalCalorieDeficit = Math.abs(weightDifference) * 7700

	// Дефицит в день
	const dailyDeficit = totalCalorieDeficit / days

	// Целевые калории
	let targetCalories: number
	if (weightDifference > 0) {
		// Похудение - вычитаем дефицит
		targetCalories = maintenanceCalories - dailyDeficit
	} else {
		// Набор веса - добавляем профицит
		targetCalories = maintenanceCalories + dailyDeficit
	}

	targetCalories = Math.round(targetCalories)

	// Проверка реалистичности
	const MIN_CALORIES = 1200 // минимум для женщин
	const MIN_CALORIES_MALE = 1500 // минимум для мужчин
	const MAX_DEFICIT = 1000 // максимальный дефицит калорий в день
	const MAX_SURPLUS = 500 // максимальный профицит в день

	const minCalories =
		params.gender === 'MALE' ? MIN_CALORIES_MALE : MIN_CALORIES
	let isRealistic = true
	let warning: string | undefined
	let alternatives:
		| { extendedDays?: number; moderateWeight?: number }
		| undefined

	if (weightDifference > 0) {
		// Похудение
		if (targetCalories < minCalories) {
			isRealistic = false
			warning = `Целевые калории (${targetCalories} ккал) слишком низкие! Минимум ${minCalories} ккал/день для здоровья.`

			// Рассчитываем альтернативы
			const maxSafeDeficit = maintenanceCalories - minCalories
			const safeWeightLoss = (maxSafeDeficit * days) / 7700

			// Альтернатива 1: увеличить срок
			const realisticDays = Math.ceil(totalCalorieDeficit / MAX_DEFICIT)

			// Альтернатива 2: умеренная цель
			const moderateWeight = currentWeight - safeWeightLoss

			alternatives = {
				extendedDays: realisticDays,
				moderateWeight: Math.round(moderateWeight * 10) / 10,
			}
		} else if (dailyDeficit > MAX_DEFICIT) {
			warning = `Очень быстрое похудение! Рекомендуется дефицит не более ${MAX_DEFICIT} ккал/день.`
		}
	} else if (weightDifference < 0) {
		// Набор веса
		if (dailyDeficit > MAX_SURPLUS) {
			isRealistic = false
			warning = `Слишком быстрый набор веса! Рекомендуется профицит не более ${MAX_SURPLUS} ккал/день.`

			// Рассчитываем альтернативу
			const realisticDays = Math.ceil(totalCalorieDeficit / MAX_SURPLUS)
			alternatives = {
				extendedDays: realisticDays,
			}
		}
	}

	return {
		maintenance: maintenanceCalories,
		deficit: Math.round(dailyDeficit),
		targetCalories,
		isRealistic,
		warning,
		alternatives,
	}
}

/**
 * Форматирование калорий
 */
export function formatCalories(calories: number): string {
	return `${calories.toLocaleString('ru-RU')} ккал`
}

/**
 * Получение сохраненной формулы из localStorage
 */
export function getSavedFormula(): CalorieFormula {
	const saved = localStorage.getItem('calorieFormula')
	if (saved === 'harris-benedict' || saved === 'mifflin-st-jeor') {
		return saved
	}
	return 'mifflin-st-jeor' // по умолчанию
}

/**
 * Сохранение формулы в localStorage
 */
export function saveFormula(formula: CalorieFormula): void {
	localStorage.setItem('calorieFormula', formula)
}

/**
 * Получение сохраненного уровня активности из localStorage
 */
export function getSavedActivityLevel(): ActivityLevel {
	const saved = localStorage.getItem('activityLevel')
	const validLevels: ActivityLevel[] = [
		'sedentary',
		'light',
		'moderate',
		'active',
		'very-active',
	]
	if (saved && validLevels.includes(saved as ActivityLevel)) {
		return saved as ActivityLevel
	}
	return 'sedentary' // по умолчанию
}

/**
 * Сохранение уровня активности в localStorage
 */
export function saveActivityLevel(level: ActivityLevel): void {
	localStorage.setItem('activityLevel', level)
}

/**
 * Генерация вариантов темпа достижения цели
 * @deprecated Используйте API эндпоинт POST /goals/calculate-pace для генерации вариантов на бекенде
 */
export function generateGoalPaceOptions(
	currentWeight: number,
	targetWeight: number,
	startDate: Date,
	params: CalorieCalculationParams
): GoalPaceOption[] {
	const maintenanceCalories = calculateMaintenanceCalories(params)
	const weightDifference = currentWeight - targetWeight
	const isWeightLoss = weightDifference > 0

	// Границы безопасности
	const MIN_CALORIES = params.gender === 'MALE' ? 1500 : 1200
	const MAX_DEFICIT = 1000
	const MAX_SURPLUS = 500

	const options: GoalPaceOption[] = []

	// Определяем варианты дефицитов (или профицитов)
	const paceConfigs = isWeightLoss
		? [
				{ id: 'very-fast', label: 'Очень быстрый', deficit: MAX_DEFICIT },
				{ id: 'fast', label: 'Быстрый', deficit: 750 },
				{ id: 'moderate', label: 'Средний', deficit: 500 },
				{ id: 'comfortable', label: 'Комфортный', deficit: 300 },
		  ]
		: [
				{ id: 'fast', label: 'Быстрый', deficit: MAX_SURPLUS },
				{ id: 'moderate', label: 'Средний', deficit: 350 },
				{ id: 'comfortable', label: 'Комфортный', deficit: 200 },
		  ]

	for (const config of paceConfigs) {
		// Рассчитываем сколько дней потребуется
		const totalCaloriesNeeded = Math.abs(weightDifference) * 7700
		const days = Math.ceil(totalCaloriesNeeded / config.deficit)

		// Рассчитываем целевые калории
		let targetCalories: number
		if (isWeightLoss) {
			targetCalories = maintenanceCalories - config.deficit
		} else {
			targetCalories = maintenanceCalories + config.deficit
		}

		// Проверка реалистичности
		let isRealistic = true
		let warning: string | undefined

		if (isWeightLoss && targetCalories < MIN_CALORIES) {
			isRealistic = false
			warning = `Калории ниже минимума (${MIN_CALORIES} ккал/день)`
		}

		// Рассчитываем дату окончания
		const endDate = new Date(startDate)
		endDate.setDate(endDate.getDate() + days)

		// Описание
		let description: string
		if (isWeightLoss) {
			description = `${config.deficit} ккал/день дефицит • ~${(
				(Math.abs(weightDifference) / days) *
				7
			).toFixed(1)} кг/неделя`
		} else {
			description = `${config.deficit} ккал/день профицит • ~${(
				(Math.abs(weightDifference) / days) *
				7
			).toFixed(1)} кг/неделя`
		}

		options.push({
			id: config.id,
			label: config.label,
			description,
			targetCalories: Math.round(targetCalories),
			deficit: config.deficit,
			days,
			endDate,
			isRecommended: config.id === 'moderate', // Средний темп - рекомендуемый
			isRealistic,
			warning,
		})
	}

	// Фильтруем только реалистичные варианты или добавляем хотя бы один
	const realisticOptions = options.filter(opt => opt.isRealistic)
	return realisticOptions.length > 0
		? realisticOptions
		: [options[options.length - 1]]
}
