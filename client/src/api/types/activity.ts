/**
 * Типы для API активности (шаги, сожженные калории)
 */

/**
 * Тип активности
 */
export const ActivityType = {
	WALKING: 'WALKING',
	FAST_WALKING: 'FAST_WALKING',
	RUNNING: 'RUNNING',
	CUSTOM: 'CUSTOM',
} as const

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType]

/**
 * Детальная запись активности
 */
export interface Activity {
	id: string
	type: ActivityType
	steps: number
	burnedCalories: number
	durationMinutes: number | null
	notes: string | null
	performedAt: string
	createdAt: string
}

/**
 * Запись активности за день (агрегированная)
 */
export interface ActivityLog {
	id: string | null
	date: string
	recordedAt?: string
	steps: number
	burnedCalories: number
	consumedCalories: number | null
	activities: Activity[]
	goal?: ActivityGoal
	createdAt?: string
	updatedAt?: string
}

/**
 * Прогресс по целям активности
 */
export interface ActivityGoal {
	targetSteps: number | null
	targetBurnedCalories: number | null
	progressSteps: number
	progressCalories: number
}

/**
 * Запрос на добавление активности
 */
export interface AddActivityRequest {
	steps: number
	activityType?: ActivityType
	date?: string
}

/**
 * Параметры запроса списка активностей
 */
export interface GetActivitiesParams {
	startDate?: string
	endDate?: string
	page?: number
	limit?: number
}

/**
 * Ответ со списком активностей
 */
export interface GetActivitiesResponse {
	activities: ActivityLog[]
	pagination: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

/**
 * Статистика активности
 */
export interface ActivityStats {
	totalDays: number
	activeDays: number
	totalSteps: number
	totalBurnedCalories: number
	avgSteps: number
	avgStepsActive: number
	avgBurnedCalories: number
	maxSteps: number
	maxStepsDate: string
	minSteps: number
	minStepsDate: string
}

/**
 * Данные за один день для статистики
 */
export interface DailyActivityData {
	date: string
	steps: number
	burnedCalories: number
}

/**
 * Параметры запроса статистики
 */
export type StatsPeriod = 'week' | 'month' | 'year'

/**
 * Ответ со статистикой
 */
export interface GetActivityStatsResponse {
	period: StatsPeriod
	startDate: string
	endDate: string
	stats: ActivityStats
	dailyData: DailyActivityData[]
}

/**
 * Ответ на удаление активности
 */
export interface DeleteActivityResponse {
	message: string
	activityLog: ActivityLog | null
}
