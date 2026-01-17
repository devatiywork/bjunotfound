// Статистика за период
export interface PeriodStatsResponse {
	period: {
		startDate: string
		endDate: string
		totalDays: number
	}
	events: {
		total: number
		completed: number
		skipped: number
		planned: number
		completionRate: number
	}
	nutrition: {
		total: {
			calories: number
			proteins: number
			fats: number
			carbs: number
		}
		averagePerDay: {
			calories: number
			proteins: number
			fats: number
			carbs: number
		}
	}
	dishes: {
		uniqueCount: number
		mostFrequent: Array<{
			dishId: string
			dishName: string
			count: number
		}>
	}
}

// Элемент списка покупок
export interface ShoppingListItem {
	productId: string
	productName: string
	brandName: string | null
	totalGrams: number
	estimatedPrice: number | null
	pricePerGram: number | null
	currency: string | null
	events: Array<{
		eventId: string
		dishName: string
		date: string
		grams: number
	}>
}

// Список покупок
export interface ShoppingListResponse {
	period: {
		startDate: string
		endDate: string
	}
	items: ShoppingListItem[]
	summary: {
		totalProducts: number
		totalEvents: number
		totalEstimatedPrice: number | null
		currency: string | null
		productsWithoutPrice: number
	}
}

// Параметры запроса статистики
export interface MealStatisticsParams {
	startDate?: string
	endDate?: string
}

// Параметры запроса дневной статистики
export interface DailyStatsParams {
	date?: string
}

// Нутриенты
export interface NutritionData {
	calories: number
	proteins: number
	fats: number
	carbs: number
}

// Событие приёма пищи в дневной статистике
export interface DailyMealEvent {
	eventId: string
	dishId: string
	dishName: string
	portions: number
	status: 'PLANNED' | 'COMPLETED' | 'SKIPPED'
	startAt: string
	nutrition: NutritionData
}

// Приём пищи (завтрак, обед и т.д.)
export interface DailyMeal {
	mealTypeId: string
	mealTypeName: string
	events: DailyMealEvent[]
	totals: NutritionData
}

// Ответ дневной статистики
export interface DailyStatsResponse {
	date: string
	meals: DailyMeal[]
	totals: {
		consumed: NutritionData
		planned: NutritionData
	}
	goal: {
		calories: number | null
		proteins: number | null
		fats: number | null
		carbs: number | null
	}
	remaining: {
		calories: number | null
		proteins: number | null
		fats: number | null
		carbs: number | null
	}
}
