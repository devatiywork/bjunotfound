import { apiClient } from '../client'
import type {
	CreatePackageDto,
	CreateProductUserDto,
	CreateServingDto,
	ListAllProductsParams,
	ListProductsUserParams,
	ListProductsUserResponse,
	ProductPackage,
	ProductServing,
	ProductUser,
	ProductUserResponse,
	UpdatePackageDto,
	UpdateProductUserDto,
	UpdateServingDto,
} from '../types/products'

const BASE_URL = '/products-user'

/**
 * Получить список пользовательских продуктов
 */
export async function listProductsUser(
	params?: ListProductsUserParams
): Promise<ListProductsUserResponse> {
	const response = await apiClient.get<ListProductsUserResponse>(BASE_URL, {
		params,
	})
	return response.data
}

/**
 * Получить мои продукты с фильтрами и пагинацией
 */
export async function getMyProducts(params?: {
	page?: number
	limit?: number
	categoryId?: string
	brandId?: string
}): Promise<ListProductsUserResponse> {
	const response = await apiClient.get<ListProductsUserResponse>(
		`${BASE_URL}/my`,
		{ params }
	)
	return response.data
}

/**
 * Поиск моих продуктов по запросу
 * Возвращает до 50 результатов, поиск по всем языкам
 */
export async function searchMyProducts(query: string): Promise<ProductUser[]> {
	const response = await apiClient.get<ProductUser[]>(`${BASE_URL}/my/search`, {
		params: { query },
	})
	return response.data
}

/**
 * Получить продукт по ID
 */
export async function getProductUser(id: string): Promise<ProductUserResponse> {
	const response = await apiClient.get<ProductUserResponse>(`${BASE_URL}/${id}`)
	return response.data
}

/**
 * Создать новый продукт
 */
export async function createProductUser(
	data: CreateProductUserDto
): Promise<ProductUserResponse> {
	const response = await apiClient.post<ProductUserResponse>(BASE_URL, data)
	return response.data
}

/**
 * Обновить продукт
 */
export async function updateProductUser(
	id: string,
	data: UpdateProductUserDto
): Promise<ProductUserResponse> {
	const response = await apiClient.patch<ProductUserResponse>(
		`${BASE_URL}/${id}`,
		data
	)
	return response.data
}

/**
 * Удалить продукт
 */
export async function deleteProductUser(id: string): Promise<void> {
	await apiClient.delete(`${BASE_URL}/${id}`)
}

/**
 * Загрузить фотографию продукта
 */
export async function uploadProductPhoto(
	id: string,
	file: File
): Promise<{ message: string; photoUrl: string; totalPhotos: number }> {
	const formData = new FormData()
	formData.append('photo', file)

	const response = await apiClient.post<{
		message: string
		photoUrl: string
		totalPhotos: number
	}>(`${BASE_URL}/${id}/photos`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	})
	return response.data
}

/**
 * Удалить фотографию продукта
 */
export async function deleteProductPhoto(
	id: string,
	photoUrl: string
): Promise<{ message: string; totalPhotos: number }> {
	const response = await apiClient.delete<{
		message: string
		totalPhotos: number
	}>(`${BASE_URL}/${id}/photos`, {
		params: { photoUrl },
	})
	return response.data
}

/**
 * Получить список всех продуктов (admin only)
 */
export async function listAllProducts(
	params?: ListAllProductsParams
): Promise<ListProductsUserResponse> {
	const response = await apiClient.get<ListProductsUserResponse>(BASE_URL, {
		params,
	})
	return response.data
}

/**
 * Создать новую покупку для продукта
 */
export async function createPackage(
	productId: string,
	data: CreatePackageDto
): Promise<ProductPackage> {
	const response = await apiClient.post<ProductPackage>(
		`${BASE_URL}/${productId}/packages`,
		data
	)
	return response.data
}

/**
 * Обновить покупку продукта
 */
export async function updatePackage(
	productId: string,
	packageId: string,
	data: UpdatePackageDto
): Promise<ProductPackage> {
	const response = await apiClient.patch<ProductPackage>(
		`${BASE_URL}/${productId}/packages/${packageId}`,
		data
	)
	return response.data
}

/**
 * Удалить покупку продукта
 */
export async function deletePackage(
	productId: string,
	packageId: string
): Promise<{ message: string }> {
	const response = await apiClient.delete<{ message: string }>(
		`${BASE_URL}/${productId}/packages/${packageId}`
	)
	return response.data
}

/**
 * Получить список покупок продукта
 */
export async function listPackages(
	productId: string
): Promise<ProductPackage[]> {
	const response = await apiClient.get<ProductPackage[]>(
		`${BASE_URL}/${productId}/packages`
	)
	return response.data
}

// === МЕТОДЫ ДЛЯ РАБОТЫ С ПОРЦИЯМИ ===

/**
 * Создать порцию продукта
 */
export async function createServing(
	productId: string,
	data: CreateServingDto
): Promise<ProductServing> {
	const response = await apiClient.post<ProductServing>(
		`${BASE_URL}/${productId}/servings`,
		data
	)
	return response.data
}

/**
 * Обновить порцию продукта
 */
export async function updateServing(
	productId: string,
	servingId: string,
	data: UpdateServingDto
): Promise<ProductServing> {
	const response = await apiClient.patch<ProductServing>(
		`${BASE_URL}/${productId}/servings/${servingId}`,
		data
	)
	return response.data
}

/**
 * Удалить порцию продукта
 */
export async function deleteServing(
	productId: string,
	servingId: string
): Promise<{ message: string }> {
	const response = await apiClient.delete<{ message: string }>(
		`${BASE_URL}/${productId}/servings/${servingId}`
	)
	return response.data
}

/**
 * Получить список порций продукта
 */
export async function listServings(
	productId: string
): Promise<ProductServing[]> {
	const response = await apiClient.get<ProductServing[]>(
		`${BASE_URL}/${productId}/servings`
	)
	return response.data
}
