/**
 * Утилиты для расчета и категоризации ИМТ (Индекс Массы Тела)
 */

export interface BMIResult {
	value: number
	category:
		| 'underweight'
		| 'normal'
		| 'overweight'
		| 'obese_1'
		| 'obese_2'
		| 'obese_3'
	categoryLabel: string
	color: string
	darkColor: string
}

/**
 * Рассчитывает ИМТ (BMI) по формуле: вес(кг) / рост(м)²
 * @param weight - Вес в килограммах
 * @param height - Рост в сантиметрах
 * @returns Объект с рассчитанным ИМТ, категорией и цветами для отображения
 */
export const calculateBMI = (weight: number, height: number): BMIResult => {
	// Преобразуем рост из см в метры
	const heightInMeters = height / 100

	// Рассчитываем ИМТ
	const bmi = weight / (heightInMeters * heightInMeters)

	// Определяем категорию по стандартной классификации ВОЗ
	let category: BMIResult['category']
	let categoryLabel: string
	let color: string
	let darkColor: string

	if (bmi < 18.5) {
		category = 'underweight'
		categoryLabel = 'Недостаточный вес'
		color = 'text-yellow-600'
		darkColor = 'dark:text-yellow-400'
	} else if (bmi >= 18.5 && bmi < 25) {
		category = 'normal'
		categoryLabel = 'Нормальный вес'
		color = 'text-green-600'
		darkColor = 'dark:text-green-400'
	} else if (bmi >= 25 && bmi < 30) {
		category = 'overweight'
		categoryLabel = 'Избыточный вес'
		color = 'text-orange-600'
		darkColor = 'dark:text-orange-400'
	} else if (bmi >= 30 && bmi < 35) {
		category = 'obese_1'
		categoryLabel = 'Ожирение I степени'
		color = 'text-red-600'
		darkColor = 'dark:text-red-400'
	} else if (bmi >= 35 && bmi < 40) {
		category = 'obese_2'
		categoryLabel = 'Ожирение II степени'
		color = 'text-red-700'
		darkColor = 'dark:text-red-500'
	} else {
		category = 'obese_3'
		categoryLabel = 'Ожирение III степени'
		color = 'text-red-800'
		darkColor = 'dark:text-red-600'
	}

	return {
		value: parseFloat(bmi.toFixed(1)),
		category,
		categoryLabel,
		color,
		darkColor,
	}
}

/**
 * Форматирует отображение ИМТ с категорией
 * @param bmiResult - Результат расчета ИМТ
 * @returns Отформатированная строка для отображения
 */
export const formatBMI = (bmiResult: BMIResult): string => {
	return `${bmiResult.value} (${bmiResult.categoryLabel})`
}
