import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DishTag, FilterDishesDto } from '../../../../../api'
import type {
	CuisineType,
	DifficultyLevel,
	MealType,
} from '../../../../../api/types/dishes.ts'
import { Input } from '../../../../../components/input'
import { Select } from '../../../../../components/select'

interface DishFiltersPanelProps {
	filters: FilterDishesDto
	tags: DishTag[]
	onApply: (filters: Partial<FilterDishesDto>) => void
	onClose: () => void
}

export default function DishFiltersPanel({
	filters,
	tags,
	onApply,
	onClose,
}: DishFiltersPanelProps) {
	const [localFilters, setLocalFilters] = useState<FilterDishesDto>(filters)
	const [isAnimating, setIsAnimating] = useState(false)

	useEffect(() => {
		// Блокируем скролл на body при открытии
		document.body.style.overflow = 'hidden'

		// Запускаем анимацию появления
		setTimeout(() => setIsAnimating(true), 10)

		return () => {
			// Восстанавливаем скролл при закрытии
			document.body.style.overflow = ''
		}
	}, [])

	const handleClose = () => {
		setIsAnimating(false)
		setTimeout(() => onClose(), 300) // Ждем завершения анимации
	}

	const handleApply = () => {
		onApply(localFilters)
	}

	const handleReset = () => {
		const resetFilters: FilterDishesDto = {
			page: 1,
			limit: 20,
			sortBy: 'createdAt',
			sortOrder: 'desc',
		}
		setLocalFilters(resetFilters)
		onApply(resetFilters)
	}

	return (
		<div className='fixed inset-0 z-50 overflow-hidden'>
			<div className='absolute inset-0 overflow-hidden'>
				<div
					className={`absolute inset-0 backdrop-blur-[2px] bg-black/20 dark:bg-black/40 transition-opacity duration-300 ${
						isAnimating ? 'opacity-100' : 'opacity-0'
					}`}
					onClick={handleClose}
				/>

				<div className='fixed inset-y-0 right-0 pl-10 max-w-full flex'>
					<div
						className={`w-screen max-w-md transform transition-transform duration-300 ease-in-out ${
							isAnimating ? 'translate-x-0' : 'translate-x-full'
						}`}
					>
						<div className='h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl'>
							{/* Header */}
							<div className='px-4 sm:px-6 py-6 bg-gray-50 dark:bg-gray-900'>
								<div className='flex items-start justify-between'>
									<h2 className='text-lg font-medium text-gray-900 dark:text-white'>
										Фильтры блюд
									</h2>
									<button
										onClick={handleClose}
										className='ml-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
									>
										<X className='h-6 w-6' />
									</button>
								</div>
							</div>

							{/* Body */}
							<div className='flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6'>
								{/* Meal Type */}
								<Select
									label='Тип приёма пищи'
									value={localFilters.mealType || ''}
									onChange={value =>
										setLocalFilters(prev => ({
											...prev,
											mealType: (value || undefined) as MealType | undefined,
										}))
									}
									options={[
										{ value: '', label: 'Все' },
										{ value: 'BREAKFAST', label: 'Завтрак' },
										{ value: 'LUNCH', label: 'Обед' },
										{ value: 'DINNER', label: 'Ужин' },
										{ value: 'SNACK', label: 'Перекус' },
										{ value: 'DESSERT', label: 'Десерт' },
									]}
								/>

								{/* Cuisine Type */}
								<Select
									label='Тип кухни'
									value={localFilters.cuisineType || ''}
									onChange={value =>
										setLocalFilters(prev => ({
											...prev,
											cuisineType: (value || undefined) as
												| CuisineType
												| undefined,
										}))
									}
									options={[
										{ value: '', label: 'Все' },
										{ value: 'RUSSIAN', label: 'Русская' },
										{ value: 'ITALIAN', label: 'Итальянская' },
										{ value: 'ASIAN', label: 'Азиатская' },
										{ value: 'MEXICAN', label: 'Мексиканская' },
										{ value: 'FRENCH', label: 'Французская' },
										{ value: 'JAPANESE', label: 'Японская' },
										{ value: 'AMERICAN', label: 'Американская' },
									]}
								/>

								{/* Difficulty */}
								<Select
									label='Сложность'
									value={localFilters.difficulty || ''}
									onChange={value =>
										setLocalFilters(prev => ({
											...prev,
											difficulty: (value || undefined) as
												| DifficultyLevel
												| undefined,
										}))
									}
									options={[
										{ value: '', label: 'Все' },
										{ value: 'EASY', label: 'Простое' },
										{ value: 'MEDIUM', label: 'Среднее' },
										{ value: 'HARD', label: 'Сложное' },
									]}
								/>

								{/* Calories Range */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Калории (на порцию)
									</label>
									<div className='grid grid-cols-2 gap-3'>
										<Input
											type='number'
											placeholder='От'
											value={localFilters.minCalories || ''}
											onChange={e =>
												setLocalFilters(prev => ({
													...prev,
													minCalories: e.target.value
														? Number(e.target.value)
														: undefined,
												}))
											}
										/>
										<Input
											type='number'
											placeholder='До'
											value={localFilters.maxCalories || ''}
											onChange={e =>
												setLocalFilters(prev => ({
													...prev,
													maxCalories: e.target.value
														? Number(e.target.value)
														: undefined,
												}))
											}
										/>
									</div>
								</div>

								{/* Price Range */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Цена за порцию (₽)
									</label>
									<div className='grid grid-cols-2 gap-3'>
										<Input
											type='number'
											placeholder='От'
											value={localFilters.minPrice || ''}
											onChange={e =>
												setLocalFilters(prev => ({
													...prev,
													minPrice: e.target.value
														? Number(e.target.value)
														: undefined,
												}))
											}
										/>
										<Input
											type='number'
											placeholder='До'
											value={localFilters.maxPrice || ''}
											onChange={e =>
												setLocalFilters(prev => ({
													...prev,
													maxPrice: e.target.value
														? Number(e.target.value)
														: undefined,
												}))
											}
										/>
									</div>
								</div>

								{/* Cooking Time Range */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Время приготовления (мин)
									</label>
									<div className='grid grid-cols-2 gap-3'>
										<Input
											type='number'
											placeholder='От'
											value={localFilters.minCookingTime || ''}
											onChange={e =>
												setLocalFilters(prev => ({
													...prev,
													minCookingTime: e.target.value
														? Number(e.target.value)
														: undefined,
												}))
											}
										/>
										<Input
											type='number'
											placeholder='До'
											value={localFilters.maxCookingTime || ''}
											onChange={e =>
												setLocalFilters(prev => ({
													...prev,
													maxCookingTime: e.target.value
														? Number(e.target.value)
														: undefined,
												}))
											}
										/>
									</div>
								</div>

								{/* Tags */}
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Теги
									</label>
									<div className='space-y-2 max-h-60 overflow-y-auto'>
										{tags.map(tag => (
											<label
												key={tag.id}
												className='flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
											>
												<input
													type='checkbox'
													checked={
														localFilters.tagIds?.includes(tag.id) || false
													}
													onChange={e => {
														const newTagIds = e.target.checked
															? [...(localFilters.tagIds || []), tag.id]
															: (localFilters.tagIds || []).filter(
																	id => id !== tag.id
															  )
														setLocalFilters(prev => ({
															...prev,
															tagIds: newTagIds,
														}))
													}}
													className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
												/>
												<span className='text-sm text-gray-900 dark:text-white'>
													{tag.name}
												</span>
											</label>
										))}
									</div>
								</div>

								{/* Sort */}
								<Select
									label='Сортировка'
									value={localFilters.sortBy || 'createdAt'}
									onChange={value =>
										setLocalFilters(prev => ({
											...prev,
											sortBy: value as
												| 'name'
												| 'caloriesPerServing'
												| 'pricePerServing'
												| 'cookingTimeMinutes'
												| 'createdAt',
										}))
									}
									options={[
										{ value: 'name', label: 'По названию' },
										{ value: 'caloriesPerServing', label: 'По калориям' },
										{ value: 'pricePerServing', label: 'По цене' },
										{
											value: 'cookingTimeMinutes',
											label: 'По времени готовки',
										},
										{ value: 'createdAt', label: 'По дате создания' },
									]}
								/>

								<Select
									label='Порядок'
									value={localFilters.sortOrder || 'desc'}
									onChange={value =>
										setLocalFilters(prev => ({
											...prev,
											sortOrder: value as 'asc' | 'desc',
										}))
									}
									options={[
										{ value: 'asc', label: 'По возрастанию' },
										{ value: 'desc', label: 'По убыванию' },
									]}
								/>

								{/* Verified Only */}
								<label className='flex items-center gap-2 cursor-pointer'>
									<input
										type='checkbox'
										checked={localFilters.isVerified || false}
										onChange={e =>
											setLocalFilters(prev => ({
												...prev,
												isVerified: e.target.checked || undefined,
											}))
										}
										className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
									/>
									<span className='text-sm text-gray-900 dark:text-white'>
										Только верифицированные
									</span>
								</label>
							</div>

							{/* Footer */}
							<div className='px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900 flex gap-3'>
								<button
									onClick={handleReset}
									className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
								>
									Сбросить
								</button>
								<button
									onClick={handleApply}
									className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
								>
									Применить
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
