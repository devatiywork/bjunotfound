import { apiClient } from '../client.ts'
import type {
	CreateMealEventDto,
	MealEvent,
	MealEventDetailed,
	MealEventsPeriodResponse,
	MealEventWithDetails,
	UpdateMealEventDto,
	UpdateMealEventStatusDto,
} from '../types/meal-events.ts'

/**
 * Создать событие питания
 */
export const createMealEvent = async (
	data: CreateMealEventDto
): Promise<MealEvent> => {
	const response = await apiClient.post<MealEvent>('/meal-events', data)
	return response.data
}

/**
 * Получить событие по ID с детальной информацией и КБЖУ
 */
export const getMealEvent = async (id: string): Promise<MealEventDetailed> => {
	const response = await apiClient.get<MealEventDetailed>(`/meal-events/${id}`)
	return response.data
}

/**
 * Обновить событие питания
 */
export const updateMealEvent = async (
	id: string,
	data: UpdateMealEventDto
): Promise<MealEvent> => {
	const response = await apiClient.patch<MealEvent>(`/meal-events/${id}`, data)
	return response.data
}

/**
 * Удалить (архивировать) событие питания
 */
export const deleteMealEvent = async (id: string): Promise<void> => {
	await apiClient.delete(`/meal-events/${id}`)
}

/**
 * Изменить статус события (COMPLETED или SKIPPED)
 */
export const updateMealEventStatus = async (
	id: string,
	data: UpdateMealEventStatusDto
): Promise<MealEvent> => {
	const response = await apiClient.patch<MealEvent>(
		`/meal-events/${id}/status`,
		data
	)
	return response.data
}

/**
 * Получить список событий за период
 */
export interface ListMealEventsParams {
	startDate?: string
	endDate?: string
	status?: 'PLANNED' | 'COMPLETED' | 'SKIPPED'
	includeArchived?: boolean
}

export const listMealEvents = async (
	params?: ListMealEventsParams
): Promise<MealEvent[]> => {
	const response = await apiClient.get<MealEvent[]>('/meal-events', { params })
	return response.data
}

/**
 * Получить события за период с деталями (блюдо, тип приема пищи)
 */
export interface GetMealEventsPeriodParams {
	startDate?: string
	endDate?: string
	status?: 'PLANNED' | 'COMPLETED' | 'SKIPPED'
	mealTypeId?: string
}

export const getMealEventsPeriod = async (
	params?: GetMealEventsPeriodParams
): Promise<MealEventWithDetails[]> => {
	const response = await apiClient.get<MealEventsPeriodResponse>(
		'/meal-events/period',
		{ params }
	)
	return response.data.events || []
}
