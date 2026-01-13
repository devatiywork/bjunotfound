import { apiClient } from '../client'
import type {
	CreateDishDto,
	CreateDishItemDto,
	Dish,
	DishItem,
	DishStatus,
	DishWithCalculations,
	ListDishesParams,
	ListDishesResponse,
	ReorderDishItemsDto,
	UpdateDishDto,
	UpdateDishItemDto,
} from '../types/dishes'

const BASE_URL = '/dishes'

/**
 * Создать блюдо
 */
export async function createDish(data: CreateDishDto): Promise<Dish> {
	const response = await apiClient.post<Dish>(BASE_URL, data)
	return response.data
}

/**
 * Получить список блюд
 */
export async function listDishes(
	params?: ListDishesParams
): Promise<ListDishesResponse> {
	const response = await apiClient.get<ListDishesResponse>(BASE_URL, {
		params,
	})
	return response.data
}

/**
 * Получить архивированные блюда
 */
export async function listArchivedDishes(
	params?: Omit<ListDishesParams, 'status'>
): Promise<ListDishesResponse> {
	const response = await apiClient.get<ListDishesResponse>(
		`${BASE_URL}/archived`,
		{
			params,
		}
	)
	return response.data
}

/**
 * Получить блюдо по ID
 */
export async function getDish(id: string): Promise<Dish> {
	const response = await apiClient.get<Dish>(`${BASE_URL}/${id}`)
	return response.data
}

/**
 * Обновить блюдо
 */
export async function updateDish(
	id: string,
	data: UpdateDishDto
): Promise<Dish> {
	const response = await apiClient.patch<Dish>(`${BASE_URL}/${id}`, data)
	return response.data
}

/**
 * Обновить статус блюда
 */
export async function updateDishStatus(
	id: string,
	status: DishStatus
): Promise<Dish> {
	const response = await apiClient.patch<Dish>(`${BASE_URL}/${id}/status`, {
		status,
	})
	return response.data
}

/**
 * Архивировать/восстановить блюдо
 */
export async function archiveDish(id: string): Promise<Dish> {
	const response = await apiClient.delete<Dish>(`${BASE_URL}/${id}`)
	return response.data
}

export async function restoreDish(id: string): Promise<Dish> {
	const response = await apiClient.post<Dish>(`${BASE_URL}/${id}/restore`)
	return response.data
}

/**
 * Получить блюдо с расчетами КБЖУ и цены
 */
export async function getDishWithCalculations(
	id: string
): Promise<DishWithCalculations> {
	const response = await apiClient.get<DishWithCalculations>(
		`${BASE_URL}/${id}`
	)
	return response.data
}

/**
 * Загрузить фото блюда
 */
export async function uploadDishPhoto(
	id: string,
	file: File,
	onUploadProgress?: (progress: number) => void
): Promise<Dish> {
	const formData = new FormData()
	formData.append('photo', file)

	const response = await apiClient.post<Dish>(
		`${BASE_URL}/${id}/photos`,
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
			onUploadProgress: event => {
				if (!event.total) return
				const progress = Math.round((event.loaded / event.total) * 100)
				onUploadProgress?.(progress)
			},
		}
	)

	return response.data
}

/**
 * Удалить фото блюда
 */
export async function deleteDishPhoto(
	id: string,
	photoUrl: string
): Promise<void> {
	await apiClient.delete(`${BASE_URL}/${id}/photos`, {
		params: { photoUrl },
	})
}

/**
 * Удалить блюдо
 */
export async function deleteDish(id: string): Promise<void> {
	await apiClient.delete(`${BASE_URL}/${id}`)
}

// ========== Управление ингредиентами ==========

/**
 * Добавить ингредиент в блюдо
 */
export async function addDishItem(
	dishId: string,
	data: CreateDishItemDto
): Promise<DishItem> {
	const response = await apiClient.post<DishItem>(
		`${BASE_URL}/${dishId}/items`,
		data
	)
	return response.data
}

/**
 * Обновить ингредиент блюда
 */
export async function updateDishItem(
	dishId: string,
	itemId: string,
	data: UpdateDishItemDto
): Promise<DishItem> {
	const response = await apiClient.patch<DishItem>(
		`${BASE_URL}/${dishId}/items/${itemId}`,
		data
	)
	return response.data
}

/**
 * Удалить ингредиент из блюда
 */
export async function deleteDishItem(
	dishId: string,
	itemId: string
): Promise<void> {
	await apiClient.delete(`${BASE_URL}/${dishId}/items/${itemId}`)
}

/**
 * Изменить порядок ингредиентов
 */
export async function reorderDishItems(
	dishId: string,
	data: ReorderDishItemsDto
): Promise<DishItem[]> {
	const response = await apiClient.post<DishItem[]>(
		`${BASE_URL}/${dishId}/items/reorder`,
		data
	)
	return response.data
}
