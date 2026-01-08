import { apiClient } from '../client.ts'
import type {
	CreateDishTagDto,
	DishTag,
	UpdateDishTagDto,
} from '../types/dishes.ts'

/**
 * Получить все теги блюд
 */
export const getDishTags = async (): Promise<DishTag[]> => {
	const response = await apiClient.get<DishTag[]>('/dish-tags')
	return response.data
}

/**
 * Получить тег по ID
 */
export const getDishTagById = async (id: string): Promise<DishTag> => {
	const response = await apiClient.get<DishTag>(`/dish-tags/${id}`)
	return response.data
}

/**
 * Создать новый тег (только админ)
 */
export const createDishTag = async (
	data: CreateDishTagDto
): Promise<DishTag> => {
	const response = await apiClient.post<DishTag>('/dish-tags', data)
	return response.data
}

/**
 * Обновить тег (только админ)
 */
export const updateDishTag = async (
	id: string,
	data: UpdateDishTagDto
): Promise<DishTag> => {
	const response = await apiClient.patch<DishTag>(`/dish-tags/${id}`, data)
	return response.data
}

/**
 * Удалить тег (только админ)
 */
export const deleteDishTag = async (id: string): Promise<void> => {
	await apiClient.delete(`/dish-tags/${id}`)
}

/**
 * Группировка тегов по категориям
 */
export const groupTagsByCategory = (
	tags: DishTag[]
): Record<string, DishTag[]> => {
	return tags.reduce((acc, tag) => {
		if (!acc[tag.category]) {
			acc[tag.category] = []
		}
		acc[tag.category].push(tag)
		return acc
	}, {} as Record<string, DishTag[]>)
}
