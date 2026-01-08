import {
	ChefHat,
	Filter,
	FolderPlus,
	Package,
	Plus,
	Search,
	Tag as TagIcon,
	X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	deleteDish,
	deleteProduct,
	getCategories,
	getDishes,
	getDishTags,
	getProducts,
	getTags,
} from '../../../api/services'
import type {
	Category,
	Dish,
	DishTag,
	FilterDishesDto,
	Product,
	ProductFilters,
	Tag,
} from '../../../api/types'
import { Header, Modal, Tabs, useToast } from '../../../components'
import {
	CategoryModal,
	DishCard,
	DishFiltersPanel,
	DishModal,
	DishTagModal,
	ProductCard,
	ProductFiltersPanel,
	ProductModal,
	TagModal,
} from '../components/index.ts'

export default function Products() {
	const toast = useToast()
	const [activeTab, setActiveTab] = useState<'products' | 'dishes'>('products')

	// Products State
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [tags, setTags] = useState<Tag[]>([])
	const [productsLoading, setProductsLoading] = useState(true)
	const [productsTotalPages, setProductsTotalPages] = useState(1)
	const [productsCurrentPage, setProductsCurrentPage] = useState(1)

	// Dishes State
	const [dishes, setDishes] = useState<Dish[]>([])
	const [dishTags, setDishTags] = useState<DishTag[]>([])
	const [dishesLoading, setDishesLoading] = useState(true)
	const [dishesTotalPages, setDishesTotalPages] = useState(1)
	const [dishesCurrentPage, setDishesCurrentPage] = useState(1)

	// Фильтры для продуктов
	const [productFilters, setProductFilters] = useState<ProductFilters>({
		page: 1,
		limit: 20,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	})

	// Фильтры для блюд
	const [dishFilters, setDishFilters] = useState<FilterDishesDto>({
		page: 1,
		limit: 20,
		sortBy: 'createdAt',
		sortOrder: 'desc',
	})

	// Модальные окна
	const [isProductCreateModalOpen, setIsProductCreateModalOpen] =
		useState(false)
	const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false)
	const [isProductFiltersOpen, setIsProductFiltersOpen] = useState(false)
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
	const [isTagModalOpen, setIsTagModalOpen] = useState(false)
	const [isProductDeleteModalOpen, setIsProductDeleteModalOpen] =
		useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [productToDelete, setProductToDelete] = useState<Product | null>(null)

	const [isDishCreateModalOpen, setIsDishCreateModalOpen] = useState(false)
	const [isDishEditModalOpen, setIsDishEditModalOpen] = useState(false)
	const [isDishFiltersOpen, setIsDishFiltersOpen] = useState(false)
	const [isDishTagModalOpen, setIsDishTagModalOpen] = useState(false)
	const [isDishDeleteModalOpen, setIsDishDeleteModalOpen] = useState(false)
	const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
	const [dishToDelete, setDishToDelete] = useState<Dish | null>(null)

	useEffect(() => {
		document.title = 'Продукты и блюда | BjuNotFound'
	}, [])

	// Загрузка данных
	useEffect(() => {
		loadProducts()
		loadCategories()
		loadTags()
	}, [productFilters])

	useEffect(() => {
		loadDishes()
		loadDishTags()
	}, [dishFilters])

	const loadProducts = async () => {
		try {
			setProductsLoading(true)
			const response = await getProducts(productFilters)
			setProducts(response.products)
			setProductsTotalPages(response.pagination.totalPages)
			setProductsCurrentPage(response.pagination.page)
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message || 'Ошибка загрузки продуктов',
				'error'
			)
		} finally {
			setProductsLoading(false)
		}
	}

	const loadCategories = async () => {
		try {
			const data = await getCategories()
			setCategories(data)
		} catch (error: any) {
			console.error('Ошибка загрузки категорий:', error)
		}
	}

	const loadTags = async () => {
		try {
			const data = await getTags()
			setTags(data)
		} catch (error: any) {
			console.error('Ошибка загрузки тегов:', error)
		}
	}

	const loadDishes = async () => {
		try {
			setDishesLoading(true)
			const response = await getDishes(dishFilters)
			setDishes(response.dishes)
			setDishesTotalPages(response.pagination.totalPages)
			setDishesCurrentPage(response.pagination.page)
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message || 'Ошибка загрузки блюд',
				'error'
			)
		} finally {
			setDishesLoading(false)
		}
	}

	const loadDishTags = async () => {
		try {
			const data = await getDishTags()
			setDishTags(data)
		} catch (error: any) {
			console.error('Ошибка загрузки тегов блюд:', error)
		}
	}

	const handleSearch = (searchTerm: string) => {
		if (activeTab === 'products') {
			setProductFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
		} else {
			setDishFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
		}
	}

	const handleApplyProductFilters = (newFilters: Partial<ProductFilters>) => {
		setProductFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
		setIsProductFiltersOpen(false)
	}

	const handleApplyDishFilters = (newFilters: Partial<FilterDishesDto>) => {
		setDishFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
		setIsDishFiltersOpen(false)
	}

	const handleClearProductFilters = () => {
		setProductFilters({
			page: 1,
			limit: 20,
			sortBy: 'createdAt',
			sortOrder: 'desc',
		})
	}

	const handleClearDishFilters = () => {
		setDishFilters({
			page: 1,
			limit: 20,
			sortBy: 'createdAt',
			sortOrder: 'desc',
		})
	}

	const handleDeleteProduct = async (id: string) => {
		const product = products.find(p => p.id === id)
		if (!product) return
		setProductToDelete(product)
		setIsProductDeleteModalOpen(true)
	}

	const confirmDeleteProduct = async () => {
		if (!productToDelete) return

		try {
			await deleteProduct(productToDelete.id)
			toast.showToast('Продукт успешно удален', 'success')
			loadProducts()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message || 'Ошибка удаления продукта',
				'error'
			)
		} finally {
			setIsProductDeleteModalOpen(false)
			setProductToDelete(null)
		}
	}

	const handleEditProduct = (product: Product) => {
		setSelectedProduct(product)
		setIsProductEditModalOpen(true)
	}

	const handleProductPageChange = (page: number) => {
		setProductFilters(prev => ({ ...prev, page }))
	}

	const handleDeleteDish = async (id: string) => {
		const dish = dishes.find(d => d.id === id)
		if (!dish) return
		setDishToDelete(dish)
		setIsDishDeleteModalOpen(true)
	}

	const confirmDeleteDish = async () => {
		if (!dishToDelete) return

		try {
			await deleteDish(dishToDelete.id)
			toast.showToast('Блюдо успешно удалено', 'success')
			loadDishes()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message || 'Ошибка удаления блюда',
				'error'
			)
		} finally {
			setIsDishDeleteModalOpen(false)
			setDishToDelete(null)
		}
	}

	const handleEditDish = (dish: Dish) => {
		setSelectedDish(dish)
		setIsDishEditModalOpen(true)
	}

	const handleDishPageChange = (page: number) => {
		setDishFilters(prev => ({ ...prev, page }))
	}

	const hasActiveProductFilters =
		productFilters.search ||
		productFilters.categoryId ||
		productFilters.tagIds?.length ||
		productFilters.minCalories ||
		productFilters.maxCalories ||
		productFilters.minPrice ||
		productFilters.maxPrice ||
		productFilters.source ||
		productFilters.isVerified !== undefined

	const hasActiveDishFilters =
		dishFilters.search ||
		dishFilters.tagIds?.length ||
		dishFilters.mealType ||
		dishFilters.cuisineType ||
		dishFilters.dishCategory ||
		dishFilters.difficulty ||
		dishFilters.minCalories ||
		dishFilters.maxCalories ||
		dishFilters.minCookingTime ||
		dishFilters.maxCookingTime ||
		dishFilters.minPrice ||
		dishFilters.maxPrice ||
		dishFilters.isVerified !== undefined

	const currentFilters = activeTab === 'products' ? productFilters : dishFilters
	const hasActiveFilters =
		activeTab === 'products' ? hasActiveProductFilters : hasActiveDishFilters

	return (
		<>
			<Header />
			<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
				{/* Header */}
				<div className='bg-white dark:bg-gray-800 shadow'>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
							<div>
								<h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
									{activeTab === 'products' ? 'Продукты' : 'Блюда'}
								</h1>
								<p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
									{activeTab === 'products'
										? 'База продуктов питания с КБЖУ'
										: 'Коллекция блюд с автоматическим расчетом КБЖУ и стоимости'}
								</p>
							</div>
							<div className='flex flex-wrap items-center gap-3'>
								{activeTab === 'products' ? (
									<>
										<button
											onClick={() => setIsCategoryModalOpen(true)}
											className='flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
										>
											<FolderPlus className='w-4 h-4' />
											<span className='hidden sm:inline'>Категория</span>
										</button>
										<button
											onClick={() => setIsTagModalOpen(true)}
											className='flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
										>
											<TagIcon className='w-4 h-4' />
											<span className='hidden sm:inline'>Тег</span>
										</button>
										<button
											onClick={() => setIsProductCreateModalOpen(true)}
											className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
										>
											<Plus className='w-5 h-5' />
											<span>Продукт</span>
										</button>
									</>
								) : (
									<>
										<button
											onClick={() => setIsDishTagModalOpen(true)}
											className='flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
										>
											<TagIcon className='w-4 h-4' />
											<span className='hidden sm:inline'>Теги</span>
										</button>
										<button
											onClick={() => setIsDishCreateModalOpen(true)}
											className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
										>
											<Plus className='w-5 h-5' />
											<span>Блюдо</span>
										</button>
									</>
								)}
							</div>
						</div>

						{/* Search & Filters */}
						<div className='mt-6 flex flex-col sm:flex-row gap-3'>
							<div className='flex-1 relative'>
								<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
								<input
									type='text'
									placeholder={
										activeTab === 'products'
											? 'Поиск по названию, бренду или описанию...'
											: 'Поиск блюд по названию или описанию...'
									}
									value={currentFilters.search || ''}
									onChange={e => handleSearch(e.target.value)}
									className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								/>
							</div>
							<div className='flex gap-2'>
								<button
									onClick={() =>
										activeTab === 'products'
											? setIsProductFiltersOpen(true)
											: setIsDishFiltersOpen(true)
									}
									className='flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
								>
									<Filter className='w-5 h-5' />
									<span className='hidden sm:inline'>Фильтры</span>
									{hasActiveFilters && (
										<span className='w-2 h-2 bg-blue-600 rounded-full'></span>
									)}
								</button>
								{hasActiveFilters && (
									<button
										onClick={() =>
											activeTab === 'products'
												? handleClearProductFilters()
												: handleClearDishFilters()
										}
										className='flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
									>
										<X className='w-5 h-5' />
										<span className='hidden sm:inline'>Очистить</span>
									</button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<Tabs
						tabs={[
							{
								id: 'products',
								label: 'Продукты',
								icon: <Package />,
								content: (
									<>
										{productsLoading ? (
											<div className='flex justify-center items-center h-64'>
												<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
											</div>
										) : products.length === 0 ? (
											<div className='text-center py-12'>
												<p className='text-gray-600 dark:text-gray-400 text-lg'>
													{hasActiveProductFilters
														? 'По вашему запросу ничего не найдено'
														: 'Пока нет продуктов'}
												</p>
											</div>
										) : (
											<>
												<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
													{products.map(product => (
														<ProductCard
															key={product.id}
															product={product}
															onEdit={handleEditProduct}
															onDelete={handleDeleteProduct}
														/>
													))}
												</div>

												{/* Pagination */}
												{productsTotalPages > 1 && (
													<div className='mt-8 flex justify-center items-center gap-2'>
														<button
															onClick={() =>
																handleProductPageChange(productsCurrentPage - 1)
															}
															disabled={productsCurrentPage === 1}
															className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
														>
															Назад
														</button>
														<span className='text-gray-900 dark:text-white'>
															Страница {productsCurrentPage} из{' '}
															{productsTotalPages}
														</span>
														<button
															onClick={() =>
																handleProductPageChange(productsCurrentPage + 1)
															}
															disabled={
																productsCurrentPage === productsTotalPages
															}
															className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
														>
															Вперед
														</button>
													</div>
												)}
											</>
										)}
									</>
								),
							},
							{
								id: 'dishes',
								label: 'Блюда',
								icon: <ChefHat />,
								content: (
									<>
										{dishesLoading ? (
											<div className='flex justify-center items-center h-64'>
												<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
											</div>
										) : dishes.length === 0 ? (
											<div className='text-center py-12'>
												<p className='text-gray-600 dark:text-gray-400 text-lg'>
													{hasActiveDishFilters
														? 'По вашему запросу ничего не найдено'
														: 'Пока нет блюд'}
												</p>
											</div>
										) : (
											<>
												<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
													{dishes.map(dish => (
														<DishCard
															key={dish.id}
															dish={dish}
															onEdit={handleEditDish}
															onDelete={handleDeleteDish}
														/>
													))}
												</div>

												{/* Pagination */}
												{dishesTotalPages > 1 && (
													<div className='mt-8 flex justify-center items-center gap-2'>
														<button
															onClick={() =>
																handleDishPageChange(dishesCurrentPage - 1)
															}
															disabled={dishesCurrentPage === 1}
															className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
														>
															Назад
														</button>
														<span className='text-gray-900 dark:text-white'>
															Страница {dishesCurrentPage} из {dishesTotalPages}
														</span>
														<button
															onClick={() =>
																handleDishPageChange(dishesCurrentPage + 1)
															}
															disabled={dishesCurrentPage === dishesTotalPages}
															className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
														>
															Вперед
														</button>
													</div>
												)}
											</>
										)}
									</>
								),
							},
						]}
						activeTab={activeTab}
						onTabChange={tab => setActiveTab(tab as 'products' | 'dishes')}
					/>
				</div>

				{/* Product Modals */}
				{isProductCreateModalOpen && (
					<ProductModal
						categories={categories}
						tags={tags}
						onClose={() => setIsProductCreateModalOpen(false)}
						onSuccess={() => {
							setIsProductCreateModalOpen(false)
							loadProducts()
						}}
					/>
				)}

				{isProductEditModalOpen && selectedProduct && (
					<ProductModal
						product={selectedProduct}
						categories={categories}
						tags={tags}
						onClose={() => {
							setIsProductEditModalOpen(false)
							setSelectedProduct(null)
						}}
						onSuccess={() => {
							setIsProductEditModalOpen(false)
							setSelectedProduct(null)
							loadProducts()
						}}
					/>
				)}

				{isProductFiltersOpen && (
					<ProductFiltersPanel
						filters={productFilters}
						categories={categories}
						tags={tags}
						onApply={handleApplyProductFilters}
						onClose={() => setIsProductFiltersOpen(false)}
					/>
				)}

				{/* Dish Modals */}
				{isDishCreateModalOpen && (
					<DishModal
						products={products}
						tags={dishTags}
						onClose={() => setIsDishCreateModalOpen(false)}
						onSuccess={() => {
							setIsDishCreateModalOpen(false)
							loadDishes()
						}}
					/>
				)}

				{isDishEditModalOpen && selectedDish && (
					<DishModal
						dish={selectedDish}
						products={products}
						tags={dishTags}
						onClose={() => {
							setIsDishEditModalOpen(false)
							setSelectedDish(null)
						}}
						onSuccess={() => {
							setIsDishEditModalOpen(false)
							setSelectedDish(null)
							loadDishes()
						}}
					/>
				)}

				{isDishFiltersOpen && (
					<DishFiltersPanel
						filters={dishFilters}
						tags={dishTags}
						onApply={handleApplyDishFilters}
						onClose={() => setIsDishFiltersOpen(false)}
					/>
				)}
			</div>

			{/* Category Modal */}
			<CategoryModal
				isOpen={isCategoryModalOpen}
				onClose={() => setIsCategoryModalOpen(false)}
				onSuccess={loadCategories}
			/>

			{/* Tag Modal */}
			<TagModal
				isOpen={isTagModalOpen}
				onClose={() => setIsTagModalOpen(false)}
				onSuccess={loadTags}
			/>

			{/* Dish Tag Modal */}
			<DishTagModal
				isOpen={isDishTagModalOpen}
				onClose={() => setIsDishTagModalOpen(false)}
				onSuccess={loadDishTags}
			/>

			{/* Product Delete Confirmation Modal */}
			{isProductDeleteModalOpen && productToDelete && (
				<Modal
					isOpen={isProductDeleteModalOpen}
					onClose={() => {
						setIsProductDeleteModalOpen(false)
						setProductToDelete(null)
					}}
					title='Удаление продукта'
					maxWidth='sm'
				>
					<div className='space-y-4'>
						<p className='text-gray-700 dark:text-gray-300'>
							Вы уверены, что хотите удалить продукт{' '}
							<span className='font-semibold'>{productToDelete.name}</span>?
						</p>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Это действие нельзя отменить.
						</p>
						<div className='flex gap-3 justify-end'>
							<button
								type='button'
								onClick={() => {
									setIsProductDeleteModalOpen(false)
									setProductToDelete(null)
								}}
								className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
							>
								Отмена
							</button>
							<button
								type='button'
								onClick={confirmDeleteProduct}
								className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors'
							>
								Удалить
							</button>
						</div>
					</div>
				</Modal>
			)}

			{/* Dish Delete Confirmation Modal */}
			{isDishDeleteModalOpen && dishToDelete && (
				<Modal
					isOpen={isDishDeleteModalOpen}
					onClose={() => {
						setIsDishDeleteModalOpen(false)
						setDishToDelete(null)
					}}
					title='Удаление блюда'
					maxWidth='sm'
				>
					<div className='space-y-4'>
						<p className='text-gray-700 dark:text-gray-300'>
							Вы уверены, что хотите удалить блюдо{' '}
							<span className='font-semibold'>{dishToDelete.name}</span>?
						</p>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Это действие нельзя отменить.
						</p>
						<div className='flex gap-3 justify-end'>
							<button
								type='button'
								onClick={() => {
									setIsDishDeleteModalOpen(false)
									setDishToDelete(null)
								}}
								className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
							>
								Отмена
							</button>
							<button
								type='button'
								onClick={confirmDeleteDish}
								className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors'
							>
								Удалить
							</button>
						</div>
					</div>
				</Modal>
			)}
		</>
	)
}
