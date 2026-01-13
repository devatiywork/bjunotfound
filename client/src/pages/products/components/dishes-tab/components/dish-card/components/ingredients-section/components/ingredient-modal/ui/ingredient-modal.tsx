import { ChevronRight, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getProductUser } from '../../../../../../../../../../../api/services/products'
import {
	type CreateDishItemDto,
	type DishItem,
	type DishMeasureType,
	type UpdateDishItemDto,
} from '../../../../../../../../../../../api/types/dishes'
import { type ProductUser } from '../../../../../../../../../../../api/types/products'
import {
	Input,
	Modal,
	Select,
	Textarea,
	useToast,
} from '../../../../../../../../../../../components'
import { ProductSearch } from '../components/product-search/ui/product-search'

interface IngredientModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: CreateDishItemDto | UpdateDishItemDto) => Promise<void>
	initialData?: DishItem | null
}

export const IngredientModal = ({
	isOpen,
	onClose,
	onSave,
	initialData,
}: IngredientModalProps) => {
	const { showToast } = useToast()
	const [view, setView] = useState<'form' | 'search'>('form')
	const [saving, setSaving] = useState(false)
	const [loadingProduct, setLoadingProduct] = useState(false)

	// Form State
	const [selectedProduct, setSelectedProduct] = useState<ProductUser | null>(
		null
	)
	const [measureType, setMeasureType] = useState<DishMeasureType>('GRAMS')
	const [amount, setAmount] = useState<string>('')
	const [servingId, setServingId] = useState<string>('')
	const [note, setNote] = useState('')

	// Загрузка полных данных продукта (для получения servings)
	const loadFullProductData = async (productId: string) => {
		setLoadingProduct(true)
		try {
			const fullProduct = await getProductUser(productId)
			setSelectedProduct(fullProduct as unknown as ProductUser)
		} catch (error) {
			console.error('Error loading product details:', error)
		} finally {
			setLoadingProduct(false)
		}
	}

	// Initialize form on open/change
	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				// Edit mode - сначала устанавливаем базовые данные
				setMeasureType(initialData.measureType)
				setNote(initialData.note || '')

				if (initialData.measureType === 'GRAMS') {
					setAmount(initialData.amountG?.toString() || '')
				} else if (initialData.measureType === 'MILLILITERS') {
					setAmount(initialData.amountMl?.toString() || '')
				} else if (initialData.measureType === 'SERVINGS') {
					setAmount(initialData.servingsCount?.toString() || '')
					setServingId(initialData.servingId || '')
				}
				setView('form')

				// Загружаем полные данные продукта (включая servings)
				loadFullProductData(initialData.productUserId)
			} else {
				// Create mode
				resetForm()
				setView('search') // Start with search for new items
			}
		}
	}, [isOpen, initialData])

	const resetForm = () => {
		setSelectedProduct(null)
		setMeasureType('GRAMS')
		setAmount('')
		setServingId('')
		setNote('')
		setSaving(false)
	}

	// Загружаем полные данные продукта (включая servings)
	const handleProductSelect = async (product: ProductUser) => {
		setLoadingProduct(true)
		try {
			// Загружаем полные данные продукта с порциями
			const fullProduct = await getProductUser(product.id)
			// ProductUserResponse это сам продукт, приводим к ProductUser
			setSelectedProduct(fullProduct as unknown as ProductUser)
			setView('form')
			setMeasureType('GRAMS')
			setAmount('')
			setServingId('')
		} catch (error) {
			console.error('Error loading product details:', error)
			// Если не удалось загрузить, используем базовые данные
			setSelectedProduct(product)
			setView('form')
			setMeasureType('GRAMS')
			setAmount('')
			setServingId('')
		} finally {
			setLoadingProduct(false)
		}
	}

	const calculateNutrition = () => {
		if (!selectedProduct) return null
		const value = parseFloat(amount.replace(',', '.'))
		if (isNaN(value) || value <= 0) return null

		const { caloriesKcal, proteinsG, fatsG, carbohydratesG } =
			selectedProduct.nutrition
		let ratio = 0

		if (measureType === 'GRAMS') {
			ratio = value / 100
		} else if (measureType === 'MILLILITERS') {
			// Assuming 1ml ~ 1g for simplicty if density not known, or just per 100ml
			ratio = value / 100
		} else if (measureType === 'SERVINGS') {
			// Сначала ищем в servings
			const serving = selectedProduct.servings?.find(s => s.id === servingId)
			if (serving && (serving.weightG || serving.volumeMl)) {
				const weight = serving.weightG || serving.volumeMl || 0
				ratio = (weight * value) / 100
			} else {
				// Если нет в servings, ищем в portions
				const portion = selectedProduct.portions?.find(p => p.id === servingId)
				if (portion && portion.gramsOrMl) {
					ratio = (portion.gramsOrMl * value) / 100
				}
			}
		}

		return {
			kcal: Math.round(caloriesKcal * ratio),
			proteins: Math.round(proteinsG * ratio * 10) / 10,
			fats: Math.round(fatsG * ratio * 10) / 10,
			carbs: Math.round(carbohydratesG * ratio * 10) / 10,
		}
	}

	const handleSubmit = async () => {
		if (!selectedProduct) {
			showToast('Выберите продукт', 'error')
			return
		}

		const numAmount = parseFloat(amount.replace(',', '.'))
		if (isNaN(numAmount) || numAmount <= 0) {
			showToast('Введите корректное количество', 'error')
			return
		}

		if (measureType === 'SERVINGS' && !servingId) {
			showToast('Выберите порцию', 'error')
			return
		}

		setSaving(true)
		try {
			const commonData = {
				note: note.trim() || undefined,
				measureType,
			}

			let payload: CreateDishItemDto | UpdateDishItemDto

			if (initialData) {
				// Update DTO
				payload = {
					...commonData,
				} as UpdateDishItemDto
			} else {
				// Create DTO
				payload = {
					...commonData,
					productUserId: selectedProduct.id,
				} as CreateDishItemDto
			}

			// Add amount fields
			if (measureType === 'GRAMS') {
				payload.amountG = numAmount
			} else if (measureType === 'MILLILITERS') {
				payload.amountMl = numAmount
			} else if (measureType === 'SERVINGS') {
				payload.servingsCount = numAmount
				payload.servingId = servingId
			}

			await onSave(payload)
			onClose()
		} catch (error) {
			console.error('Save error:', error)
			showToast('Ошибка при сохранении', 'error')
		} finally {
			setSaving(false)
		}
	}

	// Проверяем наличие порций (servings или portions)
	const hasServings = useMemo(() => {
		return (
			(selectedProduct?.servings && selectedProduct.servings.length > 0) ||
			(selectedProduct?.portions && selectedProduct.portions.length > 0)
		)
	}, [selectedProduct])

	// Prepare options for Select
	const measureOptions = useMemo(() => {
		const options = [
			{ value: 'GRAMS', label: 'Граммы (г)' },
			{ value: 'MILLILITERS', label: 'Миллилитры (мл)' },
		]
		// Add SERVINGS only if product has servings or portions
		if (hasServings) {
			options.push({ value: 'SERVINGS', label: 'Порции' })
		}
		return options
	}, [hasServings])

	const servingOptions = useMemo(() => {
		// Сначала пробуем servings
		if (selectedProduct?.servings && selectedProduct.servings.length > 0) {
			return selectedProduct.servings.map(s => ({
				value: s.id,
				label: `${s.name} (${s.weightG ? `${s.weightG}г` : ''}${
					s.weightG && s.volumeMl ? ' / ' : ''
				}${s.volumeMl ? `${s.volumeMl}мл` : ''})`,
			}))
		}
		// Если нет servings, пробуем portions
		if (selectedProduct?.portions && selectedProduct.portions.length > 0) {
			return selectedProduct.portions.map(p => ({
				value: p.id,
				label: `${p.name} (${p.gramsOrMl}г)`,
			}))
		}
		return []
	}, [selectedProduct])

	const nutrition = calculateNutrition()

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				view === 'search'
					? 'Поиск продукта'
					: initialData
					? 'Редактировать ингредиент'
					: 'Добавить ингредиент'
			}
			maxWidth='lg'
		>
			{view === 'search' ? (
				<div className='flex flex-col h-full'>
					<button
						onClick={() => setView('form')}
						className='self-start mb-2 flex items-center text-sm text-gray-500 hover:text-gray-700'
						hidden={!selectedProduct} // Hide back button if no product selected yet (first load)
					>
						<ChevronRight className='rotate-180 mr-1' size={16} /> Назад к форме
					</button>
					<ProductSearch onSelect={handleProductSelect} />
				</div>
			) : (
				<div className='space-y-4'>
					{/* Product Selector Display */}
					<div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
						{selectedProduct ? (
							<div className='flex justify-between items-center'>
								<div className='flex items-center gap-3'>
									<div className='w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0'>
										{selectedProduct.photos?.[0] ? (
											<img
												src={
													typeof selectedProduct.photos[0] === 'string'
														? selectedProduct.photos[0]
														: selectedProduct.photos[0].url
												}
												alt=''
												className='w-full h-full object-cover'
											/>
										) : (
											<div className='w-full h-full flex items-center justify-center text-gray-400'>
												<Search size={16} />
											</div>
										)}
									</div>
									<div className='min-w-0'>
										<div className='font-medium text-gray-900 dark:text-white truncate'>
											{selectedProduct.names?.[0]?.name || 'Без названия'}
										</div>
										<div className='text-xs text-gray-500 dark:text-gray-400'>
											{selectedProduct.nutrition.caloriesKcal} ккал / 100г
										</div>
									</div>
								</div>
								{!initialData && (
									<button
										onClick={() => setView('search')}
										className='px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors'
									>
										Изменить
									</button>
								)}
							</div>
						) : (
							<button
								onClick={() => setView('search')}
								className='w-full py-3 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-300 dark:hover:border-blue-700 transition-colors'
							>
								<Search size={16} />
								Выбрать продукт
							</button>
						)}
					</div>

					{loadingProduct && (
						<div className='flex justify-center py-4 text-gray-500'>
							Загрузка данных продукта...
						</div>
					)}

					{selectedProduct && !loadingProduct && (
						<>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<Select
									label='Тип измерения'
									options={measureOptions}
									value={measureType}
									onChange={val => setMeasureType(val as DishMeasureType)}
								/>
								<Input
									label={
										measureType === 'SERVINGS'
											? 'Количество порций'
											: measureType === 'GRAMS'
											? 'Вес (г)'
											: 'Объем (мл)'
									}
									value={amount}
									onChange={e => setAmount(e.target.value)}
									type='number'
									placeholder='0'
								/>
							</div>

							{measureType === 'SERVINGS' && (
								<Select
									label='Размер порции'
									options={servingOptions}
									value={servingId}
									onChange={setServingId}
									placeholder='Выберите порцию'
								/>
							)}

							<Textarea
								label='Заметка (опционально)'
								value={note}
								onChange={e => setNote(e.target.value)}
								placeholder='Например: сырые, без кожуры...'
								rows={2}
							/>

							{nutrition && (
								<div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30'>
									<div className='text-sm text-center text-blue-800 dark:text-blue-200 font-medium mb-1'>
										Итого КБЖУ на {amount}{' '}
										{measureType === 'GRAMS'
											? 'г'
											: measureType === 'MILLILITERS'
											? 'мл'
											: 'порц.'}
									</div>
									<div className='flex justify-between text-sm text-blue-700 dark:text-blue-300'>
										<span>{nutrition.kcal} ккал</span>
										<span>{nutrition.proteins} Б</span>
										<span>{nutrition.fats} Ж</span>
										<span>{nutrition.carbs} У</span>
									</div>
								</div>
							)}

							<div className='flex gap-3 pt-2'>
								<button
									onClick={onClose}
									className='flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
									disabled={saving}
								>
									Отмена
								</button>
								<button
									onClick={handleSubmit}
									disabled={
										saving || (measureType === 'SERVINGS' && !servingId)
									}
									className='flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									{saving ? 'Сохранение...' : 'Сохранить'}
								</button>
							</div>
						</>
					)}
				</div>
			)}
		</Modal>
	)
}
