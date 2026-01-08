/**
 * Получение access token из localStorage
 */
export const getAccessToken = (): string | null => {
	return localStorage.getItem('accessToken')
}

/**
 * Сохранение access token в localStorage
 */
export const setAccessToken = (token: string): void => {
	localStorage.setItem('accessToken', token)
}

/**
 * Удаление access token из localStorage
 */
export const removeAccessToken = (): void => {
	localStorage.removeItem('accessToken')
}

/**
 * Проверка авторизации пользователя
 */
export const isAuthenticated = (): boolean => {
	return !!getAccessToken()
}
