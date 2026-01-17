import { ImageOff, Search, X } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { listDishes } from '../../../../../api/services/dishes.ts'
import type { Dish } from '../../../../../api/types/dishes.ts'
import { Modal } from '../../../../../components/index.ts'

interface DishSelectModalProps {
	isOpen: boolean
	onClose: () => void
	onSelect: (dish: Dish) => void
}

export const DishSelectModal = memo(function DishSelectModal({
	isOpen,
	onClose,
	onSelect,
}: DishSelectModalProps) {
	const [dishes, setDishes] = useState<Dish[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState('')

	// Загрузка блюд
	useEffect(() => {
		if (!isOpen) return

		const fetchDishes = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const response = await listDishes({ status: 'READY' })
				setDishes(response.data)
			} catch {
				setError('Не удалось загрузить блюда')
			} finally {
				setIsLoading(false)
			}
		}

		fetchDishes()
	}, [isOpen])

	// Фильтрация по поиску
	const filteredDishes = dishes.filter(dish =>
		dish.name.toLowerCase().includes(search.toLowerCase())
	)

	const handleSelect = useCallback(
		(dish: Dish) => {
			onSelect(dish)
			onClose()
		},
		[onSelect, onClose]
	)

	const handleClearSearch = useCallback(() => {
		setSearch('')
	}, [])

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Выберите блюдо'
			maxWidth='xl'
		>
			<div className='space-y-4'>
				{/* Поиск */}
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
					<input
						type='text'
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder='Поиск блюда...'
						className='w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					/>
					{search && (
						<button
							onClick={handleClearSearch}
							className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
						>
							<X className='h-4 w-4 text-gray-400' />
						</button>
					)}
				</div>

				{/* Список блюд */}
				<div className='max-h-96 overflow-y-auto -mx-4 px-4'>
					{isLoading ? (
						<div className='flex items-center justify-center py-8'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
						</div>
					) : error ? (
						<div className='text-center py-8 text-red-500 dark:text-red-400'>
							{error}
						</div>
					) : filteredDishes.length === 0 ? (
						<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
							{search ? 'Блюда не найдены' : 'У вас пока нет блюд'}
						</div>
					) : (
						<div className='space-y-2'>
							{filteredDishes.map(dish => (
								<button
									key={dish.id}
									onClick={() => handleSelect(dish)}
									className='w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer'
								>
									<div className='flex items-center gap-4'>
										{/* Миниатюра */}
										<div className='shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700'>
											{dish.photos && dish.photos.length > 0 ? (
												<img
													src={dish.photos[0]}
													alt={dish.name}
													className='w-full h-full object-cover'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center'>
													<ImageOff className='w-6 h-6 text-gray-400 dark:text-gray-500' />
												</div>
											)}
										</div>

										{/* Информация о блюде */}
										<div className='flex-1 min-w-0'>
											<h4 className='font-medium text-gray-900 dark:text-white truncate'>
												{dish.name}
											</h4>
											{dish.description && (
												<p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1'>
													{dish.description}
												</p>
											)}
										</div>

										{/* КБЖУ и цена */}
										{dish.perPortion && (
											<div className='shrink-0 text-right'>
												<div className='text-lg font-semibold text-gray-900 dark:text-white'>
													{Math.round(dish.perPortion.nutrition.kcal)}{' '}
													<span className='text-sm font-normal text-gray-500'>
														ккал
													</span>
												</div>
												<div className='flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1'>
													<span>
														Б:{' '}
														<span className='text-gray-700 dark:text-gray-300'>
															{Math.round(dish.perPortion.nutrition.proteins)}г
														</span>
													</span>
													<span>
														Ж:{' '}
														<span className='text-gray-700 dark:text-gray-300'>
															{Math.round(dish.perPortion.nutrition.fats)}г
														</span>
													</span>
													<span>
														У:{' '}
														<span className='text-gray-700 dark:text-gray-300'>
															{Math.round(dish.perPortion.nutrition.carbs)}г
														</span>
													</span>
												</div>
												{dish.perPortion.price != null && (
													<div className='text-sm text-green-600 dark:text-green-400 mt-1'>
														{Math.round(dish.perPortion.price)}{' '}
														{dish.perPortion.currency || '₽'}
													</div>
												)}
											</div>
										)}
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Кнопка закрытия */}
				<div className='flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700'>
					<button
						onClick={onClose}
						className='px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
					>
						Отмена
					</button>
				</div>
			</div>
		</Modal>
	)
})
