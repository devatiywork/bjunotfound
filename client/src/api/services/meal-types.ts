import { apiClient } from '../client'
import type { CreateMealTypeDto, MealType } from '../types/meal-types'

const BASE_URL = '/meal-types'

/**
 * Получить все типы приемов пищи
 */
export async function listMealTypes(): Promise<MealType[]> {
	const response = await apiClient.get<MealType[]>(BASE_URL)
	return response.data
}

/**
 * Создать пользовательский тип приема пищи
 */
export async function createMealType(
	data: CreateMealTypeDto
): Promise<MealType> {
	const response = await apiClient.post<MealType>(BASE_URL, data)
	return response.data
}
