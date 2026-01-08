import { apiClient } from '../client.ts'
import type {
	AuthResponse,
	LoginRequest,
	LogoutResponse,
	ProfileResponse,
	RefreshResponse,
	RegisterRequest,
} from '../types/auth.ts'

/**
 * Регистрация нового пользователя
 * @param data - данные для регистрации
 * @returns access_token и данные пользователя (refresh_token в httpOnly cookie)
 */
export const register = async (
	data: RegisterRequest
): Promise<AuthResponse> => {
	const response = await apiClient.post<AuthResponse>('/auth/register', data)
	return response.data
}

/**
 * Вход в систему
 * @param data - email и пароль
 * @returns access_token и данные пользователя (refresh_token в httpOnly cookie)
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
	const response = await apiClient.post<AuthResponse>('/auth/login', data)
	return response.data
}

/**
 * Обновление access токена через refresh токен
 * Refresh токен автоматически читается из httpOnly cookie
 * @returns новый access_token
 */
export const refreshToken = async (): Promise<RefreshResponse> => {
	const response = await apiClient.post<RefreshResponse>('/auth/refresh')
	return response.data
}

/**
 * Выход из системы
 * Удаляет refresh токен из БД и cookie
 */
export const logout = async (): Promise<LogoutResponse> => {
	const response = await apiClient.post<LogoutResponse>('/auth/logout')
	return response.data
}

/**
 * Получение профиля текущего пользователя
 * Требуется авторизация (access токен в заголовке)
 */
export const getProfile = async (): Promise<ProfileResponse> => {
	const response = await apiClient.get<ProfileResponse>('/auth/profile')
	return response.data
}
