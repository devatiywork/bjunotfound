// Статус события питания
export type MealEventStatus = 'PLANNED' | 'COMPLETED' | 'SKIPPED'

// Событие питания (базовое)
export interface MealEvent {
	id: string
	userId: string
	startAt: string
	dishId: string
	portions: number
	mealTypeId?: string | null
	note?: string | null
	status: MealEventStatus
	timezone?: string | null
	completedAt?: string | null
	isArchived: boolean
	createdAt: string
	updatedAt: string
}

// Вложенное блюдо в событии периода
export interface MealEventDish {
	id: string
	name: string
	servingSize?: number
	photos?: string[]
}

// Вложенный тип приема пищи в событии периода
export interface MealEventMealType {
	id: string
	name: string
}

// Событие питания с вложенными данными (из /period)
export interface MealEventWithDetails {
	id: string
	userId: string
	startAt: string
	portions: number
	status: MealEventStatus
	note?: string | null
	timezone?: string | null
	dish: MealEventDish
	mealType?: MealEventMealType | null
}

// Данные о КБЖУ (computed)
export interface MealEventComputedValues {
	calories: number
	protein: number
	fat: number
	carbs: number
	price?: number
}

export interface MealEventComputed {
	perPortion: MealEventComputedValues
	total: MealEventComputedValues
	issues: string[]
}

// Детальное событие питания (из GET /meal-events/:id)
export interface MealEventDetailed extends MealEventWithDetails {
	computed: MealEventComputed
}

// Ответ API для /period
export interface MealEventsPeriodResponse {
	period: {
		startDate: string
		endDate: string
	}
	events: MealEventWithDetails[]
	summary: {
		totalEvents: number
		planned: number
		completed: number
		skipped: number
	}
}

// DTO для создания события
export interface CreateMealEventDto {
	startAt: string
	dishId: string
	portions?: number
	mealTypeId?: string
	note?: string
	timezone?: string
}

// DTO для обновления события
export interface UpdateMealEventDto {
	startAt?: string
	dishId?: string
	portions?: number
	mealTypeId?: string | null
	note?: string | null
	status?: MealEventStatus
	timezone?: string
}

// DTO для изменения статуса события
export interface UpdateMealEventStatusDto {
	status: 'COMPLETED' | 'SKIPPED'
}
