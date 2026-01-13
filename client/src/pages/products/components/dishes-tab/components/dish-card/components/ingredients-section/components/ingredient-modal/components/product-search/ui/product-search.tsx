import { Loader2, Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	getMyProducts,
	searchMyProducts,
} from '../../../../../../../../../../../../../api/services/products'
import type { ProductUser } from '../../../../../../../../../../../../../api/types/products'
import { Input } from '../../../../../../../../../../../../../components'

interface ProductSearchProps {
	onSelect: (product: ProductUser) => void
}

const PRODUCTS_PER_PAGE = 20

export const ProductSearch = ({ onSelect }: ProductSearchProps) => {
	const [query, setQuery] = useState('')
	const [products, setProducts] = useState<ProductUser[]>([])
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [isSearchMode, setIsSearchMode] = useState(false)
	const listRef = useRef<HTMLDivElement>(null)

	// Функция загрузки продуктов с пагинацией
	const loadProducts = useCallback(async (pageNum: number, append = false) => {
		if (pageNum === 1) {
			setLoading(true)
		} else {
			setLoadingMore(true)
		}

		try {
			const response = await getMyProducts({
				page: pageNum,
				limit: PRODUCTS_PER_PAGE,
			})
			const newProducts = response.products || []

			if (append) {
				setProducts(prev => [...prev, ...newProducts])
			} else {
				setProducts(newProducts)
			}

			// Проверяем, есть ли ещё страницы
			setHasMore(pageNum < response.pagination.totalPages)
		} catch (error) {
			console.error('Error loading products:', error)
			if (!append) {
				setProducts([])
			}
			setHasMore(false)
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}, [])

	// Загружаем первую страницу при монтировании
	useEffect(() => {
		loadProducts(1)
	}, [loadProducts])

	// Поиск по продуктам
	useEffect(() => {
		if (!query.trim()) {
			// Если запрос пустой, возвращаемся к пагинированному списку
			setIsSearchMode(false)
			setPage(1)
			loadProducts(1)
			return
		}

		setIsSearchMode(true)
		const search = async () => {
			setLoading(true)
			try {
				const searchResults = await searchMyProducts(query)
				setProducts(searchResults)
				setHasMore(false) // Поиск возвращает все результаты сразу
			} catch (error) {
				console.error('Error searching products:', error)
			} finally {
				setLoading(false)
			}
		}

		const timeoutId = setTimeout(search, 300)
		return () => clearTimeout(timeoutId)
	}, [query, loadProducts])

	// Обработчик скролла для бесконечной подгрузки
	const handleScroll = useCallback(() => {
		if (!listRef.current || loading || loadingMore || !hasMore || isSearchMode)
			return

		const { scrollTop, scrollHeight, clientHeight } = listRef.current
		// Загружаем больше, когда осталось 100px до конца
		if (scrollHeight - scrollTop - clientHeight < 100) {
			const nextPage = page + 1
			setPage(nextPage)
			loadProducts(nextPage, true)
		}
	}, [loading, loadingMore, hasMore, isSearchMode, page, loadProducts])

	const handleSearchChange = (value: string) => {
		setQuery(value)
	}

	return (
		<div className='flex flex-col h-[60vh]'>
			<div className='mb-4 relative'>
				<div className='absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none'>
					<Search className='text-gray-400' size={20} />
				</div>
				<Input
					value={query}
					onChange={e => handleSearchChange(e.target.value)}
					placeholder='Поиск продукта...'
					className='pl-10'
					autoFocus
				/>
			</div>

			<div
				ref={listRef}
				onScroll={handleScroll}
				className='flex-1 overflow-y-auto min-h-0 space-y-2'
			>
				{loading && products.length === 0 ? (
					<div className='flex justify-center py-8 text-gray-500'>
						<Loader2 className='animate-spin mr-2' size={20} />
						Загрузка...
					</div>
				) : products.length > 0 ? (
					<>
						{products.map(product => {
							const name = product.names?.[0]?.name || 'Без названия'
							const calories = product.nutrition.caloriesKcal
							// photos может быть массивом строк или объектов с url
							const firstPhoto = product.photos?.[0]
							const photo =
								typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url

							return (
								<button
									key={product.id}
									onClick={() => onSelect(product)}
									className='w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3'
								>
									<div className='w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-900 shrink-0 overflow-hidden'>
										{photo ? (
											<img
												src={photo}
												alt={name}
												className='w-full h-full object-cover'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center text-gray-300'>
												<Search size={20} />
											</div>
										)}
									</div>
									<div>
										<div className='font-medium text-gray-900 dark:text-white'>
											{name}
										</div>
										<div className='text-sm text-gray-500 dark:text-gray-400'>
											{calories} ккал / 100г
										</div>
									</div>
								</button>
							)
						})}
						{loadingMore && (
							<div className='flex justify-center py-4 text-gray-500'>
								<Loader2 className='animate-spin mr-2' size={16} />
								Загрузка...
							</div>
						)}
						{!hasMore && products.length > 0 && !isSearchMode && (
							<div className='text-center py-2 text-sm text-gray-400'>
								Все продукты загружены
							</div>
						)}
					</>
				) : (
					<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
						{query.trim() ? 'Ничего не найдено' : 'У вас пока нет продуктов'}
					</div>
				)}
			</div>
		</div>
	)
}
