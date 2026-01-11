import { Eye, Filter, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import * as CategoriesAPI from '../../../../../api/services/categories'
import * as ProductsAPI from '../../../../../api/services/products'
import type { ProductUser } from '../../../../../api/types/products'
import { Select, useToast } from '../../../../../components'
import { ProductDetailModal } from '../../../../products/components/product-detail-modal'

export function ProductsManagement() {
	const { showToast } = useToast()
	const [products, setProducts] = useState<ProductUser[]>([])
	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [totalPages, setTotalPages] = useState(0)
	const limit = 20

	// Фильтры
	const [categoryId, setCategoryId] = useState('')
	const [brandId, setBrandId] = useState('')
	const [userId, setUserId] = useState('')
	const [showFilters, setShowFilters] = useState(false)

	// Данные для селектов
	const [categories, setCategories] = useState<any[]>([])
	const [brands, setBrands] = useState<any[]>([])
	const [filtersLoading, setFiltersLoading] = useState(false)

	// Модальное окно продукта
	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null
	)
	const [isModalOpen, setIsModalOpen] = useState(false)

	useEffect(() => {
		loadProducts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, categoryId, brandId, userId])

	useEffect(() => {
		if (showFilters) {
			loadFiltersData()
		}
	}, [showFilters])

	async function loadProducts() {
		setLoading(true)
		try {
			const data = await ProductsAPI.listAllProducts({
				page,
				limit,
				categoryId: categoryId || undefined,
				brandId: brandId || undefined,
				userId: userId || undefined,
			})
			setProducts(data.products)
			setTotal(data.pagination.total)
			setTotalPages(data.pagination.totalPages)
		} catch (error: any) {
			showToast('Ошибка при загрузке продуктов', 'error')
		} finally {
			setLoading(false)
		}
	}

	async function loadFiltersData() {
		setFiltersLoading(true)
		try {
			const [categoriesRes, brandsRes] = await Promise.all([
				CategoriesAPI.listCategories({ onlyActive: true }),
				BrandsAPI.listBrands(),
			])
			setCategories(categoriesRes.categories)
			setBrands(brandsRes.filter((b: any) => b.isApproved))
		} catch (error: any) {
			showToast('Ошибка при загрузке фильтров', 'error')
		} finally {
			setFiltersLoading(false)
		}
	}

	const flattenCategories = (cats: any[], level = 0): any[] => {
		return cats.reduce((acc: any[], cat: any) => {
			acc.push({
				value: cat.id,
				label: '  '.repeat(level) + cat.name,
			})
			if (cat.children?.length) {
				acc.push(...flattenCategories(cat.children, level + 1))
			}
			return acc
		}, [])
	}

	const handleResetFilters = () => {
		setCategoryId('')
		setBrandId('')
		setUserId('')
		setPage(1)
	}

	const handleViewProduct = (productId: string) => {
		setSelectedProductId(productId)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedProductId(null)
	}

	const hasActiveFilters = categoryId || brandId || userId

	const getProductName = (product: ProductUser) => {
		return product.names[0]?.name || 'Без названия'
	}

	return (
		<div className='space-y-4'>
			{/* Header */}
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
				<div>
					<h2 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white'>
						Управление продуктами
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Всего продуктов: {total}
					</p>
				</div>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
				>
					<Filter className='w-4 h-4' />
					{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
				</button>
			</div>

			{/* Filters */}
			{showFilters && (
				<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Категория
							</label>
							{filtersLoading ? (
								<div className='h-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse' />
							) : (
								<Select
									value={categoryId}
									onChange={setCategoryId}
									options={[
										{ value: '', label: 'Все категории' },
										...flattenCategories(categories),
									]}
								/>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Бренд
							</label>
							{filtersLoading ? (
								<div className='h-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse' />
							) : (
								<Select
									value={brandId}
									onChange={setBrandId}
									options={[
										{ value: '', label: 'Все бренды' },
										...brands.map((b: any) => ({
											value: b.id,
											label: b.name,
										})),
									]}
								/>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								ID пользователя
							</label>
							<input
								type='text'
								value={userId}
								onChange={e => setUserId(e.target.value)}
								placeholder='UUID пользователя'
								className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
							/>
						</div>
					</div>

					{hasActiveFilters && (
						<button
							onClick={handleResetFilters}
							className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors'
						>
							<X className='w-4 h-4' />
							Сбросить фильтры
						</button>
					)}
				</div>
			)}

			{/* Products Table */}
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden'>
				{loading ? (
					<div className='flex items-center justify-center py-12'>
						<div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
					</div>
				) : products.length === 0 ? (
					<div className='text-center py-12'>
						<p className='text-gray-600 dark:text-gray-400'>
							Продукты не найдены
						</p>
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
								<thead className='bg-gray-50 dark:bg-gray-700'>
									<tr>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Название
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Баркод
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Категория
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Бренд
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Пользователь
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											КБЖУ
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Дата создания
										</th>
										<th className='px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
											Действия
										</th>
									</tr>
								</thead>
								<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
									{products.map(product => (
										<tr
											key={product.id}
											className='hover:bg-gray-50 dark:hover:bg-gray-700'
										>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-sm font-medium text-gray-900 dark:text-white'>
													{getProductName(product)}
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													{product.barcode || '—'}
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													{product.category?.name || '—'}
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-sm text-gray-600 dark:text-gray-400'>
													{product.brand?.name || '—'}
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-xs text-gray-500 dark:text-gray-400 font-mono'>
													{product.user?.email || product.userId}
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-xs text-gray-600 dark:text-gray-400'>
													<div>К: {product.nutrition.caloriesKcal}</div>
													<div>
														Б: {product.nutrition.proteinsG} / Ж:{' '}
														{product.nutrition.fatsG} / У:{' '}
														{product.nutrition.carbohydratesG}
													</div>
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap'>
												<div className='text-xs text-gray-500 dark:text-gray-400'>
													{new Date(product.createdAt).toLocaleDateString(
														'ru-RU'
													)}
												</div>
											</td>
											<td className='px-4 py-3 whitespace-nowrap text-center'>
												<button
													onClick={() => handleViewProduct(product.id)}
													className='inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
													title='Просмотр'
												>
													<Eye className='w-4 h-4' />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className='px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600'>
								<div className='flex flex-col sm:flex-row justify-between items-center gap-3'>
									<div className='text-sm text-gray-700 dark:text-gray-300'>
										Страница {page} из {totalPages}
									</div>
									<div className='flex gap-2'>
										<button
											onClick={() => setPage(p => Math.max(1, p - 1))}
											disabled={page === 1}
											className='px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
										>
											Назад
										</button>
										<button
											onClick={() => setPage(p => Math.min(totalPages, p + 1))}
											disabled={page === totalPages}
											className='px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
										>
											Вперёд
										</button>
									</div>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Модальное окно продукта */}
			<ProductDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				productId={selectedProductId}
				onUpdate={loadProducts}
			/>
		</div>
	)
}
