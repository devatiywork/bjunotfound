// Типы для Auth API

export interface RegisterRequest {
	email: string
	password: string
	gender: 'MALE' | 'FEMALE'
	birthDate: string // ISO date string
	height: number
	timezone?: string
}

export interface LoginRequest {
	email: string
	password: string
}

export interface Role {
	id: string
	name: string
	description?: string
}

export interface User {
	id: string
	email: string
	roleId: string
	role: Role
	gender: 'MALE' | 'FEMALE'
	birthDate: string
	height: number
	createdAt?: string
}

export interface AuthResponse {
	access_token: string
	user: User
}

export interface RefreshResponse {
	access_token: string
}

export interface LogoutResponse {
	message: string
}

export interface ProfileResponse extends User {
	createdAt: string
}

export interface ApiError {
	message: string
	statusCode: number
	error?: string
}
