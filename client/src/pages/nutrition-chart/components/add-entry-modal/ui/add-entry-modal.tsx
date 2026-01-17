import { ChevronRight, Minus, Plus, Utensils } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createMealEvent } from '../../../../../api/services/meal-events.ts'
import { listMealTypes } from '../../../../../api/services/meal-types.ts'
import type { Dish } from '../../../../../api/types/dishes.ts'
import type { MealType } from '../../../../../api/types/meal-types.ts'
import { Modal, Select, Textarea } from '../../../../../components/index.ts'
import { getUserTimezone } from '../../../../../utils/timezone.ts'
import { AddMealTypeModal } from '../../add-meal-type-modal/index.ts'
import { DishSelectModal } from '../../dish-select-modal/index.ts'

interface AddEntryModalProps {
	isOpen: boolean
	onClose: () => void
	selectedDate: Date
	selectedHour: number | null
	onCreated?: () => void
}

export const AddEntryModal = memo(function AddEntryModal({
	isOpen,
	onClose,
	selectedDate,
	selectedHour,
	onCreated,
}: AddEntryModalProps) {
	const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
	const [isDishModalOpen, setIsDishModalOpen] = useState(false)
	const [selectedMinutes, setSelectedMinutes] = useState(0)
	const [mealTypes, setMealTypes] = useState<MealType[]>([])
	const [selectedMealTypeId, setSelectedMealTypeId] = useState<string>('')
	const [isMealTypesLoading, setIsMealTypesLoading] = useState(false)
	const [isAddMealTypeModalOpen, setIsAddMealTypeModalOpen] = useState(false)
	const [portions, setPortions] = useState(1)
	const [note, setNote] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const formattedDate = selectedDate.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const formattedHour =
		selectedHour !== null ? `${selectedHour.toString().padStart(2, '0')}` : '00'

	const handleOpenDishModal = useCallback(() => {
		setIsDishModalOpen(true)
	}, [])

	const handleCloseDishModal = useCallback(() => {
		setIsDishModalOpen(false)
	}, [])

	const handleSelectDish = useCallback((dish: Dish) => {
		setSelectedDish(dish)
	}, [])

	const handleClearDish = useCallback(() => {
		setSelectedDish(null)
	}, [])

	const handleMinutesChange = useCallback((minutes: number) => {
		setSelectedMinutes(minutes)
	}, [])

	const handleMealTypeChange = useCallback((value: string) => {
		setSelectedMealTypeId(value)
	}, [])

	const handleOpenAddMealTypeModal = useCallback(() => {
		setIsAddMealTypeModalOpen(true)
	}, [])

	const handleCloseAddMealTypeModal = useCallback(() => {
		setIsAddMealTypeModalOpen(false)
	}, [])

	const handleMealTypeCreated = useCallback(async (newMealType: MealType) => {
		setIsAddMealTypeModalOpen(false)
		// Обновляем список и выбираем новый тип
		const data = await listMealTypes()
		setMealTypes(data.filter(mt => mt.isActive))
		setSelectedMealTypeId(newMealType.id)
	}, [])

	const handlePortionsChange = useCallback((delta: number) => {
		setPortions(prev => Math.max(0.5, Math.round((prev + delta) * 10) / 10))
	}, [])

	const handleNoteChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setNote(e.target.value)
		},
		[]
	)

	// Расчет КБЖУ для выбранного количества порций
	const calculatedNutrition = useMemo(() => {
		if (!selectedDish?.perPortion) return null
		const { nutrition, price, currency } = selectedDish.perPortion
		return {
			kcal: Math.round(nutrition.kcal * portions),
			proteins: Math.round(nutrition.proteins * portions * 10) / 10,
			fats: Math.round(nutrition.fats * portions * 10) / 10,
			carbs: Math.round(nutrition.carbs * portions * 10) / 10,
			price: price != null ? Math.round(price * portions * 100) / 100 : null,
			currency,
		}
	}, [selectedDish, portions])

	// Загрузка типов приемов пищи
	useEffect(() => {
		if (!isOpen) return

		const fetchMealTypes = async () => {
			setIsMealTypesLoading(true)
			try {
				const data = await listMealTypes()
				setMealTypes(data.filter(mt => mt.isActive))
			} catch {
				console.error('Не удалось загрузить типы приемов пищи')
			} finally {
				setIsMealTypesLoading(false)
			}
		}

		fetchMealTypes()
	}, [isOpen])

	const handleClose = useCallback(() => {
		setSelectedDish(null)
		setSelectedMinutes(0)
		setSelectedMealTypeId('')
		setPortions(1)
		setNote('')
		onClose()
	}, [onClose])

	const handleSubmit = useCallback(async () => {
		if (!selectedDish) return

		setIsSubmitting(true)
		try {
			// Формируем дату-время в UTC
			const startAt = new Date(selectedDate)
			startAt.setHours(selectedHour ?? 0, selectedMinutes, 0, 0)

			await createMealEvent({
				startAt: startAt.toISOString(),
				dishId: selectedDish.id,
				portions,
				mealTypeId: selectedMealTypeId || undefined,
				note: note.trim() || undefined,
				timezone: getUserTimezone(),
			})

			handleClose()
			onCreated?.()
		} catch (error) {
			console.error('Не удалось создать событие питания:', error)
		} finally {
			setIsSubmitting(false)
		}
	}, [
		selectedDish,
		selectedDate,
		selectedHour,
		selectedMinutes,
		portions,
		selectedMealTypeId,
		note,
		handleClose,
		onCreated,
	])

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				title='Добавить запись'
				maxWidth='xl'
			>
				<div className='space-y-6'>
					{/* Дата и время */}
					<div className='flex flex-wrap gap-6'>
						<div>
							<span className='text-sm text-gray-500 dark:text-gray-400'>
								Дата
							</span>
							<p className='font-medium text-gray-900 dark:text-white'>
								{formattedDate}
							</p>
						</div>
						<div>
							<span className='text-sm text-gray-500 dark:text-gray-400'>
								Время
							</span>
							<div className='flex items-center gap-2 mt-1'>
								<span className='font-medium text-gray-900 dark:text-white text-lg'>
									{formattedHour}:
								</span>
								<div className='flex gap-1'>
									{[0, 15, 30, 45].map(minutes => (
										<button
											key={minutes}
											onClick={() => handleMinutesChange(minutes)}
											className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
												selectedMinutes === minutes
													? 'bg-blue-500 text-white'
													: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
											}`}
										>
											{minutes.toString().padStart(2, '0')}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Тип приема пищи */}
					<div className='flex items-end gap-2'>
						<div className='flex-1'>
							<Select
								label='Тип приема пищи'
								value={selectedMealTypeId}
								onChange={handleMealTypeChange}
								disabled={isMealTypesLoading}
								placeholder={isMealTypesLoading ? 'Загрузка...' : 'Не выбрано'}
								options={mealTypes.map(mealType => ({
									value: mealType.id,
									label: mealType.name,
								}))}
							/>
						</div>
						<button
							onClick={handleOpenAddMealTypeModal}
							className='p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer'
							title='Добавить тип приема пищи'
						>
							<Plus className='h-5 w-5' />
						</button>
					</div>

					{/* Выбор блюда */}
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Блюдо
						</label>
						{selectedDish ? (
							<div className='p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex-1 min-w-0'>
										<h4 className='font-medium text-gray-900 dark:text-white'>
											{selectedDish.name}
										</h4>
									</div>
									<button
										onClick={handleClearDish}
										className='text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
									>
										Удалить
									</button>
								</div>

								{/* Количество порций */}
								<div className='mt-4 flex items-center gap-4'>
									<span className='text-sm text-gray-600 dark:text-gray-400'>
										Порций:
									</span>
									<div className='flex items-center gap-2'>
										<button
											onClick={() => handlePortionsChange(-0.5)}
											disabled={portions <= 0.5}
											className='p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
										>
											<Minus className='h-4 w-4 text-gray-600 dark:text-gray-300' />
										</button>
										<span className='w-12 text-center font-medium text-gray-900 dark:text-white'>
											{portions}
										</span>
										<button
											onClick={() => handlePortionsChange(0.5)}
											className='p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
										>
											<Plus className='h-4 w-4 text-gray-600 dark:text-gray-300' />
										</button>
									</div>
								</div>

								{/* Расчетное КБЖУ */}
								{calculatedNutrition && (
									<div className='mt-3 pt-3 border-t border-blue-200 dark:border-blue-700'>
										<div className='flex flex-wrap gap-4 text-sm'>
											<span className='text-gray-900 dark:text-white font-medium'>
												{calculatedNutrition.kcal} ккал
											</span>
											<span className='text-gray-600 dark:text-gray-400'>
												Б: {calculatedNutrition.proteins}г
											</span>
											<span className='text-gray-600 dark:text-gray-400'>
												Ж: {calculatedNutrition.fats}г
											</span>
											<span className='text-gray-600 dark:text-gray-400'>
												У: {calculatedNutrition.carbs}г
											</span>
											{calculatedNutrition.price != null && (
												<span className='text-green-600 dark:text-green-400'>
													{calculatedNutrition.price}{' '}
													{calculatedNutrition.currency || '₽'}
												</span>
											)}
										</div>
									</div>
								)}

								<button
									onClick={handleOpenDishModal}
									className='mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
								>
									Изменить блюдо
								</button>
							</div>
						) : (
							<button
								onClick={handleOpenDishModal}
								className='w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer group'
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<div className='p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors'>
											<Utensils className='h-5 w-5 text-gray-400 group-hover:text-blue-500' />
										</div>
										<span className='text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'>
											Выберите блюдо
										</span>
									</div>
									<ChevronRight className='h-5 w-5 text-gray-400 group-hover:text-blue-500' />
								</div>
							</button>
						)}
					</div>

					{/* Комментарий */}
					<Textarea
						label='Комментарий'
						value={note}
						onChange={handleNoteChange}
						placeholder='Например: с огурцами, без соуса...'
						rows={2}
					/>

					{/* Кнопки */}
					<div className='flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<button
							onClick={handleClose}
							disabled={isSubmitting}
							className='px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50'
						>
							Отмена
						</button>
						<button
							onClick={handleSubmit}
							disabled={!selectedDish || isSubmitting}
							className='px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-lg transition-colors disabled:cursor-not-allowed'
						>
							{isSubmitting ? 'Сохранение...' : 'Добавить'}
						</button>
					</div>
				</div>
			</Modal>

			{/* Модалка выбора блюда */}
			<DishSelectModal
				isOpen={isDishModalOpen}
				onClose={handleCloseDishModal}
				onSelect={handleSelectDish}
			/>

			{/* Модалка добавления типа приема пищи */}
			<AddMealTypeModal
				isOpen={isAddMealTypeModalOpen}
				onClose={handleCloseAddMealTypeModal}
				onCreated={handleMealTypeCreated}
			/>
		</>
	)
})
