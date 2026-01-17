import {
	Calendar,
	Check,
	Clock,
	Edit,
	Flame,
	MessageSquare,
	SkipForward,
	Trash2,
	Utensils,
} from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
	deleteMealEvent,
	getMealEvent,
	updateMealEventStatus,
} from '../../../../../api/services/meal-events.ts'
import type {
	MealEventDetailed,
	MealEventWithDetails,
} from '../../../../../api/types/meal-events.ts'
import { ConfirmModal, Modal } from '../../../../../components/index.ts'
import { useToast } from '../../../../../components/toast/index.ts'
import { EditEventModal } from '../../edit-event-modal/index.ts'

interface EventDetailModalProps {
	isOpen: boolean
	onClose: () => void
	event: MealEventWithDetails | null
	onUpdated?: () => void
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	PLANNED: {
		label: 'Запланировано',
		color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
	},
	COMPLETED: {
		label: 'Выполнено',
		color:
			'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
	},
	SKIPPED: {
		label: 'Пропущено',
		color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
	},
}

export const EventDetailModal = memo(function EventDetailModal({
	isOpen,
	onClose,
	event,
	onUpdated,
}: EventDetailModalProps) {
	const { showToast } = useToast()
	const [detailedEvent, setDetailedEvent] = useState<MealEventDetailed | null>(
		null
	)
	const [isLoading, setIsLoading] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)

	// Загрузка детальных данных при открытии
	const loadDetails = useCallback(async () => {
		if (!event) return
		setIsLoading(true)
		try {
			const data = await getMealEvent(event.id)
			setDetailedEvent(data)
		} catch (error) {
			console.error('Ошибка загрузки деталей события:', error)
		} finally {
			setIsLoading(false)
		}
	}, [event])

	useEffect(() => {
		if (isOpen && event) {
			loadDetails()
		} else {
			setDetailedEvent(null)
		}
	}, [isOpen, event, loadDetails])

	// Изменение статуса на COMPLETED
	const handleMarkCompleted = useCallback(async () => {
		if (!event) return
		setIsUpdating(true)
		try {
			await updateMealEventStatus(event.id, { status: 'COMPLETED' })
			showToast('Приём пищи отмечен как выполненный', 'success')
			onUpdated?.()
			onClose()
		} catch (error) {
			console.error('Ошибка при изменении статуса:', error)
			showToast('Не удалось изменить статус', 'error')
		} finally {
			setIsUpdating(false)
		}
	}, [event, onUpdated, onClose, showToast])

	// Изменение статуса на SKIPPED
	const handleMarkSkipped = useCallback(async () => {
		if (!event) return
		setIsUpdating(true)
		try {
			await updateMealEventStatus(event.id, { status: 'SKIPPED' })
			showToast('Приём пищи пропущен', 'success')
			onUpdated?.()
			onClose()
		} catch (error) {
			console.error('Ошибка при изменении статуса:', error)
			showToast('Не удалось изменить статус', 'error')
		} finally {
			setIsUpdating(false)
		}
	}, [event, onUpdated, onClose, showToast])

	// Удаление события
	const handleDelete = useCallback(async () => {
		if (!event) return
		setIsUpdating(true)
		try {
			await deleteMealEvent(event.id)
			showToast('Приём пищи удалён', 'success')
			onUpdated?.()
			onClose()
		} catch (error) {
			console.error('Ошибка при удалении:', error)
			showToast('Не удалось удалить', 'error')
		} finally {
			setIsUpdating(false)
			setIsDeleteConfirmOpen(false)
		}
	}, [event, onUpdated, onClose, showToast])

	// Открытие модалки редактирования
	const handleOpenEdit = useCallback(() => {
		setIsEditModalOpen(true)
	}, [])

	const handleCloseEdit = useCallback(() => {
		setIsEditModalOpen(false)
	}, [])

	const handleEditUpdated = useCallback(() => {
		loadDetails()
		onUpdated?.()
	}, [loadDetails, onUpdated])

	const formattedDate = useMemo(() => {
		if (!event) return ''
		return new Date(event.startAt).toLocaleDateString('ru-RU', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}, [event])

	const formattedTime = useMemo(() => {
		if (!event) return ''
		return new Date(event.startAt).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}, [event])

	const statusInfo = event ? STATUS_LABELS[event.status] : null

	if (!event) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Детали приема пищи'
			maxWidth='lg'
		>
			<div className='space-y-6'>
				{/* Статус */}
				{statusInfo && (
					<div className='flex justify-center'>
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
						>
							{statusInfo.label}
						</span>
					</div>
				)}

				{/* Блюдо */}
				<div className='flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
					{/* Фото блюда */}
					{event.dish.photos && event.dish.photos.length > 0 ? (
						<img
							src={event.dish.photos[0]}
							alt={event.dish.name}
							className='w-20 h-20 rounded-lg object-cover shrink-0'
						/>
					) : (
						<div className='w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center shrink-0'>
							<Utensils className='w-8 h-8 text-gray-400 dark:text-gray-500' />
						</div>
					)}

					<div className='flex-1 min-w-0'>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
							{event.dish.name}
						</h3>
						<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
							{event.portions}{' '}
							{event.portions === 1
								? 'порция'
								: event.portions < 5
								? 'порции'
								: 'порций'}
						</p>
					</div>
				</div>

				{/* Информация */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					{/* Дата */}
					<div className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
						<div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30'>
							<Calendar className='w-5 h-5 text-blue-600 dark:text-blue-400' />
						</div>
						<div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>Дата</p>
							<p className='text-sm font-medium text-gray-900 dark:text-white'>
								{formattedDate}
							</p>
						</div>
					</div>

					{/* Время */}
					<div className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
						<div className='p-2 rounded-lg bg-green-100 dark:bg-green-900/30'>
							<Clock className='w-5 h-5 text-green-600 dark:text-green-400' />
						</div>
						<div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>Время</p>
							<p className='text-sm font-medium text-gray-900 dark:text-white'>
								{formattedTime}
							</p>
						</div>
					</div>
				</div>

				{/* Тип приема пищи */}
				{event.mealType && (
					<div className='flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
						<div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30'>
							<Utensils className='w-5 h-5 text-orange-600 dark:text-orange-400' />
						</div>
						<div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Тип приема пищи
							</p>
							<p className='text-sm font-medium text-gray-900 dark:text-white'>
								{event.mealType.name}
							</p>
						</div>
					</div>
				)}

				{/* КБЖУ */}
				{isLoading ? (
					<div className='flex justify-center py-4'>
						<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
					</div>
				) : detailedEvent?.computed?.total ? (
					<div className='p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800/50'>
						<div className='flex items-center gap-2 mb-3'>
							<Flame className='w-5 h-5 text-orange-500' />
							<span className='font-medium text-gray-900 dark:text-white'>
								Пищевая ценность
							</span>
						</div>
						<div className='grid grid-cols-4 gap-3'>
							<div className='text-center'>
								<p className='text-xl font-bold text-orange-600 dark:text-orange-400'>
									{Math.round(detailedEvent.computed.total.calories)}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>ккал</p>
							</div>
							<div className='text-center'>
								<p className='text-xl font-bold text-red-600 dark:text-red-400'>
									{detailedEvent.computed.total.protein.toFixed(1)}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									белки
								</p>
							</div>
							<div className='text-center'>
								<p className='text-xl font-bold text-yellow-600 dark:text-yellow-400'>
									{detailedEvent.computed.total.fat.toFixed(1)}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>жиры</p>
							</div>
							<div className='text-center'>
								<p className='text-xl font-bold text-green-600 dark:text-green-400'>
									{detailedEvent.computed.total.carbs.toFixed(1)}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									углев.
								</p>
							</div>
						</div>
					</div>
				) : null}

				{/* Комментарий */}
				{event.note && (
					<div className='flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
						<div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30'>
							<MessageSquare className='w-5 h-5 text-purple-600 dark:text-purple-400' />
						</div>
						<div>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Комментарий
							</p>
							<p className='text-sm text-gray-900 dark:text-white'>
								{event.note}
							</p>
						</div>
					</div>
				)}

				{/* Кнопки действий */}
				<div className='flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
					{/* Кнопки изменения статуса - только для PLANNED */}
					{event.status === 'PLANNED' && (
						<div className='flex gap-2'>
							<button
								onClick={handleMarkCompleted}
								disabled={isUpdating}
								className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors'
							>
								<Check className='w-4 h-4' />
								<span>Выполнено</span>
							</button>
							<button
								onClick={handleMarkSkipped}
								disabled={isUpdating}
								className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors'
							>
								<SkipForward className='w-4 h-4' />
								<span>Пропустить</span>
							</button>
						</div>
					)}

					{/* Нижняя строка кнопок */}
					<div className='flex justify-between'>
						<div className='flex gap-2'>
							<button
								onClick={() => setIsDeleteConfirmOpen(true)}
								disabled={isUpdating}
								className='flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 rounded-lg transition-colors'
							>
								<Trash2 className='w-4 h-4' />
								<span>Удалить</span>
							</button>
							<button
								onClick={handleOpenEdit}
								disabled={isUpdating}
								className='flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 rounded-lg transition-colors'
							>
								<Edit className='w-4 h-4' />
								<span>Редактировать</span>
							</button>
						</div>
						<button
							onClick={onClose}
							className='px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
						>
							Закрыть
						</button>
					</div>
				</div>
			</div>

			{/* Подтверждение удаления */}
			<ConfirmModal
				isOpen={isDeleteConfirmOpen}
				onClose={() => setIsDeleteConfirmOpen(false)}
				onConfirm={handleDelete}
				title='Удалить приём пищи?'
				message={`Вы уверены, что хотите удалить "${event.dish.name}"? Это действие нельзя отменить.`}
				confirmText='Удалить'
				cancelText='Отмена'
				variant='danger'
			/>

			{/* Модалка редактирования */}
			<EditEventModal
				isOpen={isEditModalOpen}
				onClose={handleCloseEdit}
				event={event}
				onUpdated={handleEditUpdated}
			/>
		</Modal>
	)
})
