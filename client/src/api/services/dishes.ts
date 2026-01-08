import { apiClient } from '../client.ts'
import type {
	CreateDishDto,
	Dish,
	DishesResponse,
	FilterDishesDto,
	UpdateDishDto,
} from '../types/dishes.ts'

/**
 * Получить список блюд с фильтрацией
 */
export const getDishes = async (
	filters?: FilterDishesDto
): Promise<DishesResponse> => {
	const response = await apiClient.get<DishesResponse>('/dishes', {
		params: filters,
	})
	return response.data
}

/**
 * Получить блюдо по ID
 */
export const getDishById = async (id: string): Promise<Dish> => {
	const response = await apiClient.get<Dish>(`/dishes/${id}`)
	return response.data
}

/**
 * Получить избранные блюда
 */
export const getFavoriteDishes = async (): Promise<Dish[]> => {
	const response = await apiClient.get<Dish[]>('/dishes/favorites')
	return response.data
}

/**
 * Создать новое блюдо
 */
export const createDish = async (data: CreateDishDto): Promise<Dish> => {
	const response = await apiClient.post<Dish>('/dishes', data)
	return response.data
}

/**
 * Обновить блюдо
 */
export const updateDish = async (
	id: string,
	data: UpdateDishDto
): Promise<Dish> => {
	const response = await apiClient.patch<Dish>(`/dishes/${id}`, data)
	return response.data
}

/**
 * Удалить блюдо
 */
export const deleteDish = async (id: string): Promise<void> => {
	await apiClient.delete(`/dishes/${id}`)
}

/**
 * Пересчитать КБЖУ блюда
 */
export const recalculateDish = async (id: string): Promise<Dish> => {
	const response = await apiClient.post<Dish>(`/dishes/${id}/recalculate`)
	return response.data
}

/**
 * Добавить блюдо в избранное
 */
export const addDishToFavorites = async (id: string): Promise<void> => {
	await apiClient.post(`/dishes/${id}/favorite`)
}

/**
 * Удалить блюдо из избранного
 */
export const removeDishFromFavorites = async (id: string): Promise<void> => {
	await apiClient.delete(`/dishes/${id}/favorite`)
}

/**
 * Загрузить фото блюда
 */
export const uploadDishPhoto = async (file: File): Promise<{ url: string }> => {
	const formData = new FormData()
	formData.append('file', file)

	const response = await apiClient.post<{ url: string }>(
		'/dishes/upload-photo',
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}
	)
	return response.data
}
