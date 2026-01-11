// Типы для Categories API

export interface Category {
	id: string
	name: string
	slug: string
	parentId: string | null
	photos: string[]
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface CategoryWithRelations extends Category {
	parent?: {
		id: string
		name: string
		slug: string
	} | null
	children?: CategoryChild[]
	_count?: {
		productsGlobal: number
		productsUser: number
		children: number
	}
}

export interface CategoryChild {
	id: string
	name: string
	slug: string
	isActive: boolean
	photos: string[]
	_count?: {
		productsGlobal: number
		productsUser: number
		children: number
	}
}

export interface CategoryTreeNode extends Category {
	children: CategoryTreeNode[]
	_count?: {
		productsGlobal: number
		productsUser: number
		children: number
	}
}

// Request/Response типы

export interface CreateCategoryDto {
	name: string
	slug?: string
	parentId?: string | null
	photos?: string[]
	isActive?: boolean
}

export interface UpdateCategoryDto {
	name?: string
	slug?: string
	parentId?: string | null
	photos?: string[]
	isActive?: boolean
}

export interface ListCategoriesQuery {
	onlyActive?: boolean
	parentId?: string | null
	search?: string
}

export interface ListCategoriesResponse {
	categories: CategoryWithRelations[]
	total: number
}

export interface GetCategoryTreeResponse {
	tree: CategoryTreeNode[]
}

export interface DeleteCategoryResponse {
	message: string
	deletedId: string
}

export interface CategoryUploadPhotoResponse {
	message: string
	photoUrl: string
	category: {
		id: string
		photos: string[]
	}
}

export interface CategoryDeletePhotoResponse {
	message: string
	category: {
		id: string
		photos: string[]
	}
}
