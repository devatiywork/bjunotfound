import type { Pagination } from './admin'

/**
 * Единицы измерения продуктов
 */
export const ProductUnit = {
	G: 'G',
	ML: 'ML',
	PIECE: 'PIECE',
	PORTION: 'PORTION',
} as const

export type ProductUnit = (typeof ProductUnit)[keyof typeof ProductUnit]

/**
 * Источник продукта
 */
export const ProductSource = {
	ADMIN: 'ADMIN',
	USER: 'USER',
	API: 'API',
	IMPORT: 'IMPORT',
} as const

export type ProductSource = (typeof ProductSource)[keyof typeof ProductSource]

/**
 * Категория продуктов
 */
export interface Category {
	id: string
	name: string
	description?: string
	createdAt: string
	_count?: {
		products: number
	}
}

/**
 * Тег продукта
 */
export interface Tag {
	id: string
	name: string
	createdAt: string
	_count?: {
		products: number
	}
}

/**
 * Связь продукта с тегом
 */
export interface ProductTag {
	tag: Tag
}

/**
 * Создатель продукта
 */
export interface ProductCreator {
	id: string
	email: string
}

/**
 * Продукт (полная информация)
 */
export interface Product {
	id: string
	name: string
	description?: string | null
	calories: number
	proteins: number
	fats: number
	carbs: number
	fiber?: number | null
	sugar?: number | null
	saturatedFat?: number | null
	sodium?: number | null
	servingSize?: number | null
	unit: ProductUnit
	brand?: string | null
	barcode?: string | null
	photo?: string | null
	price?: number | null
	isVerified: boolean
	source: ProductSource
	userId?: string | null
	isPublic: boolean
	categoryId: string
	createdAt: string
	updatedAt: string
	category: Category
	tags: ProductTag[]
	creator?: ProductCreator | null
}

/**
 * Данные для создания продукта
 */
export interface CreateProductDto {
	name: string
	description?: string
	calories: number
	proteins: number
	fats: number
	carbs: number
	fiber?: number
	sugar?: number
	saturatedFat?: number
	sodium?: number
	servingSize?: number
	unit: ProductUnit
	brand?: string
	barcode?: string
	photo?: string
	price?: number
	isPublic?: boolean
	categoryId: string
	tagIds?: string[]
}

/**
 * Данные для обновления продукта
 */
export interface UpdateProductDto {
	name?: string
	description?: string
	calories?: number
	proteins?: number
	fats?: number
	carbs?: number
	fiber?: number
	sugar?: number
	saturatedFat?: number
	sodium?: number
	servingSize?: number
	unit?: ProductUnit
	brand?: string
	barcode?: string
	photo?: string
	price?: number
	isPublic?: boolean
	categoryId?: string
	tagIds?: string[]
}

/**
 * Параметры фильтрации и поиска продуктов
 */
export interface ProductFilters {
	page?: number
	limit?: number
	search?: string
	categoryId?: string
	tagIds?: string[]
	minCalories?: number
	maxCalories?: number
	minPrice?: number
	maxPrice?: number
	source?: ProductSource
	isVerified?: boolean
	sortBy?: 'name' | 'calories' | 'price' | 'createdAt'
	sortOrder?: 'asc' | 'desc'
}

/**
 * Ответ со списком продуктов
 */
export interface ProductsResponse {
	products: Product[]
	pagination: Pagination
}

/**
 * Статистика по продуктам
 */
export interface ProductStats {
	total: number
	bySource: Array<{
		source: ProductSource
		_count: number
	}>
	topCategories: Array<{
		categoryId: string
		_count: number
	}>
	recentlyAdded: number
}

/**
 * Данные для создания категории
 */
export interface CreateCategoryDto {
	name: string
	description?: string
}

/**
 * Данные для обновления категории
 */
export interface UpdateCategoryDto {
	name?: string
	description?: string
}

/**
 * Данные для создания тега
 */
export interface CreateTagDto {
	name: string
}

/**
 * Данные для обновления тега
 */
export interface UpdateTagDto {
	name?: string
}
