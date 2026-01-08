import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type {
	Category,
	ProductFilters,
	ProductSource,
	Tag,
} from '../../../../../api'
import { Select } from '../../../../../components/select'

interface ProductFiltersPanelProps {
	filters: ProductFilters
	categories: Category[]
	tags: Tag[]
	onApply: (filters: Partial<ProductFilters>) => void
	onClose: () => void
}

export default function ProductFiltersPanel({
	filters,
	categories,
	tags,
	onApply,
	onClose,
}: ProductFiltersPanelProps) {
	const [localFilters, setLocalFilters] = useState<Partial<ProductFilters>>({
		categoryId: filters.categoryId,
		tagIds: filters.tagIds || [],
		minCalories: filters.minCalories,
		maxCalories: filters.maxCalories,
		minPrice: filters.minPrice,
		maxPrice: filters.maxPrice,
		source: filters.source,
		isVerified: filters.isVerified,
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
	})
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

	const handleTagToggle = (tagId: string) => {
		setLocalFilters(prev => ({
			...prev,
			tagIds: prev.tagIds?.includes(tagId)
				? prev.tagIds.filter(id => id !== tagId)
				: [...(prev.tagIds || []), tagId],
		}))
	}

	const handleApply = () => {
		onApply(localFilters)
	}

	const handleReset = () => {
		setLocalFilters({
			sortBy: 'createdAt',
			sortOrder: 'desc',
		})
	}

	// Prepare options for Select components
	const categoryOptions = [
		{ value: '', label: 'Все категории' },
		...categories.map(cat => ({ value: cat.id, label: cat.name })),
	]

	const sourceOptions = [
		{ value: '', label: 'Все источники' },
		{ value: 'ADMIN', label: 'Администратор' },
		{ value: 'USER', label: 'Пользователи' },
		{ value: 'API', label: 'API' },
		{ value: 'IMPORT', label: 'Импорт' },
	]

	const verifiedOptions = [
		{ value: '', label: 'Все продукты' },
		{ value: 'true', label: 'Только верифицированные' },
		{ value: 'false', label: 'Только неверифицированные' },
	]

	const sortByOptions = [
		{ value: 'createdAt', label: 'Дате добавления' },
		{ value: 'name', label: 'Названию' },
		{ value: 'calories', label: 'Калориям' },
		{ value: 'price', label: 'Цене' },
	]

	const sortOrderOptions = [
		{ value: 'asc', label: 'По возрастанию' },
		{ value: 'desc', label: 'По убыванию' },
	]

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
										Фильтры продуктов
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
								{/* Category */}
								<Select
									label='Категория'
									value={localFilters.categoryId || ''}
									onChange={(value: string) =>
										setLocalFilters({
											...localFilters,
											categoryId: value || undefined,
										})
									}
									options={categoryOptions}
								/>

								{/* Tags */}
								<div className='space-y-2'>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Теги
									</label>
									<div className='flex flex-wrap gap-2 max-h-40 overflow-y-auto'>
										{tags.map(tag => (
											<button
												key={tag.id}
												type='button'
												onClick={() => handleTagToggle(tag.id)}
												className={`px-3 py-1 rounded-full text-sm transition-colors ${
													localFilters.tagIds?.includes(tag.id)
														? 'bg-purple-600 text-white'
														: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
												}`}
											>
												{tag.name}
											</button>
										))}
									</div>
								</div>

								{/* Calories Range */}
								<div className='space-y-2'>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Диапазон калорий
									</label>
									<div className='grid grid-cols-2 gap-3'>
										<input
											type='number'
											placeholder='От'
											value={localFilters.minCalories || ''}
											onChange={e =>
												setLocalFilters({
													...localFilters,
													minCalories: e.target.value
														? Number(e.target.value)
														: undefined,
												})
											}
											className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
											min={0}
										/>
										<input
											type='number'
											placeholder='До'
											value={localFilters.maxCalories || ''}
											onChange={e =>
												setLocalFilters({
													...localFilters,
													maxCalories: e.target.value
														? Number(e.target.value)
														: undefined,
												})
											}
											className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
											min={0}
										/>
									</div>
								</div>

								{/* Price Range */}
								<div className='space-y-2'>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Диапазон цен (₽)
									</label>
									<div className='grid grid-cols-2 gap-3'>
										<input
											type='number'
											placeholder='От'
											value={localFilters.minPrice || ''}
											onChange={e =>
												setLocalFilters({
													...localFilters,
													minPrice: e.target.value
														? Number(e.target.value)
														: undefined,
												})
											}
											className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
											min={0}
										/>
										<input
											type='number'
											placeholder='До'
											value={localFilters.maxPrice || ''}
											onChange={e =>
												setLocalFilters({
													...localFilters,
													maxPrice: e.target.value
														? Number(e.target.value)
														: undefined,
												})
											}
											className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
											min={0}
										/>
									</div>
								</div>

								{/* Source */}
								<Select
									label='Источник'
									value={localFilters.source || ''}
									onChange={(value: string) =>
										setLocalFilters({
											...localFilters,
											source: (value as ProductSource) || undefined,
										})
									}
									options={sourceOptions}
								/>

								{/* Verified */}
								<Select
									label='Верификация'
									value={
										localFilters.isVerified === undefined
											? ''
											: localFilters.isVerified
											? 'true'
											: 'false'
									}
									onChange={(value: string) =>
										setLocalFilters({
											...localFilters,
											isVerified: value === '' ? undefined : value === 'true',
										})
									}
									options={verifiedOptions}
								/>

								{/* Sort */}
								<div className='grid grid-cols-2 gap-3'>
									<Select
										label='Сортировать по'
										value={localFilters.sortBy || 'createdAt'}
										onChange={(value: string) =>
											setLocalFilters({
												...localFilters,
												sortBy: value as ProductFilters['sortBy'],
											})
										}
										options={sortByOptions}
									/>

									<Select
										label='Порядок'
										value={localFilters.sortOrder || 'desc'}
										onChange={(value: string) =>
											setLocalFilters({
												...localFilters,
												sortOrder: value as 'asc' | 'desc',
											})
										}
										options={sortOrderOptions}
									/>
								</div>

								{/* Actions */}
								<div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
									<button
										type='button'
										onClick={handleReset}
										className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
									>
										Сбросить
									</button>
									<button
										type='button'
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
		</div>
	)
}
