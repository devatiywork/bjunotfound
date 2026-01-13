// Статус блюда
export type DishStatus = 'DRAFT' | 'READY'

// Тип измерения для ингредиента
export type DishMeasureType = 'GRAMS' | 'MILLILITERS' | 'SERVINGS'

// Основной тип блюда
export interface Dish {
	id: string
	userId: string
	name: string
	description: string
	portions: number
	photos?: string[]
	status: DishStatus
	isArchived: boolean
	createdAt: string
	updatedAt: string
	_count?: {
		items: number
	}
	// Данные на 1 порцию (приходят из списка)
	perPortion?: {
		nutrition: {
			kcal: number
			proteins: number
			fats: number
			carbs: number
		}
		price?: number
		currency?: string
	}
}

// Ингредиент блюда
export interface DishItem {
	id: string
	dishId: string
	productUserId: string
	sortOrder: number
	note?: string
	measureType: DishMeasureType
	amountG?: number
	amountMl?: number
	servingId?: string
	servingsCount?: number
	productUser: {
		id: string
		names: Array<{
			lang: string
			name: string
		}>
		nutrition: {
			caloriesKcal: number
			proteinsG: number
			fatsG: number
			carbohydratesG: number
		}
		packages?: Array<{
			id: string
			totalWeightG?: number
			totalVolumeMl?: number
			priceTotal: number
			currency: string
			purchasedAt: string
		}>
	}
}

// Расчеты для блюда
export interface DishCalculations {
	totalIngredientsWeight: number
	totals: {
		kcal: number
		proteins: number
		fats: number
		carbs: number
		price?: number
		currency?: string
	}
	perPortion: {
		kcal: number
		proteins: number
		fats: number
		carbs: number
		price?: number
		currency?: string
	}
	per100g: {
		kcal: number
		proteins: number
		fats: number
		carbs: number
	}
}

// Детальное блюдо с расчетами
export interface DishWithCalculations {
	dish: Dish
	items: DishItem[]
	computed: DishCalculations
	issues: string[]
}

// DTO для создания блюда
export interface CreateDishDto {
	name: string
	description: string
	portions: number
}

// DTO для обновления блюда
export interface UpdateDishDto {
	name?: string
	description?: string
	portions?: number
	status?: DishStatus
}

// Параметры для получения списка блюд
export interface ListDishesParams {
	page?: number
	limit?: number
	status?: DishStatus
	search?: string
}

// Ответ со списком блюд
export interface ListDishesResponse {
	data: Dish[]
	meta: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

// ========== DTO для ингредиентов ==========

// DTO для добавления ингредиента
export interface CreateDishItemDto {
	productUserId: string
	measureType: DishMeasureType
	amountG?: number
	amountMl?: number
	servingId?: string
	servingsCount?: number
	note?: string
	sortOrder?: number
}

// DTO для обновления ингредиента
export interface UpdateDishItemDto {
	measureType?: DishMeasureType
	amountG?: number
	amountMl?: number
	servingId?: string
	servingsCount?: number
	note?: string
}

// DTO для изменения порядка ингредиентов
export interface ReorderDishItemsDto {
	items: Array<{
		id: string
		sortOrder: number
	}>
}
