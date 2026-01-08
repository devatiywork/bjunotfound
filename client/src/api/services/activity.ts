/**
 * Сервис для работы с API активности
 */

import { apiClient } from '../client.ts'
import type {
	ActivityLog,
	AddActivityRequest,
	DeleteActivityResponse,
	GetActivitiesParams,
	GetActivitiesResponse,
	GetActivityStatsResponse,
	StatsPeriod,
} from '../types/activity.ts'

/**
 * Добавить новую активность (шаги)
 */
export const addActivity = async (
	data: AddActivityRequest
): Promise<ActivityLog> => {
	const response = await apiClient.post<ActivityLog>('/activities', data)
	return response.data
}

/**
 * Получить активность за период с пагинацией
 */
export const getActivities = async (
	params?: GetActivitiesParams
): Promise<GetActivitiesResponse> => {
	const response = await apiClient.get<GetActivitiesResponse>('/activities', {
		params,
	})
	return response.data
}

/**
 * Получить активность за сегодня с прогрессом по целям
 */
export const getTodayActivity = async (): Promise<ActivityLog> => {
	const response = await apiClient.get<ActivityLog>('/activities/today')
	return response.data
}

/**
 * Получить активность за конкретную дату
 */
export const getActivityByDate = async (date: string): Promise<ActivityLog> => {
	const response = await apiClient.get<ActivityLog>(`/activities/${date}`)
	return response.data
}

/**
 * Удалить детальную запись активности
 */
export const deleteActivity = async (
	activityId: string
): Promise<DeleteActivityResponse> => {
	const response = await apiClient.delete<DeleteActivityResponse>(
		`/activities/${activityId}`
	)
	return response.data
}

/**
 * Получить статистику за период
 */
export const getActivityStats = async (
	period: StatsPeriod
): Promise<GetActivityStatsResponse> => {
	const response = await apiClient.get<GetActivityStatsResponse>(
		'/activities/stats',
		{
			params: { period },
		}
	)
	return response.data
}
