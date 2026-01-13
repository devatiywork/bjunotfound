// Языки для мультиязычных названий
export type Lang = 'RU' | 'EN' | 'UK' | 'ES' | 'FR' | 'DE'

// Пищевая ценность продукта (на 100г/100мл)
export interface ProductNutrition {
	productUserId: string
	caloriesKcal: number
	proteinsG: number
	fatsG: number
	carbohydratesG: number
	sugarsG?: number | null
	fiberG?: number | null
	saltG?: number | null
}

// Мультиязычное название продукта
export interface ProductName {
	productUserId: string
	lang: Lang
	name: string
}

// История покупок продукта
export interface ProductPurchaseHistory {
	id: string
	productUserId: string
	purchaseDate: string
	priceCents: number
	currency: string
	storeName?: string | null
	storeAddress?: string | null
	notes?: string | null
	createdAt: string
	updatedAt: string
}

// Фотография продукта
export interface ProductPhoto {
	id: string
	productUserId: string
	url: string
	publicId: string
	format: string
	width: number
	height: number
	sizeBytes: number
	uploadedAt: string
	createdAt: string
}

// Пользовательская порция
export interface ProductPortion {
	id: string
	productUserId: string
	name: string
	lang: Lang
	gramsOrMl: number
	createdAt: string
	updatedAt: string
}

// Упаковка продукта
export interface ProductPackage {
	id: string
	productUserId: string
	totalWeightG?: number | null
	totalVolumeMl?: number | null
	priceTotal: number
	currency: 'RUB' | 'USD' | 'EUR' | 'UAH' | 'KZT'
	purchasedAt: string
	store?: string | null
	note?: string | null
	createdAt: string
	updatedAt: string
}

// Порция продукта (serving) - полный интерфейс
export interface ProductServing {
	id: string
	productUserId: string
	name: string
	amountUnits: number
	weightG?: number | null
	volumeMl?: number | null
	isDefault: boolean
	createdAt: string
	updatedAt: string
}

// Основная модель пользовательского продукта
export interface ProductUser {
	id: string
	userId: string
	barcode?: string | null
	categoryId?: string | null
	brandId?: string | null
	productGlobalId?: string | null
	photos: ProductPhoto[]
	createdAt: string
	updatedAt: string
	names: ProductName[]
	nutrition: ProductNutrition
	purchaseHistory?: ProductPurchaseHistory[]
	portions?: ProductPortion[]
	servings?: ProductServing[]
	packages?: ProductPackage[]
	category?: any // Тип категории из categories.ts
	brand?: any // Тип бренда из brands.ts
	productGlobal?: any
	user?: {
		id: string
		email: string
	}
	_count?: {
		purchaseHistory: number
		portions: number
		packages?: number
		servings?: number
	}
}

// DTO для создания продукта
export interface CreateProductUserDto {
	name: string
	lang?: Lang
	barcode?: string
	categoryId?: string
	brandId?: string
	productGlobalId?: string
	nutrition: {
		caloriesKcal: number
		proteinsG: number
		fatsG: number
		carbohydratesG: number
		sugarsG?: number
		fiberG?: number
		saltG?: number
	}
}

// DTO для обновления продукта
export interface UpdateProductUserDto {
	name?: string
	lang?: Lang
	barcode?: string
	categoryId?: string
	brandId?: string
	productGlobalId?: string
	nutrition?: {
		caloriesKcal?: number
		proteinsG?: number
		fatsG?: number
		carbohydratesG?: number
		sugarsG?: number
		fiberG?: number
		saltG?: number
	}
}

// Параметры запроса списка продуктов
export interface ListProductsUserParams {
	page?: number
	limit?: number
	search?: string
	categoryId?: string
	brandId?: string
	sortBy?: 'name' | 'createdAt' | 'updatedAt'
	sortOrder?: 'asc' | 'desc'
}

// Параметры запроса списка всех продуктов (admin only)
export interface ListAllProductsParams {
	page?: number
	limit?: number
	categoryId?: string
	brandId?: string
	userId?: string
}

// Ответ со списком продуктов
export interface ListProductsUserResponse {
	products: ProductUser[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

// Ответ на создание/обновление продукта
export interface ProductUserResponse {
	id: string
	userId: string
	barcode?: string | null
	categoryId?: string | null
	brandId?: string | null
	productGlobalId?: string | null
	photos: ProductPhoto[] | string[]
	createdAt: string
	updatedAt: string
	names: ProductName[]
	nutrition: ProductNutrition
	category?: any
	brand?: any
	productGlobal?: any
	packages?: ProductPackage[]
	servings?: ProductServing[]
	user?: {
		id: string
		email: string
	}
}

// DTO для создания пакета
export interface CreatePackageDto {
	totalWeightG?: number
	totalVolumeMl?: number
	priceTotal: number
	currency: 'RUB' | 'USD' | 'EUR' | 'UAH' | 'KZT'
	purchasedAt?: string
	store?: string
	note?: string
}

// DTO для обновления пакета
export interface UpdatePackageDto {
	totalWeightG?: number
	totalVolumeMl?: number
	priceTotal?: number
	currency?: 'RUB' | 'USD' | 'EUR' | 'UAH' | 'KZT'
	purchasedAt?: string
	store?: string
	note?: string
}

// DTO для создания порции
export interface CreateServingDto {
	name: string
	amountUnits?: number
	weightG?: number
	volumeMl?: number
	isDefault?: boolean
}

// DTO для обновления порции
export interface UpdateServingDto {
	name?: string
	amountUnits?: number
	weightG?: number
	volumeMl?: number
	isDefault?: boolean
}
