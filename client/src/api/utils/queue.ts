interface QueueItem {
	resolve: (value?: unknown) => void
	reject: (reason?: unknown) => void
}

let failedQueue: QueueItem[] = []

/**
 * Добавление запроса в очередь ожидания обновления токена
 */
export const addToQueue = (resolve: (value?: unknown) => void, reject: (reason?: unknown) => void): void => {
	failedQueue.push({ resolve, reject })
}

/**
 * Обработка очереди запросов после обновления токена
 */
export const processQueue = (error: unknown, token: string | null = null): void => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token)
		}
	})

	failedQueue = []
}

/**
 * Очистка очереди запросов
 */
export const clearQueue = (): void => {
	failedQueue = []
}
