import { apiClient } from '../client.ts'
import type {
	DailyStatsParams,
	DailyStatsResponse,
	MealStatisticsParams,
	PeriodStatsResponse,
	ShoppingListResponse,
} from '../types/meal-statistics.ts'

/**
 * Получить статистику за период
 */
export const getPeriodStats = async (
	params?: MealStatisticsParams
): Promise<PeriodStatsResponse> => {
	const response = await apiClient.get<PeriodStatsResponse>(
		'/meal-statistics/period-stats',
		{ params }
	)
	return response.data
}

/**
 * Получить список покупок
 */
export const getShoppingList = async (
	params?: MealStatisticsParams
): Promise<ShoppingListResponse> => {
	const response = await apiClient.get<ShoppingListResponse>(
		'/meal-statistics/shopping-list',
		{ params }
	)
	return response.data
}

/**
 * Получить дневную статистику питания
 */
export const getDailyStats = async (
	params?: DailyStatsParams
): Promise<DailyStatsResponse> => {
	const response = await apiClient.get<DailyStatsResponse>(
		'/meal-statistics/daily',
		{ params }
	)
	return response.data
}
