import { apiClient } from '../client.ts'
import type {
	UserProfile,
	UpdateProfileRequest,
	UpdateProfileResponse,
	ActivityLevel,
} from '../types/users.ts'

/**
 * Получение профиля текущего пользователя
 * Требуется авторизация (access токен в заголовке)
 */
export const getUserProfile = async (): Promise<UserProfile> => {
	const response = await apiClient.get<UserProfile>('/users/profile')
	return response.data
}

/**
 * Обновление профиля пользователя
 * Email редактировать нельзя
 * @param data - данные для обновления (все поля опциональны)
 * @returns обновленный профиль пользователя
 */
export const updateUserProfile = async (
	data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
	const response = await apiClient.patch<UpdateProfileResponse>(
		'/users/profile',
		data
	)
	return response.data
}

/**
 * Получение списка уровней активности
 * Требуется авторизация (access токен в заголовке)
 */
export const getActivityLevels = async (): Promise<ActivityLevel[]> => {
	const response = await apiClient.get<ActivityLevel[]>(
		'/users/activity-levels'
	)
	return response.data
}
