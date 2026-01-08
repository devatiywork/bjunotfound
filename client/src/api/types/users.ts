// Типы для Users API

import type { Role } from './auth.ts'

export type { Role }

export type FormulaType = 'MIFFLIN_ST_JEOR' | 'HARRIS_BENEDICT'

export interface ActivityLevel {
	id: string
	name: string
	description: string
	coefficient: number
}

export interface UserProfile {
	id: string
	email: string
	roleId: string
	role: Role
	gender: 'MALE' | 'FEMALE'
	birthDate: string // ISO date string
	height: number
	formulaType: FormulaType
	activityLevelId: string
	activityLevel: ActivityLevel
	timezone: string
	createdAt: string
}

export interface UpdateProfileRequest {
	gender?: 'MALE' | 'FEMALE'
	birthDate?: string // ISO date string (format: "YYYY-MM-DD")
	height?: number
	formulaType?: FormulaType
	activityLevelId?: string
	timezone?: string
}

export interface UpdateProfileResponse extends UserProfile {}
