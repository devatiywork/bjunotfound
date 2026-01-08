// Типы для Weight API

export interface WeightEntry {
	id: string
	userId: string
	weight: number
	date: string // ISO date string
	createdAt: string
}

export interface AddWeightRequest {
	weight: number
	date?: string // Формат: "YYYY-MM-DD", опционально
}

export interface AddWeightResponse extends WeightEntry {}

export interface WeightHistoryResponse extends Array<WeightEntry> {}

export interface LatestWeightResponse extends WeightEntry {}

export interface WeightPeriodResponse {
	weights: WeightEntry[]
	startWeight: number | null
	endWeight: number | null
	difference: number | null
	period: {
		start: string
		end: string
	}
}

export interface AvailablePeriodResponse {
	start: string | null
	end: string | null
	hasData: boolean
}
