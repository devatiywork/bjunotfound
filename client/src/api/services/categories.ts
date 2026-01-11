// API сервис для работы с категориями

import { apiClient } from '../client'
import type {
	Category,
	CategoryDeletePhotoResponse,
	CategoryUploadPhotoResponse,
	CategoryWithRelations,
	CreateCategoryDto,
	DeleteCategoryResponse,
	GetCategoryTreeResponse,
	ListCategoriesQuery,
	ListCategoriesResponse,
	UpdateCategoryDto,
} from '../types/categories'

/**
 * Создание новой категории
 */
export async function createCategory(
	dto: CreateCategoryDto
): Promise<Category> {
	const response = await apiClient.post<Category>('/categories', dto)
	return response.data
}

/**
 * Обновление существующей категории
 */
export async function updateCategory(
	id: string,
	dto: UpdateCategoryDto
): Promise<Category> {
	const response = await apiClient.patch<Category>(`/categories/${id}`, dto)
	return response.data
}

/**
 * Удаление категории
 */
export async function deleteCategory(
	id: string
): Promise<DeleteCategoryResponse> {
	const response = await apiClient.delete<DeleteCategoryResponse>(
		`/categories/${id}`
	)
	return response.data
}

/**
 * Получение категории по ID
 */
export async function getCategory(id: string): Promise<CategoryWithRelations> {
	const response = await apiClient.get<CategoryWithRelations>(
		`/categories/${id}`
	)
	return response.data
}

/**
 * Получение категории по slug
 */
export async function getCategoryBySlug(
	slug: string
): Promise<CategoryWithRelations> {
	const response = await apiClient.get<CategoryWithRelations>(
		`/categories/slug/${slug}`
	)
	return response.data
}

/**
 * Получение списка категорий с фильтрацией
 */
export async function listCategories(
	query?: ListCategoriesQuery
): Promise<ListCategoriesResponse> {
	const response = await apiClient.get<ListCategoriesResponse>('/categories', {
		params: query,
	})
	return response.data
}

/**
 * Получение дерева категорий
 */
export async function getCategoryTree(query?: {
	onlyActive?: boolean
}): Promise<GetCategoryTreeResponse> {
	const response = await apiClient.get<GetCategoryTreeResponse>(
		'/categories/tree',
		{ params: query }
	)
	return response.data
}

/**
 * Загрузка фотографии категории
 */
export async function uploadCategoryPhoto(
	id: string,
	file: File
): Promise<CategoryUploadPhotoResponse> {
	const formData = new FormData()
	formData.append('photo', file)

	const response = await apiClient.post<CategoryUploadPhotoResponse>(
		`/categories/${id}/photo`,
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}
	)
	return response.data
}

/**
 * Удаление фотографии категории
 */
export async function deleteCategoryPhoto(
	id: string,
	photoUrl: string
): Promise<CategoryDeletePhotoResponse> {
	const response = await apiClient.delete<CategoryDeletePhotoResponse>(
		`/categories/${id}/photo`,
		{
			data: { photoUrl },
		}
	)
	return response.data
}
