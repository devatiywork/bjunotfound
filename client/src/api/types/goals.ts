// Типы для Goals API

export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface Goal {
	id: string
	userId: string
	targetWeight?: number
	targetCalories?: number
	targetSteps?: number
	targetBurnedCalories?: number
	startDate: string // ISO date string
	endDate: string // ISO date string
	status: GoalStatus
	isActive: boolean
	isArchived: boolean
	deletedAt: string | null
	deletedBy: string | null
	createdAt: string
	updatedAt: string
}

export interface CreateGoalRequest {
	targetWeight?: number
	targetCalories?: number
	targetSteps?: number
	targetBurnedCalories?: number
	startDate?: string // YYYY-MM-DD format
	endDate?: string // YYYY-MM-DD format
}

export interface GoalProgress {
	goalId: string
	status: GoalStatus
	initialWeight: number
	currentWeight: number
	targetWeight: number | null
	daysTotal: number
	daysPassed: number
	daysRemaining: number
	weightToChange: number
	weightChanged: number // Может быть отрицательным если вес идет в неправильную сторону
	weightRemaining: number
	progressPercent: number // Может быть отрицательным
	timeProgressPercent: number
	onTrack: boolean
	recommendation: string
	targetCalories: number | null
}

export interface RecalculateRecommendation {
	goalId: string
	currentCalories: number | null
	recommendedCalories: number
	currentWeight: number
	targetWeight: number
	remainingDays: number
	isRealistic: boolean
	warning: string | null
	message: string
}

// Расчет калорий (предпросмотр без сохранения)
export interface CalculateCaloriesRequest {
	targetWeight: number
	weeklyWeightChange: number // 0.1-2.0 кг/неделю (положительное = набор, отрицательное = похудение)
}

export interface CalculateCaloriesResponse {
	currentWeight: number
	targetWeight: number
	weeklyWeightChange: number
	bmr: number
	tdee: number
	targetCalories: number
	dailyDeficit: number // отрицательный при похудении
	estimatedDays: number
	estimatedWeeks: number
	isRealistic: boolean
	warnings: string[]
}

// Генерация вариантов темпа
export interface CalculatePaceRequest {
	targetWeight: number
}

export interface PaceOption {
	id: string // 'very-fast' | 'fast' | 'moderate' | 'comfortable'
	label: string
	description: string
	targetCalories: number
	deficit: number
	days: number
	endDate: string // ISO date string
	targetSteps: number
	targetBurnedCalories: number
	isRecommended: boolean
	isRealistic: boolean
	warning?: string // опционально для совместимости
}

export interface CalculatePaceResponse {
	currentWeight: number
	targetWeight: number
	startDate: string // ISO date string
	options: PaceOption[]
}
