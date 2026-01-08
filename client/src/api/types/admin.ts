// Типы для Admin API

import type { Role } from './users'

// Пользователи
export interface AdminUser {
	id: string
	email: string
	roleId: string
	gender: 'MALE' | 'FEMALE'
	birthDate: string
	height: number
	formulaType: 'MIFFLIN_ST_JEOR' | 'HARRIS_BENEDICT'
	activityLevelId: string
	createdAt: string
	updatedAt: string
	role: Role
	activityLevel: {
		id: string
		name: string
	}
	_count: {
		weights: number
		goals: number
	}
}

export interface AdminUserDetail extends AdminUser {
	weights: Array<{
		id: string
		weight: number
		date: string
	}>
	goals: Array<{
		id: string
		targetWeight: number
		targetCalories: number
		startDate: string
		endDate: string
		isActive: boolean
		status: string
	}>
	_count: {
		weights: number
		goals: number
		mealPlans: number
	}
}

export interface Pagination {
	page: number
	limit: number
	total: number
	totalPages: number
}

export interface GetUsersResponse {
	users: AdminUser[]
	pagination: Pagination
}

export interface UserStatsResponse {
	totalUsers: number
	usersByRole: Array<{
		roleId: string
		_count: number
	}>
	recentUsers: Array<{
		id: string
		email: string
		roleId: string
		createdAt: string
	}>
}

export interface UpdateUserRoleRequest {
	roleId: string
}

export interface UpdateUserRoleResponse {
	id: string
	email: string
	roleId: string
	role: Role
}

export interface UpdateUserProfileRequest {
	gender?: 'MALE' | 'FEMALE'
	birthDate?: string
	height?: number
	formulaType?: 'MIFFLIN_ST_JEOR' | 'HARRIS_BENEDICT'
	activityLevelId?: string
}

export interface DeleteUserResponse {
	message: string
	userId: string
}

// Роли
export interface RoleWithCount extends Role {
	_count: {
		users: number
	}
}

export interface CreateRoleRequest {
	id: string
	name: string
	description?: string
}

// Настройки калорийности
export type SettingCategory =
	| 'safety_limits'
	| 'weight_loss_pace'
	| 'weight_gain_pace'
	| 'constants'

export interface CalorieSetting {
	key: string
	value: number
	category: SettingCategory
	label: string
	description: string
}

export interface SettingsGrouped {
	safety_limits: CalorieSetting[]
	weight_loss_pace: CalorieSetting[]
	weight_gain_pace: CalorieSetting[]
	constants: CalorieSetting[]
}

export interface UpdateSettingRequest {
	value: number
}

export interface UpdateSettingResponse extends CalorieSetting {
	message: string
}

export interface ResetSettingsResponse {
	message: string
	count: number
}

// Проверка роли
export interface CheckRoleResponse {
	userId: string
	roleId: string
	role: Role
}
