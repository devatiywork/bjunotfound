import { apiClient } from '../client'
import type {
	Brand,
	CreateBrandDto,
	DeleteBrandResponse,
	DeletePhotoResponse,
	GetBrandResponse,
	RejectBrandDto,
	UpdateBrandDto,
	UploadPhotoResponse,
} from '../types/brands'

// Создание бренда
export async function createBrand(dto: CreateBrandDto): Promise<Brand> {
	const response = await apiClient.post<Brand>('/brands', dto)
	return response.data
}

// Обновление бренда (только админы)
export async function updateBrand(
	id: string,
	dto: UpdateBrandDto
): Promise<Brand> {
	const response = await apiClient.patch<Brand>(`/brands/${id}`, dto)
	return response.data
}

// Удаление бренда (только админы)
export async function deleteBrand(id: string): Promise<DeleteBrandResponse> {
	const response = await apiClient.delete<DeleteBrandResponse>(`/brands/${id}`)
	return response.data
}

// Получение бренда по ID
export async function getBrand(id: string): Promise<Brand> {
	const response = await apiClient.get<GetBrandResponse>(`/brands/${id}`)
	return response.data.brand
}

// Получение списка всех брендов
export async function listBrands(): Promise<Brand[]> {
	const response = await apiClient.get<Brand[]>('/brands')
	return response.data
}

// Получение брендов на модерации (только админы)
export async function listPendingBrands(): Promise<Brand[]> {
	const response = await apiClient.get<Brand[]>('/brands/pending')
	return response.data
}

// Получение моих брендов
export async function listMyBrands(): Promise<Brand[]> {
	const response = await apiClient.get<Brand[]>('/brands/my')
	return response.data
}

// Одобрение бренда (только админы)
export async function approveBrand(id: string): Promise<Brand> {
	const response = await apiClient.post<Brand>(`/brands/${id}/approve`)
	return response.data
}

// Отклонение бренда (только админы)
export async function rejectBrand(
	id: string,
	dto: RejectBrandDto
): Promise<Brand> {
	const response = await apiClient.post<Brand>(`/brands/${id}/reject`, dto)
	return response.data
}

// Загрузка фото бренда
export async function uploadBrandPhoto(
	id: string,
	file: File
): Promise<UploadPhotoResponse> {
	const formData = new FormData()
	formData.append('file', file)

	const response = await apiClient.post<UploadPhotoResponse>(
		`/brands/${id}/photo`,
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}
	)
	return response.data
}

// Удаление фото бренда (только админы)
export async function deleteBrandPhoto(
	id: string,
	photoUrl: string
): Promise<DeletePhotoResponse> {
	const response = await apiClient.delete<DeletePhotoResponse>(
		`/brands/${id}/photo`,
		{
			data: { photoUrl },
		}
	)
	return response.data
}
