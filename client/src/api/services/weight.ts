import { apiClient } from '../client.ts'
import type {
	AddWeightRequest,
	AddWeightResponse,
	AvailablePeriodResponse,
	LatestWeightResponse,
	WeightHistoryResponse,
	WeightPeriodResponse,
} from '../types/weight.ts'

/**
 * Добавление записи о весе
 * @param data - вес и опционально дата
 * @returns созданная запись о весе
 */
export const addWeight = async (
	data: AddWeightRequest
): Promise<AddWeightResponse> => {
	const response = await apiClient.post<AddWeightResponse>(
		'/users/weight',
		data
	)
	return response.data
}

/**
 * Получение истории веса (последние 50 записей)
 * @returns массив записей о весе
 */
export const getWeightHistory = async (): Promise<WeightHistoryResponse> => {
	const response = await apiClient.get<WeightHistoryResponse>('/users/weight')
	return response.data
}

/**
 * Получение последней записи веса
 * @returns последняя запись о весе или null
 */
export const getLatestWeight =
	async (): Promise<LatestWeightResponse | null> => {
		const response = await apiClient.get<LatestWeightResponse | null>(
			'/users/weight/latest'
		)
		return response.data
	}

/**
 * Удаление записи веса (жесткое удаление)
 * @param id - UUID записи веса
 * @returns сообщение об успешном удалении
 */
export const deleteWeight = async (
	id: string
): Promise<{ message: string }> => {
	const response = await apiClient.delete<{ message: string }>(
		`/users/weight/${id}`
	)
	return response.data
}

/**
 * Получение истории веса за период с расчетом разницы
 * @param startDate - начало периода (формат: YYYY-MM-DD)
 * @param endDate - конец периода (формат: YYYY-MM-DD)
 * @returns история веса за период с анализом
 */
export const getWeightPeriod = async (
	startDate: string,
	endDate: string
): Promise<WeightPeriodResponse> => {
	const response = await apiClient.get<WeightPeriodResponse>(
		'/users/weight/period',
		{
			params: { startDate, endDate },
		}
	)
	return response.data
}

/**
 * Получение доступного периода данных о весе
 * @returns информация о доступном периоде
 */
export const getAvailablePeriod =
	async (): Promise<AvailablePeriodResponse> => {
		const response = await apiClient.get<AvailablePeriodResponse>(
			'/users/weight/available-period'
		)
		return response.data
	}
