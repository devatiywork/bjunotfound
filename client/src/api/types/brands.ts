export interface Brand {
	id: string
	name: string
	normalizedName: string
	country: string | null
	photos: string[]
	createdBy: string
	isApproved: boolean
	approvedBy: string | null
	approvedAt: Date | null
	rejectedAt: Date | null
	rejectionReason: string | null
	createdAt: Date
	updatedAt: Date
	creator?: {
		id: string
		email: string
	}
	approver?: {
		id: string
		email: string
	}
	_count?: {
		productsGlobal: number
		productsUser: number
	}
}

export interface CreateBrandDto {
	name: string
	country?: string
	photos?: string[]
}

export interface UpdateBrandDto {
	name?: string
	country?: string
	photos?: string[]
}

export interface RejectBrandDto {
	reason: string
}

export interface ListBrandsResponse {
	brands: Brand[]
}

export interface GetBrandResponse {
	brand: Brand
}

export interface DeleteBrandResponse {
	message: string
}

export interface UploadPhotoResponse {
	message: string
	photoUrl: string
	totalPhotos: number
}

export interface DeletePhotoResponse {
	message: string
	totalPhotos: number
}
