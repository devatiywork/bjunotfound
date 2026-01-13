import {
	Camera,
	ChevronLeft,
	ChevronRight,
	Package,
	Plus,
	Search,
	Trash2,
	Utensils,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import * as CategoriesAPI from '../../../../../api/services/categories'
import * as ProductsAPI from '../../../../../api/services/products'
import type { ProductUser } from '../../../../../api/types/products'
import {
	ConfirmModal,
	Input,
	Select,
	useToast,
} from '../../../../../components'
import { ProductDetailModal, ProductModal } from '../../index'

export const ProductsTab = () => {
	const { showToast } = useToast()

	// Состояние продуктов
	const [products, setProducts] = useState<ProductUser[]>([])
	const [loading, setLoading] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [totalCount, setTotalCount] = useState(0)

	// Фильтры
	const [categoryId, setCategoryId] = useState<string>('')
	const [brandId, setBrandId] = useState<string>('')
	const [categories, setCategories] = useState<any[]>([])
	const [brands, setBrands] = useState<any[]>([])
	const [filtersLoading, setFiltersLoading] = useState(false)

	// Пагинация
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [limit] = useState(20)

	// Модальные окна
	const [productModalOpen, setProductModalOpen] = useState(false)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null
	)
	// Удаление продуктов
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [productToDelete, setProductToDelete] = useState<ProductUser | null>(
		null
	)
	// Загрузка фото
	const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)

	useEffect(() => {
		loadFiltersData()
	}, [])

	useEffect(() => {
		// Загружаем продукты только если нет активного поиска
		if (!searchQuery.trim()) {
			loadProducts()
		}
	}, [currentPage, categoryId, brandId])

	// Debounce поиска
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setCurrentPage(1) // Сброс на первую страницу при поиске
			loadProducts()
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [searchQuery])

	async function loadFiltersData() {
		setFiltersLoading(true)
		try {
			const [categoriesRes, brandsRes] = await Promise.all([
				CategoriesAPI.listCategories({ onlyActive: true }),
				BrandsAPI.listBrands(),
			])
			setCategories(categoriesRes.categories)
			setBrands(brandsRes.filter(b => b.isApproved))
		} catch (error: any) {
			showToast('Ошибка при загрузке фильтров', 'error')
		} finally {
			setFiltersLoading(false)
		}
	}

	async function loadProducts() {
		setLoading(true)
		try {
			// Если есть поисковый запрос, используем поиск
			if (searchQuery.trim()) {
				const searchResults = await ProductsAPI.searchMyProducts(searchQuery)
				setProducts(searchResults)
				setTotalCount(searchResults.length)
				setTotalPages(1) // При поиске нет пагинации
			} else {
				// Иначе используем обычную загрузку с фильтрами и пагинацией
				const response = await ProductsAPI.getMyProducts({
					page: currentPage,
					limit,
					categoryId: categoryId || undefined,
					brandId: brandId || undefined,
				})
				setProducts(response.products)
				setTotalCount(response.pagination.total)
				setTotalPages(response.pagination.totalPages)
			}
		} catch (error: any) {
			showToast('Ошибка при загрузке продуктов', 'error')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateProduct = () => {
		setProductModalOpen(true)
	}

	const handleViewProduct = (productId: string) => {
		setSelectedProductId(productId)
		setDetailModalOpen(true)
	}

	const handleDeleteProduct = (product: ProductUser) => {
		setProductToDelete(product)
		setConfirmModalOpen(true)
	}

	const confirmDelete = async () => {
		if (!productToDelete) return

		setDeleteLoading(true)
		try {
			await ProductsAPI.deleteProductUser(productToDelete.id)
			showToast('Продукт успешно удален', 'success')
			setConfirmModalOpen(false)
			loadProducts()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при удалении продукта'
			showToast(errorMessage, 'error')
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleModalSuccess = (productId?: string) => {
		loadProducts()
		// Если был создан продукт, открываем детальную модалку
		if (productId) {
			setSelectedProductId(productId)
			setDetailModalOpen(true)
		}
	}

	// Загрузка фото продукта
	const handleUploadPhoto = async (productId: string, file: File) => {
		setUploadingPhoto(productId)
		try {
			await ProductsAPI.uploadProductPhoto(productId, file)
			showToast('Фотография успешно загружена', 'success')
			loadProducts() // Перезагружаем список
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при загрузке фотографии'
			showToast(errorMessage, 'error')
		} finally {
			setUploadingPhoto(null)
		}
	}

	// Обработка выбора файла фото
	const handlePhotoSelect = (
		productId: string,
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Валидация типа файла
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(file.type)) {
			showToast('Поддерживаются только JPEG, PNG и WebP форматы', 'error')
			return
		}

		// Валидация размера (5MB)
		const maxSize = 5 * 1024 * 1024
		if (file.size > maxSize) {
			showToast('Размер файла не должен превышать 5 МБ', 'error')
			return
		}

		handleUploadPhoto(productId, file)
		// Очищаем input
		event.target.value = ''
	}

	// Получить название продукта (первое найденное)
	const getProductName = (product: ProductUser): string => {
		return product.names[0]?.name || 'Без названия'
	}

	// Форматирование КБЖУ
	const formatNutrition = (product: ProductUser): string => {
		const n = product.nutrition
		return `${n.caloriesKcal} ккал • Б: ${n.proteinsG}г • Ж: ${n.fatsG}г • У: ${n.carbohydratesG}г`
	}

	// Преобразование дерева категорий в плоский список для Select
	const buildCategoryOptions = (categories: any[]): any[] => {
		const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

		const getPath = (categoryId: string): string[] => {
			const path: string[] = []
			let current = categoryMap.get(categoryId)

			while (current) {
				path.unshift(current.name)
				if (!current.parentId) break
				current = categoryMap.get(current.parentId)
			}

			return path
		}

		return categories.map(cat => {
			const path = getPath(cat.id)
			const displayLabel = path.length === 1 ? path[0] : path.join(' → ')

			return {
				value: cat.id,
				label: displayLabel,
			}
		})
	}

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage)
		}
	}

	const handleFilterChange = (type: 'category' | 'brand', value: string) => {
		setCurrentPage(1) // Сброс на первую страницу при изменении фильтра
		if (type === 'category') {
			setCategoryId(value)
		} else {
			setBrandId(value)
		}
	}

	return (
		<div>
			{/* Панель действий */}
			<div className='mb-6 space-y-4'>
				{/* Первая строка: Поиск и кнопка добавления */}
				<div className='flex flex-col sm:flex-row gap-4 justify-between'>
					<div className='flex-1 max-w-md'>
						{/* Поиск */}
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500' />
							<Input
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								placeholder='Поиск продуктов...'
								className='pl-10'
							/>
						</div>
					</div>

					{/* Кнопка создания */}
					<button
						onClick={handleCreateProduct}
						className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
					>
						<Plus className='w-5 h-5' />
						<span>Добавить продукт</span>
					</button>
				</div>

				{/* Вторая строка: Фильтры */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Фильтр по категории */}
					<div>
						<Select
							value={categoryId}
							onChange={value => handleFilterChange('category', value)}
							options={[
								{ value: '', label: 'Все категории' },
								...buildCategoryOptions(categories),
							]}
						/>
					</div>

					{/* Фильтр по бренду */}
					<div>
						<Select
							value={brandId}
							onChange={value => handleFilterChange('brand', value)}
							options={[
								{ value: '', label: 'Все бренды' },
								...brands.map(b => ({ value: b.id, label: b.name })),
							]}
							placeholder='Выберите бренд'
							searchable={true}
							disabled={
								filtersLoading || loading || searchQuery.trim().length > 0
							}
						/>
					</div>
				</div>
			</div>
			{/* Счетчик */}
			<div className='mb-4 flex items-center justify-between'>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					{loading ? 'Загрузка...' : `Всего продуктов: ${totalCount}`}
				</p>
				{!searchQuery.trim() && totalPages > 1 && (
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Страница {currentPage} из {totalPages}
					</p>
				)}
			</div>
			{/* Список продуктов */}
			{loading ? (
				<div className='flex items-center justify-center py-12'>
					<div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
				</div>
			) : products.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-400 dark:text-gray-500 mb-4'>
						<Package className='mx-auto h-12 w-12' />
					</div>
					<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
						{searchQuery ? 'Продукты не найдены' : 'Список продуктов пуст'}
					</h3>
					<p className='text-gray-600 dark:text-gray-400 mb-4'>
						{searchQuery
							? 'Попробуйте изменить запрос поиска'
							: 'Создайте свой первый продукт для начала работы'}
					</p>
					{!searchQuery && (
						<button
							onClick={handleCreateProduct}
							className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
						>
							<Plus className='w-5 h-5' />
							<span>Создать продукт</span>
						</button>
					)}
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{products.map(product => {
						const firstPhoto = product.photos?.[0]
						const photoUrl =
							typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url

						return (
							<div
								key={product.id}
								className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow'
							>
								{/* Фото продукта или заглушка */}
								<div className='aspect-video w-full bg-gray-100 dark:bg-gray-700 overflow-hidden relative group'>
									{photoUrl ? (
										<img
											src={photoUrl}
											alt={getProductName(product)}
											className='w-full h-full object-cover'
											loading='lazy'
										/>
									) : (
										<div className='w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700'>
											<Utensils className='w-16 h-16 text-gray-400 dark:text-gray-500' />
										</div>
									)}

									{/* Кнопка добавления фото - показывается при hover */}
									<div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity'>
										<input
											type='file'
											accept='image/jpeg,image/png,image/webp'
											onChange={e => handlePhotoSelect(product.id, e)}
											className='hidden'
											id={`photo-upload-${product.id}`}
										/>
										<button
											onClick={() =>
												document
													.getElementById(`photo-upload-${product.id}`)
													?.click()
											}
											disabled={uploadingPhoto === product.id}
											className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium'
											title={photoUrl ? 'Изменить фото' : 'Добавить фото'}
										>
											{uploadingPhoto === product.id ? (
												<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
											) : (
												<Camera className='w-4 h-4' />
											)}
											{photoUrl ? 'Изменить' : 'Добавить'}
										</button>
									</div>
								</div>

								<div className='p-4'>
									{/* Заголовок с названием и кнопками действий */}
									<div className='flex items-start justify-between mb-3'>
										<div className='flex-1'>
											<h4 className='font-semibold text-gray-900 dark:text-white mb-1'>
												{getProductName(product)}
											</h4>
											{product.barcode && (
												<p className='text-xs text-gray-500 dark:text-gray-400'>
													Баркод: {product.barcode}
												</p>
											)}
										</div>
										<div className='flex gap-1'>
											<button
												onClick={() => handleDeleteProduct(product)}
												className='p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors'
												title='Удалить продукт'
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									</div>

									{/* Пищевая ценность */}
									<div className='mb-3'>
										<p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
											На 100 г/мл:
										</p>
										<p className='text-sm text-gray-700 dark:text-gray-300'>
											{formatNutrition(product)}
										</p>
									</div>

									{/* Дополнительная информация */}
									<div className='space-y-1'>
										{product.category && (
											<p className='text-xs text-gray-600 dark:text-gray-400'>
												<span className='font-medium'>Категория:</span>{' '}
												{product.category.name}
											</p>
										)}
										{product.brand && (
											<p className='text-xs text-gray-600 dark:text-gray-400'>
												<span className='font-medium'>Бренд:</span>{' '}
												{product.brand.name}
											</p>
										)}
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											Создан:{' '}
											{new Date(product.createdAt).toLocaleDateString('ru-RU')}
										</p>
									</div>

									{/* Кнопка подробнее */}
									<button
										onClick={() => handleViewProduct(product.id)}
										className='mt-4 w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors'
									>
										Подробнее
									</button>
								</div>

								{/* TODO: В будущем добавить:
                - Управление порциями
                - История покупок
              */}
							</div>
						)
					})}
				</div>
			)}
			{/* Пагинация */}
			{!loading && !searchQuery.trim() && totalPages > 1 && (
				<div className='mt-6 flex items-center justify-center gap-2'>
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						title='Предыдущая страница'
					>
						<ChevronLeft className='w-5 h-5' />
					</button>

					<div className='flex items-center gap-2'>
						{/* Показываем первую страницу */}
						{currentPage > 2 && (
							<>
								<button
									onClick={() => handlePageChange(1)}
									className='px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
								>
									1
								</button>
								{currentPage > 3 && (
									<span className='text-gray-500 dark:text-gray-400'>...</span>
								)}
							</>
						)}

						{/* Показываем текущую страницу и соседние */}
						{Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
							let pageNum: number
							if (currentPage === 1) {
								pageNum = i + 1
							} else if (currentPage === totalPages) {
								pageNum = totalPages - 2 + i
							} else {
								pageNum = currentPage - 1 + i
							}

							if (pageNum < 1 || pageNum > totalPages) return null

							return (
								<button
									key={pageNum}
									onClick={() => handlePageChange(pageNum)}
									className={`px-3 py-1 rounded-lg border transition-colors ${
										currentPage === pageNum
											? 'bg-blue-600 text-white border-blue-600'
											: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
									}`}
								>
									{pageNum}
								</button>
							)
						})}

						{/* Показываем последнюю страницу */}
						{currentPage < totalPages - 1 && (
							<>
								{currentPage < totalPages - 2 && (
									<span className='text-gray-500 dark:text-gray-400'>...</span>
								)}
								<button
									onClick={() => handlePageChange(totalPages)}
									className='px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
								>
									{totalPages}
								</button>
							</>
						)}
					</div>

					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						title='Следующая страница'
					>
						<ChevronRight className='w-5 h-5' />
					</button>
				</div>
			)}
			{/* Модальные окна */}
			<ProductModal
				isOpen={productModalOpen}
				onClose={() => setProductModalOpen(false)}
				onSuccess={handleModalSuccess}
			/>
			<ProductDetailModal
				isOpen={detailModalOpen}
				onClose={() => setDetailModalOpen(false)}
				productId={selectedProductId}
				onUpdate={loadProducts}
			/>
			<ConfirmModal
				isOpen={confirmModalOpen}
				onClose={() => setConfirmModalOpen(false)}
				onConfirm={confirmDelete}
				title='Подтвердите удаление'
				message={`Вы уверены, что хотите удалить продукт "${
					productToDelete ? getProductName(productToDelete) : ''
				}"?\n\nЭто действие необратимо.`}
				confirmText='Удалить'
				cancelText='Отмена'
				variant='danger'
				loading={deleteLoading}
			/>
		</div>
	)
}
