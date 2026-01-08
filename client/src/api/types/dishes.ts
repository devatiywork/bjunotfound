// Type-only types (union types вместо enum для совместимости с erasableSyntaxOnly)
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'DESSERT'

export type CuisineType =
	| 'RUSSIAN'
	| 'ITALIAN'
	| 'ASIAN'
	| 'MEXICAN'
	| 'FRENCH'
	| 'JAPANESE'
	| 'AMERICAN'
	| 'INDIAN'
	| 'MEDITERRANEAN'
	| 'GREEK'
	| 'OTHER'

export type DishCategory =
	| 'APPETIZER'
	| 'SOUP'
	| 'SALAD'
	| 'MAIN_COURSE'
	| 'SIDE_DISH'
	| 'DESSERT'
	| 'BEVERAGE'
	| 'BREAKFAST'
	| 'SNACK'
	| 'OTHER'

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

export type UnitType = 'G' | 'ML' | 'PIECE' | 'PORTION'

export type DataSource = 'ADMIN' | 'USER' | 'API' | 'IMPORT'

export type TagCategory =
	| 'DIETARY'
	| 'MEAL_TIME'
	| 'COOKING_TIME'
	| 'DIFFICULTY'
	| 'CUISINE'
	| 'OCCASION'
	| 'SPECIAL'

// Interfaces
export interface DishTag {
	id: string
	name: string
	category: TagCategory
	_count?: {
		dishes: number
	}
}

export interface DishIngredient {
	id: string
	dishId: string
	productId: string
	amount: number
	unit: UnitType
	product: {
		id: string
		name: string
		unit: UnitType
		calories: number
		proteins: number
		fats: number
		carbs: number
		price: number | null
		servingSize: number
	}
	calculatedPrice: number | null
}

export interface Dish {
	id: string
	name: string
	description?: string | null
	photo?: string | null

	// Порции
	servings: number
	servingSize?: number | null

	// Итоговые значения
	totalCalories: number
	totalProteins: number
	totalFats: number
	totalCarbs: number
	totalFiber?: number | null
	totalSugar?: number | null
	totalPrice: number | null
	totalWeight: number

	// На порцию
	caloriesPerServing: number
	proteinsPerServing: number
	fatsPerServing: number
	carbsPerServing: number
	pricePerServing: number | null

	// Метаданные
	cookingTimeMinutes?: number | null
	difficulty?: DifficultyLevel
	mealType?: MealType
	cuisineType?: CuisineType
	dishCategory?: DishCategory

	// Модерация
	userId: string
	isPublic: boolean
	isVerified: boolean
	source: DataSource

	// Связи
	creator: {
		id: string
		email: string
	}
	ingredients: DishIngredient[]
	tags: {
		tag: DishTag
	}[]

	// Даты
	createdAt: string
	updatedAt: string
}

// DTOs
export interface CreateDishIngredientDto {
	productId: string
	amount: number
	unit: UnitType
}

export interface CreateDishDto {
	name: string
	description?: string
	photo?: string
	servings: number
	servingSize?: number
	cookingTimeMinutes?: number
	difficulty?: DifficultyLevel
	mealType?: MealType
	cuisineType?: CuisineType
	dishCategory?: DishCategory
	isPublic?: boolean
	ingredients: CreateDishIngredientDto[]
	tagIds?: string[]
}

export interface UpdateDishDto extends Partial<CreateDishDto> {}

export interface FilterDishesDto {
	page?: number
	limit?: number
	search?: string
	tagIds?: string[]
	mealType?: MealType
	cuisineType?: CuisineType
	dishCategory?: DishCategory
	difficulty?: DifficultyLevel
	minCalories?: number
	maxCalories?: number
	minCookingTime?: number
	maxCookingTime?: number
	minPrice?: number
	maxPrice?: number
	source?: DataSource
	isVerified?: boolean
	sortBy?:
		| 'name'
		| 'caloriesPerServing'
		| 'pricePerServing'
		| 'cookingTimeMinutes'
		| 'createdAt'
	sortOrder?: 'asc' | 'desc'
}

export interface DishesResponse {
	dishes: Dish[]
	pagination: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

export interface CreateDishTagDto {
	name: string
	category: TagCategory
}

export interface UpdateDishTagDto extends Partial<CreateDishTagDto> {}

// Локализация
export const MEAL_TYPE_NAMES: Record<MealType, string> = {
	BREAKFAST: 'Завтрак',
	LUNCH: 'Обед',
	DINNER: 'Ужин',
	SNACK: 'Перекус',
	DESSERT: 'Десерт',
}

export const CUISINE_TYPE_NAMES: Record<CuisineType, string> = {
	RUSSIAN: 'Русская',
	ITALIAN: 'Итальянская',
	ASIAN: 'Азиатская',
	MEXICAN: 'Мексиканская',
	FRENCH: 'Французская',
	JAPANESE: 'Японская',
	AMERICAN: 'Американская',
	INDIAN: 'Индийская',
	MEDITERRANEAN: 'Средиземноморская',
	GREEK: 'Греческая',
	OTHER: 'Другая',
}

export const DISH_CATEGORY_NAMES: Record<DishCategory, string> = {
	APPETIZER: 'Закуска',
	SOUP: 'Суп',
	SALAD: 'Салат',
	MAIN_COURSE: 'Основное блюдо',
	SIDE_DISH: 'Гарнир',
	DESSERT: 'Десерт',
	BEVERAGE: 'Напиток',
	BREAKFAST: 'Завтрак',
	SNACK: 'Перекус',
	OTHER: 'Другое',
}

export const DIFFICULTY_LEVEL_NAMES: Record<DifficultyLevel, string> = {
	EASY: 'Простое',
	MEDIUM: 'Среднее',
	HARD: 'Сложное',
}

export const UNIT_TYPE_NAMES: Record<UnitType, string> = {
	G: 'г',
	ML: 'мл',
	PIECE: 'шт',
	PORTION: 'порция',
}

export const TAG_CATEGORY_NAMES: Record<TagCategory, string> = {
	DIETARY: 'Диетические особенности',
	MEAL_TIME: 'Время приема пищи',
	COOKING_TIME: 'Время приготовления',
	DIFFICULTY: 'Сложность',
	CUISINE: 'Кухня',
	OCCASION: 'Повод',
	SPECIAL: 'Особенности',
}
