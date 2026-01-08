import { apiClient } from '../client.ts'
import type {
	CalculateCaloriesRequest,
	CalculateCaloriesResponse,
	CalculatePaceRequest,
	CalculatePaceResponse,
	CreateGoalRequest,
	Goal,
	GoalProgress,
	RecalculateRecommendation,
} from '../types/goals.ts'

/**
 * Получение активной цели пользователя
 * @returns активная цель или null если нет активной цели
 */
export const getActiveGoal = async (): Promise<Goal | null> => {
	const response = await apiClient.get<Goal | null>('/users/goal')
	return response.data
}

/**
 * Создание новой цели
 * Если у пользователя уже есть активная цель, она будет деактивирована
 * @param data - данные новой цели
 * @returns созданная цель
 */
export const createGoal = async (data: CreateGoalRequest): Promise<Goal> => {
	const response = await apiClient.post<Goal>('/users/goal', data)
	return response.data
}

/**
 * Деактивация текущей активной цели
 * @returns деактивированная цель
 */
export const deactivateGoal = async (): Promise<Goal> => {
	const response = await apiClient.delete<Goal>('/users/goal')
	return response.data
}

/**
 * Получение истории всех целей пользователя
 * Статусы автоматически обновляются при запросе
 * @returns массив всех целей, отсортированных по дате создания
 */
export const getGoalHistory = async (): Promise<Goal[]> => {
	const response = await apiClient.get<Goal[]>('/users/goal/history')
	return response.data
}

/**
 * Архивирование цели (мягкое удаление)
 * @param id - UUID цели
 * @returns архивированная цель
 */
export const archiveGoal = async (id: string): Promise<Goal> => {
	const response = await apiClient.delete<Goal>(`/goals/${id}`)
	return response.data
}

/**
 * Получение списка архивированных целей
 * @returns массив архивированных целей
 */
export const getArchivedGoals = async (): Promise<Goal[]> => {
	const response = await apiClient.get<Goal[]>('/goals/archived')
	return response.data
}

/**
 * Восстановление архивированной цели
 * @param id - UUID архивированной цели
 * @returns восстановленная цель
 */
export const restoreGoal = async (id: string): Promise<Goal> => {
	const response = await apiClient.post<Goal>(`/goals/${id}/restore`)
	return response.data
}

/**
 * Удаление цели навсегда (только для администраторов)
 * @param id - UUID цели
 * @returns сообщение об успешном удалении
 */
export const deleteGoalPermanently = async (
	id: string
): Promise<{ message: string }> => {
	const response = await apiClient.delete<{ message: string }>(
		`/goals/${id}/permanent`
	)
	return response.data
}

/**
 * Получить прогресс по цели
 * Возвращает детальную информацию о прогрессе выполнения цели
 * Автоматически обновляет статусы целей при запросе
 * @param goalId - UUID цели
 * @returns объект с прогрессом цели
 */
export const getGoalProgress = async (
	goalId: string
): Promise<GoalProgress> => {
	const response = await apiClient.get<GoalProgress>(
		`/goals/${goalId}/progress`
	)
	return response.data
}

/**
 * Получить рекомендацию по пересчету калорий
 * Возвращает рекомендацию по корректировке целевых калорий
 * НЕ изменяет цель автоматически - только возвращает рекомендацию
 * @param goalId - UUID цели
 * @returns объект с рекомендацией
 */
export const getRecalculateRecommendation = async (
	goalId: string
): Promise<RecalculateRecommendation> => {
	const response = await apiClient.post<RecalculateRecommendation>(
		`/goals/${goalId}/recalculate`
	)
	return response.data
}

/**
 * Обновить цель (для применения рекомендаций)
 * @param goalId - UUID цели
 * @param data - частичные данные для обновления
 * @returns обновленная цель
 */
export const updateGoal = async (
	goalId: string,
	data: Partial<Goal>
): Promise<Goal> => {
	const response = await apiClient.patch<Goal>(`/goals/${goalId}`, data)
	return response.data
}

/**
 * Расчет калорий (предпросмотр без сохранения)
 * Рассчитывает целевые калории для достижения указанного веса
 * НЕ сохраняет цель в БД - используется для предпросмотра
 * @param data - целевой вес и недельное изменение веса
 * @returns расчет с BMR, TDEE, калориями и оценкой реалистичности
 */
export const calculateCalories = async (
	data: CalculateCaloriesRequest
): Promise<CalculateCaloriesResponse> => {
	const response = await apiClient.post<CalculateCaloriesResponse>(
		'/goals/calculate-calories',
		data
	)
	return response.data
}

/**
 * Генерация вариантов темпа достижения цели
 * Генерирует 3-4 варианта темпа (быстрый, средний, комфортный)
 * НЕ сохраняет цель в БД
 * @param data - целевой вес
 * @returns варианты темпа с расчетами калорий и сроков
 */
export const calculatePace = async (
	data: CalculatePaceRequest
): Promise<CalculatePaceResponse> => {
	const response = await apiClient.post<CalculatePaceResponse>(
		'/goals/calculate-pace',
		data
	)
	return response.data
}
