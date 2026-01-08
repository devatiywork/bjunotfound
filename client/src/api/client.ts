import axios from 'axios'
import {
	addToQueue,
	getAccessToken,
	processQueue,
	removeAccessToken,
	setAccessToken,
} from './utils/index.ts'

const API_URL = import.meta.env.VITE_API_URL

// Создание экземпляра axios с базовой конфигурацией
export const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true, // Для отправки HTTP-only cookies с refresh token
})

// Request interceptor - добавляет access token к каждому запросу
apiClient.interceptors.request.use(
	config => {
		const token = getAccessToken()
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

// Response interceptor - обрабатывает ошибки авторизации и обновляет токены
let isRefreshing = false

apiClient.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		// Если ошибка 401 и это не запрос на авторизацию/регистрацию/обновление токена
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url?.includes('/auth/login') &&
			!originalRequest.url?.includes('/auth/register') &&
			!originalRequest.url?.includes('/auth/refresh')
		) {
			if (isRefreshing) {
				// Если токен уже обновляется, добавляем запрос в очередь
				return new Promise((resolve, reject) => {
					addToQueue(resolve, reject)
				})
					.then(token => {
						originalRequest.headers.Authorization = `Bearer ${token}`
						return apiClient(originalRequest)
					})
					.catch(err => {
						return Promise.reject(err)
					})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				// Попытка обновить access token через refresh token
				const response = await apiClient.post('/auth/refresh')
				const { access_token } = response.data

				setAccessToken(access_token)
				processQueue(null, access_token)

				// Повторяем оригинальный запрос с новым токеном
				originalRequest.headers.Authorization = `Bearer ${access_token}`
				return apiClient(originalRequest)
			} catch (refreshError) {
				// Если не удалось обновить токен, очищаем данные и перенаправляем на авторизацию
				processQueue(refreshError, null)
				removeAccessToken()

				// Перенаправление на страницу ошибки/авторизации
				if (typeof window !== 'undefined') {
					window.location.href = '/app/error'
				}

				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	}
)

// Экспорт функции для установки токена (используется после авторизации)
// Экспорт функции для выхода
export const logout = async (): Promise<void> => {
	try {
		await apiClient.post('/auth/logout')
	} catch (error) {
		console.error('Logout error:', error)
	} finally {
		removeAccessToken()
	}
}
