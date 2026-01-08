import { useEffect, useState } from 'react'

import { Activity as ActivityIcon, Trash2, TrendingUp } from 'lucide-react'
import {
	addActivity,
	deleteActivity,
	getTodayActivity,
	type Activity,
	type ActivityLog,
	type ActivityType,
} from '../../../../../api'
import {
	CollapsibleSection,
	Modal,
	Select,
	useToast,
} from '../../../../../components'

const activityTypeLabels: Record<string, string> = {
	WALKING: 'Ходьба',
	FAST_WALKING: 'Быстрая ходьба',
	RUNNING: 'Бег',
	CUSTOM: 'Пользовательская',
}

const activityTypeOptions = [
	{ value: 'WALKING', label: 'Ходьба' },
	{ value: 'FAST_WALKING', label: 'Быстрая ходьба' },
	{ value: 'RUNNING', label: 'Бег' },
	{ value: 'CUSTOM', label: 'Пользовательская' },
]

export const ActivityWidget = () => {
	const { showToast } = useToast()
	const [activityData, setActivityData] = useState<ActivityLog | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [steps, setSteps] = useState('')
	const [activityType, setActivityType] = useState<ActivityType>('WALKING')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [activityToDelete, setActivityToDelete] = useState<string | null>(null)

	const loadTodayActivity = async () => {
		try {
			setIsLoading(true)
			const data = await getTodayActivity()
			setActivityData(data)
		} catch (error: any) {
			if (error.response?.status === 404) {
				// Нет записей веса - показываем пустое состояние
				setActivityData({
					id: null,
					date: new Date().toISOString().split('T')[0],
					steps: 0,
					burnedCalories: 0,
					consumedCalories: null,
					activities: [],
				})
			} else {
				showToast('Не удалось загрузить данные активности', 'error')
			}
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadTodayActivity()
	}, [])

	const handleAddActivity = async (e: React.FormEvent) => {
		e.preventDefault()

		const stepsNum = parseInt(steps)
		if (!stepsNum || stepsNum < 1 || stepsNum > 100000) {
			showToast('Введите количество шагов от 1 до 100000', 'error')
			return
		}

		try {
			setIsSubmitting(true)
			await addActivity({
				steps: stepsNum,
				activityType,
			})
			showToast('Активность добавлена', 'success')
			setSteps('')
			await loadTodayActivity()
		} catch (error: any) {
			if (error.response?.status === 404) {
				showToast('Добавьте вес в профиль для расчета калорий', 'error')
			} else {
				showToast(
					error.response?.data?.message || 'Не удалось добавить активность',
					'error'
				)
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteActivity = async (activityId: string) => {
		setActivityToDelete(activityId)
		setDeleteModalOpen(true)
	}

	const confirmDelete = async () => {
		if (!activityToDelete) return

		try {
			await deleteActivity(activityToDelete)
			showToast('Активность удалена', 'success')
			await loadTodayActivity()
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось удалить активность',
				'error'
			)
		} finally {
			setDeleteModalOpen(false)
			setActivityToDelete(null)
		}
	}

	const progressSteps = activityData?.goal?.progressSteps || 0
	const progressCalories = activityData?.goal?.progressCalories || 0

	if (isLoading) {
		return (
			<CollapsibleSection
				title='Активность'
				description='Трекинг шагов и калорий'
				icon={ActivityIcon}
			>
				<div className='text-center text-gray-500 dark:text-gray-400'>
					Загрузка...
				</div>
			</CollapsibleSection>
		)
	}

	return (
		<>
			<CollapsibleSection
				title='Активность'
				description='Трекинг шагов и калорий'
				icon={ActivityIcon}
			>
				{/* Форма добавления */}
				<form onSubmit={handleAddActivity} className='mb-6 space-y-3'>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
						<input
							type='number'
							min='1'
							max='100000'
							value={steps}
							onChange={e => setSteps(e.target.value)}
							placeholder='Количество шагов'
							className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500'
							disabled={isSubmitting}
						/>
						<Select
							options={activityTypeOptions}
							value={activityType}
							onChange={value => setActivityType(value as ActivityType)}
							disabled={isSubmitting}
						/>
					</div>
					<button
						type='submit'
						disabled={isSubmitting || !steps}
						className='w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-md transition-colors'
					>
						{isSubmitting ? 'Добавление...' : 'Добавить активность'}
					</button>
				</form>

				{/* Прогресс по целям */}
				{activityData?.goal && (
					<div className='mb-6 space-y-3'>
						<div>
							<div className='flex justify-between text-sm mb-1'>
								<span className='text-gray-600 dark:text-gray-400'>Шаги</span>
								<span className='text-gray-900 dark:text-white font-medium'>
									{activityData.steps} /{' '}
									{activityData.goal.targetSteps || 'не задано'}
								</span>
							</div>
							<div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
								<div
									className='bg-green-600 h-2 rounded-full transition-all'
									style={{ width: `${Math.min(progressSteps, 100)}%` }}
								/>
							</div>
						</div>

						<div>
							<div className='flex justify-between text-sm mb-1'>
								<span className='text-gray-600 dark:text-gray-400'>
									Сожжено калорий
								</span>
								<span className='text-gray-900 dark:text-white font-medium'>
									{activityData.burnedCalories.toFixed(0)} /{' '}
									{activityData.goal.targetBurnedCalories?.toFixed(0) ||
										'не задано'}
								</span>
							</div>
							<div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
								<div
									className='bg-orange-600 h-2 rounded-full transition-all'
									style={{ width: `${Math.min(progressCalories, 100)}%` }}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Список активностей за день */}
				<div className='space-y-2'>
					<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Записи за сегодня
					</h3>
					{activityData?.activities && activityData.activities.length > 0 ? (
						<div className='space-y-2 max-h-64 overflow-y-auto'>
							{activityData.activities.map((act: Activity) => (
								<div
									key={act.id}
									className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md'
								>
									<div className='flex-1'>
										<div className='flex items-center gap-2'>
											<TrendingUp className='w-4 h-4 text-green-600 dark:text-green-400' />
											<span className='text-sm font-medium text-gray-900 dark:text-white'>
												{activityTypeLabels[act.type]}
											</span>
										</div>
										<div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
											{act.steps} шагов • {act.burnedCalories.toFixed(0)} ккал
										</div>
										<div className='text-xs text-gray-500 dark:text-gray-500 mt-0.5'>
											{new Date(act.performedAt).toLocaleTimeString('ru-RU', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</div>
									</div>
									<button
										onClick={() => handleDeleteActivity(act.id)}
										className='p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors'
										title='Удалить'
									>
										<Trash2 className='w-4 h-4' />
									</button>
								</div>
							))}
						</div>
					) : (
						<div className='text-center text-gray-500 dark:text-gray-400 text-sm py-4'>
							Нет записей за сегодня
						</div>
					)}
				</div>

				{/* Итоговая статистика */}
				{activityData && activityData.steps > 0 && (
					<div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<div className='grid grid-cols-2 gap-4 text-center'>
							<div>
								<div className='text-2xl font-bold text-green-600 dark:text-green-400'>
									{activityData.steps}
								</div>
								<div className='text-xs text-gray-600 dark:text-gray-400'>
									всего шагов
								</div>
							</div>
							<div>
								<div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
									{activityData.burnedCalories.toFixed(0)}
								</div>
								<div className='text-xs text-gray-600 dark:text-gray-400'>
									ккал сожжено
								</div>
							</div>
						</div>
					</div>
				)}
			</CollapsibleSection>

			{/* Модальное окно подтверждения удаления */}
			<Modal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				title='Удалить активность'
			>
				<p className='text-gray-700 dark:text-gray-300 mb-6'>
					Вы уверены, что хотите удалить эту запись активности? Это действие
					нельзя отменить.
				</p>
				<div className='flex justify-end gap-3'>
					<button
						onClick={() => setDeleteModalOpen(false)}
						className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
					>
						Отмена
					</button>
					<button
						onClick={confirmDelete}
						className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors'
					>
						Удалить
					</button>
				</div>
			</Modal>
		</>
	)
}
