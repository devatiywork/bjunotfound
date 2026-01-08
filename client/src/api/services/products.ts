import { apiClient } from '../client'
import type {
	Category,
	CreateCategoryDto,
	CreateProductDto,
	CreateTagDto,
	Product,
	ProductFilters,
	ProductsResponse,
	ProductStats,
	Tag,
	UpdateCategoryDto,
	UpdateProductDto,
	UpdateTagDto,
} from '../types'

/**
 * Сервис для работы с продуктами
 */

// ========== PRODUCTS ==========

/**
 * Загрузить фото продукта
 */
export const uploadProductPhoto = async (
	file: File
): Promise<{ url: string; message: string }> => {
	const formData = new FormData()
	formData.append('file', file)

	const response = await apiClient.post('/products/upload-photo', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	})
	return response.data
}

/**
 * Создать продукт
 */
export const createProduct = async (
	data: CreateProductDto
): Promise<Product> => {
	const response = await apiClient.post('/products', data)
	return response.data
}

/**
 * Получить список продуктов с фильтрацией и пагинацией
 */
export const getProducts = async (
	filters?: ProductFilters
): Promise<ProductsResponse> => {
	const response = await apiClient.get('/products', { params: filters })
	return response.data
}

/**
 * Получить продукт по ID
 */
export const getProductById = async (id: string): Promise<Product> => {
	const response = await apiClient.get<Product>(`/products/${id}`)
	return response.data
}

/**
 * Найти продукт по штрих-коду
 */
export const getProductByBarcode = async (
	barcode: string
): Promise<Product> => {
	const response = await apiClient.get(`/products/barcode/${barcode}`)
	return response.data
}

/**
 * Обновить продукт
 */
export const updateProduct = async (
	id: string,
	data: UpdateProductDto
): Promise<Product> => {
	const response = await apiClient.patch(`/products/${id}`, data)
	return response.data
}

/**
 * Удалить продукт
 */
export const deleteProduct = async (
	id: string
): Promise<{ message: string }> => {
	const response = await apiClient.delete(`/products/${id}`)
	return response.data
}

/**
 * Получить статистику продуктов (только для админов)
 */
export const getProductStats = async (): Promise<ProductStats> => {
	const response = await apiClient.get('/products/stats')
	return response.data
}

// ========== CATEGORIES ==========

/**
 * Создать категорию (только админ)
 */
export const createCategory = async (
	data: CreateCategoryDto
): Promise<Category> => {
	const response = await apiClient.post('/categories', data)
	return response.data
}

/**
 * Получить список всех категорий
 */
export const getCategories = async (): Promise<Category[]> => {
	const response = await apiClient.get('/categories')
	return response.data
}

/**
 * Получить категорию по ID
 */
export const getCategoryById = async (id: string): Promise<Category> => {
	const response = await apiClient.get(`/categories/${id}`)
	return response.data
}

/**
 * Обновить категорию (только админ)
 */
export const updateCategory = async (
	id: string,
	data: UpdateCategoryDto
): Promise<Category> => {
	const response = await apiClient.patch(`/categories/${id}`, data)
	return response.data
}

/**
 * Удалить категорию (только админ)
 */
export const deleteCategory = async (
	id: string
): Promise<{ message: string }> => {
	const response = await apiClient.delete(`/categories/${id}`)
	return response.data
}

// ========== TAGS ==========

/**
 * Создать тег (только админ)
 */
export const createTag = async (data: CreateTagDto): Promise<Tag> => {
	const response = await apiClient.post('/tags', data)
	return response.data
}

/**
 * Получить список всех тегов
 */
export const getTags = async (): Promise<Tag[]> => {
	const response = await apiClient.get('/tags')
	return response.data
}

/**
 * Получить тег по ID
 */
export const getTagById = async (id: string): Promise<Tag> => {
	const response = await apiClient.get(`/tags/${id}`)
	return response.data
}

/**
 * Обновить тег (только админ)
 */
export const updateTag = async (
	id: string,
	data: UpdateTagDto
): Promise<Tag> => {
	const response = await apiClient.patch(`/tags/${id}`, data)
	return response.data
}

/**
 * Удалить тег (только админ)
 */
export const deleteTag = async (id: string): Promise<{ message: string }> => {
	const response = await apiClient.delete(`/tags/${id}`)
	return response.data
}
