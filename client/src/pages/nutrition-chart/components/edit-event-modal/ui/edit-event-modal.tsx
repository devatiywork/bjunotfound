import { Minus, Plus } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { updateMealEvent } from '../../../../../api/services/meal-events.ts'
import { listMealTypes } from '../../../../../api/services/meal-types.ts'
import type { MealEventWithDetails } from '../../../../../api/types/meal-events.ts'
import type { MealType } from '../../../../../api/types/meal-types.ts'
import { Modal, Select, Textarea } from '../../../../../components/index.ts'
import { useToast } from '../../../../../components/toast/index.ts'
import { getUserTimezone } from '../../../../../utils/timezone.ts'

interface EditEventModalProps {
	isOpen: boolean
	onClose: () => void
	event: MealEventWithDetails | null
	onUpdated?: () => void
}

const MINUTES_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
	value: String(i * 5),
	label: String(i * 5).padStart(2, '0'),
}))

const HOURS_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
	value: String(i),
	label: String(i).padStart(2, '0'),
}))

export const EditEventModal = memo(function EditEventModal({
	isOpen,
	onClose,
	event,
	onUpdated,
}: EditEventModalProps) {
	const { showToast } = useToast()

	const [selectedHour, setSelectedHour] = useState(0)
	const [selectedMinutes, setSelectedMinutes] = useState(0)
	const [mealTypes, setMealTypes] = useState<MealType[]>([])
	const [selectedMealTypeId, setSelectedMealTypeId] = useState<string>('')
	const [isMealTypesLoading, setIsMealTypesLoading] = useState(false)
	const [portions, setPortions] = useState(1)
	const [note, setNote] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Инициализация значений из события
	useEffect(() => {
		if (isOpen && event) {
			const eventDate = new Date(event.startAt)
			setSelectedHour(eventDate.getHours())
			setSelectedMinutes(eventDate.getMinutes())
			setSelectedMealTypeId(event.mealType?.id || '')
			setPortions(event.portions)
			setNote(event.note || '')
		}
	}, [isOpen, event])

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

	const formattedDate = useMemo(() => {
		if (!event) return ''
		return new Date(event.startAt).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}, [event])

	const handleHourChange = useCallback((value: string) => {
		setSelectedHour(Number(value))
	}, [])

	const handleMinutesChange = useCallback((value: string) => {
		setSelectedMinutes(Number(value))
	}, [])

	const handleMealTypeChange = useCallback((value: string) => {
		setSelectedMealTypeId(value)
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

	const mealTypeOptions = useMemo(
		() => [
			{ value: '', label: 'Не выбрано' },
			...mealTypes.map(mt => ({ value: mt.id, label: mt.name })),
		],
		[mealTypes]
	)

	const handleSubmit = useCallback(async () => {
		if (!event) return

		setIsSubmitting(true)
		try {
			// Формируем новую дату-время
			const originalDate = new Date(event.startAt)
			const startAt = new Date(originalDate)
			startAt.setHours(selectedHour, selectedMinutes, 0, 0)

			await updateMealEvent(event.id, {
				startAt: startAt.toISOString(),
				portions,
				mealTypeId: selectedMealTypeId || null,
				note: note.trim() || null,
				timezone: getUserTimezone(),
			})

			showToast('Событие обновлено', 'success')
			onClose()
			onUpdated?.()
		} catch (error) {
			console.error('Не удалось обновить событие:', error)
			showToast('Не удалось сохранить изменения', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}, [
		event,
		selectedHour,
		selectedMinutes,
		portions,
		selectedMealTypeId,
		note,
		onClose,
		onUpdated,
		showToast,
	])

	if (!event) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Редактировать запись'
			maxWidth='lg'
		>
			<div className='space-y-6'>
				{/* Блюдо (только отображение) */}
				<div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						Блюдо
					</span>
					<div className='flex items-center gap-3 mt-2'>
						{event.dish.photos && event.dish.photos.length > 0 ? (
							<img
								src={event.dish.photos[0]}
								alt={event.dish.name}
								className='w-12 h-12 rounded-lg object-cover'
							/>
						) : (
							<div className='w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600' />
						)}
						<p className='font-medium text-gray-900 dark:text-white'>
							{event.dish.name}
						</p>
					</div>
				</div>

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
							<Select
								options={HOURS_OPTIONS}
								value={String(selectedHour)}
								onChange={handleHourChange}
								className='w-20'
							/>
							<span className='text-gray-500'>:</span>
							<Select
								options={MINUTES_OPTIONS}
								value={String(Math.floor(selectedMinutes / 5) * 5)}
								onChange={handleMinutesChange}
								className='w-20'
							/>
						</div>
					</div>
				</div>

				{/* Порции */}
				<div>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						Количество порций
					</span>
					<div className='flex items-center gap-3 mt-2'>
						<button
							onClick={() => handlePortionsChange(-0.5)}
							disabled={portions <= 0.5}
							className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						>
							<Minus className='w-4 h-4' />
						</button>
						<span className='w-12 text-center font-medium text-gray-900 dark:text-white'>
							{portions}
						</span>
						<button
							onClick={() => handlePortionsChange(0.5)}
							className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
						>
							<Plus className='w-4 h-4' />
						</button>
					</div>
				</div>

				{/* Тип приема пищи */}
				<div>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						Тип приема пищи
					</span>
					<div className='mt-2'>
						<Select
							options={mealTypeOptions}
							value={selectedMealTypeId}
							onChange={handleMealTypeChange}
							disabled={isMealTypesLoading}
							placeholder={isMealTypesLoading ? 'Загрузка...' : 'Выберите тип'}
						/>
					</div>
				</div>

				{/* Комментарий */}
				<div>
					<span className='text-sm text-gray-500 dark:text-gray-400'>
						Комментарий
					</span>
					<div className='mt-2'>
						<Textarea
							value={note}
							onChange={handleNoteChange}
							placeholder='Добавьте заметку...'
							rows={2}
						/>
					</div>
				</div>

				{/* Кнопки */}
				<div className='flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
					<button
						onClick={onClose}
						className='px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
					>
						Отмена
					</button>
					<button
						onClick={handleSubmit}
						disabled={isSubmitting}
						className='px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors'
					>
						{isSubmitting ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</div>
		</Modal>
	)
})
