// API сервис для административной панели

import { apiClient } from '../client'
import type {
	AdminUser,
	AdminUserDetail,
	CalorieSetting,
	CheckRoleResponse,
	CreateRoleRequest,
	DeleteUserResponse,
	GetUsersResponse,
	ResetSettingsResponse,
	RoleWithCount,
	UpdateSettingRequest,
	UpdateSettingResponse,
	UpdateUserProfileRequest,
	UpdateUserRoleRequest,
	UpdateUserRoleResponse,
	UserStatsResponse,
} from '../types/admin'

/**
 * Проверка роли текущего пользователя
 */
export async function checkRole(): Promise<CheckRoleResponse> {
	const response = await apiClient.get<CheckRoleResponse>('/auth/check-role')
	return response.data
}

/**
 * Получить список всех пользователей с пагинацией
 */
export async function getUsers(
	page: number = 1,
	limit: number = 50
): Promise<GetUsersResponse> {
	const response = await apiClient.get<GetUsersResponse>('/admin/users', {
		params: { page, limit },
	})
	return response.data
}

/**
 * Получить статистику по пользователям
 */
export async function getUserStats(): Promise<UserStatsResponse> {
	const response = await apiClient.get<UserStatsResponse>('/admin/users/stats')
	return response.data
}

/**
 * Получить детальную информацию о пользователе
 */
export async function getUserDetail(userId: string): Promise<AdminUserDetail> {
	const response = await apiClient.get<AdminUserDetail>(
		`/admin/users/${userId}`
	)
	return response.data
}

/**
 * Изменить роль пользователя
 */
export async function updateUserRole(
	userId: string,
	data: UpdateUserRoleRequest
): Promise<UpdateUserRoleResponse> {
	const response = await apiClient.patch<UpdateUserRoleResponse>(
		`/admin/users/${userId}/role`,
		data
	)
	return response.data
}

/**
 * Обновить профиль пользователя (только для админов)
 */
export async function updateUserProfileByAdmin(
	userId: string,
	data: UpdateUserProfileRequest
): Promise<AdminUser> {
	const response = await apiClient.patch<AdminUser>(
		`/admin/users/${userId}`,
		data
	)
	return response.data
}

/**
 * Удалить пользователя
 */
export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
	const response = await apiClient.delete<DeleteUserResponse>(
		`/admin/users/${userId}`
	)
	return response.data
}

/**
 * Получить список всех ролей
 */
export async function getRoles(): Promise<RoleWithCount[]> {
	const response = await apiClient.get<RoleWithCount[]>('/admin/roles')
	return response.data
}

/**
 * Создать новую роль
 */
export async function createRole(
	data: CreateRoleRequest
): Promise<RoleWithCount> {
	const response = await apiClient.post<RoleWithCount>('/admin/roles', data)
	return response.data
}

/**
 * Получить все настройки калорийности
 * Возвращает плоский объект с настройками, который нужно преобразовать на клиенте
 */
export async function getSettings(): Promise<any> {
	const response = await apiClient.get<any>('/admin/settings')
	return response.data
}

/**
 * Получить конкретную настройку
 */
export async function getSetting(key: string): Promise<CalorieSetting> {
	const response = await apiClient.get<CalorieSetting>(`/admin/settings/${key}`)
	return response.data
}

/**
 * Обновить настройку
 */
export async function updateSetting(
	key: string,
	data: UpdateSettingRequest
): Promise<UpdateSettingResponse> {
	const response = await apiClient.patch<UpdateSettingResponse>(
		`/admin/settings/${key}`,
		data
	)
	return response.data
}

/**
 * Сбросить все настройки к значениям по умолчанию
 */
export async function resetSettings(): Promise<ResetSettingsResponse> {
	const response = await apiClient.post<ResetSettingsResponse>(
		'/admin/settings/reset'
	)
	return response.data
}
