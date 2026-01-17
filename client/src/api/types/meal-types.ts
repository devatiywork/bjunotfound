// Тип приема пищи
export interface MealType {
	id: string
	userId: string | null
	code: string | null
	name: string
	sortOrder: number
	isActive: boolean
	createdAt: string
	updatedAt: string
}

// DTO для создания типа приема пищи
export interface CreateMealTypeDto {
	name: string
	sortOrder?: number
}
