import {
	Activity,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Filter,
	Trash2,
	TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteActivity, getActivities } from '../../../api/services/index.ts'
import type { ActivityLog, ActivityType } from '../../../api/types/index.ts'
import { Header, useToast } from '../../../components/index.ts'

const activityTypeLabels: Record<ActivityType, string> = {
	WALKING: 'Ходьба',
	FAST_WALKING: 'Быстрая ходьба',
	RUNNING: 'Бег',
	CUSTOM: 'Пользовательская',
}

export const ActivityPage = () => {
	const { showToast } = useToast()
	const [activities, setActivities] = useState<ActivityLog[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [total, setTotal] = useState(0)
	const limit = 10

	// Фильтры
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [showFilters, setShowFilters] = useState(false)

	useEffect(() => {
		document.title = 'Активность | TimeNoFat'
	}, [])

	const loadActivities = async () => {
		try {
			setIsLoading(true)
			const data = await getActivities({
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				page,
				limit,
			})
			setActivities(data.activities)
			setTotalPages(data.pagination.totalPages)
			setTotal(data.pagination.total)
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось загрузить активность',
				'error'
			)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadActivities()
	}, [page, startDate, endDate])

	const handleDeleteActivity = async (activityId: string) => {
		if (!confirm('Удалить эту запись активности?')) return

		try {
			await deleteActivity(activityId)
			showToast('Активность удалена', 'success')
			await loadActivities()
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось удалить активность',
				'error'
			)
		}
	}

	const handleResetFilters = () => {
		setStartDate('')
		setEndDate('')
		setPage(1)
	}

	const handleApplyFilters = () => {
		setPage(1)
		loadActivities()
	}

	return (
		<div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
			<Header />

			<main className='container mx-auto flex-1 px-4 py-8'>
				<div className='max-w-6xl mx-auto'>
					{/* Заголовок */}
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<Activity className='w-8 h-8 text-green-600 dark:text-green-400' />
							<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
								История активности
							</h1>
						</div>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
						>
							<Filter className='w-4 h-4' />
							Фильтры
						</button>
					</div>

					{/* Панель фильтров */}
					{showFilters && (
						<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
							<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
								Фильтры
							</h3>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Начальная дата
									</label>
									<input
										type='date'
										value={startDate}
										onChange={e => setStartDate(e.target.value)}
										className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Конечная дата
									</label>
									<input
										type='date'
										value={endDate}
										onChange={e => setEndDate(e.target.value)}
										className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500'
									/>
								</div>
							</div>
							<div className='flex gap-3'>
								<button
									onClick={handleApplyFilters}
									className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors'
								>
									Применить
								</button>
								<button
									onClick={handleResetFilters}
									className='px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors'
								>
									Сбросить
								</button>
							</div>
						</div>
					)}

					{/* Счетчик записей */}
					{!isLoading && (
						<div className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
							Найдено записей: {total}
						</div>
					)}

					{/* Список активностей */}
					{isLoading ? (
						<div className='text-center text-gray-500 dark:text-gray-400 py-12'>
							Загрузка...
						</div>
					) : activities.length === 0 ? (
						<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center'>
							<Calendar className='w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4' />
							<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
								Нет записей активности
							</h3>
							<p className='text-gray-600 dark:text-gray-400'>
								Начните добавлять активность на главной странице
							</p>
						</div>
					) : (
						<div className='space-y-4'>
							{activities.map(log => (
								<div
									key={log.id}
									className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'
								>
									{/* Заголовок дня */}
									<div className='flex items-center justify-between mb-4'>
										<div className='flex items-center gap-3'>
											<Calendar className='w-5 h-5 text-green-600 dark:text-green-400' />
											<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
												{new Date(log.date).toLocaleDateString('ru-RU', {
													weekday: 'long',
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</h3>
										</div>
										<div className='flex gap-4 text-sm'>
											<div className='text-right'>
												<div className='font-bold text-green-600 dark:text-green-400'>
													{log.steps}
												</div>
												<div className='text-gray-600 dark:text-gray-400'>
													шагов
												</div>
											</div>
											<div className='text-right'>
												<div className='font-bold text-orange-600 dark:text-orange-400'>
													{log.burnedCalories.toFixed(0)}
												</div>
												<div className='text-gray-600 dark:text-gray-400'>
													ккал
												</div>
											</div>
										</div>
									</div>

									{/* Список детальных активностей */}
									<div className='space-y-2'>
										{log.activities.map(act => (
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
														{act.steps} шагов • {act.burnedCalories.toFixed(0)}{' '}
														ккал
													</div>
													<div className='text-xs text-gray-500 dark:text-gray-500 mt-0.5'>
														{new Date(act.performedAt).toLocaleString('ru-RU', {
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

									{/* Прогресс по целям */}
									{log.goal && (
										<div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
											<div className='grid grid-cols-2 gap-4'>
												<div>
													<div className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
														Прогресс по шагам
													</div>
													<div className='flex items-center gap-2'>
														<div className='flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
															<div
																className='bg-green-600 h-2 rounded-full transition-all'
																style={{
																	width: `${Math.min(
																		log.goal.progressSteps,
																		100
																	)}%`,
																}}
															/>
														</div>
														<span className='text-xs font-medium text-gray-900 dark:text-white'>
															{log.goal.progressSteps.toFixed(0)}%
														</span>
													</div>
												</div>
												<div>
													<div className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
														Прогресс по калориям
													</div>
													<div className='flex items-center gap-2'>
														<div className='flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
															<div
																className='bg-orange-600 h-2 rounded-full transition-all'
																style={{
																	width: `${Math.min(
																		log.goal.progressCalories,
																		100
																	)}%`,
																}}
															/>
														</div>
														<span className='text-xs font-medium text-gray-900 dark:text-white'>
															{log.goal.progressCalories.toFixed(0)}%
														</span>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}

					{/* Пагинация */}
					{!isLoading && totalPages > 1 && (
						<div className='flex items-center justify-center gap-2 mt-8'>
							<button
								onClick={() => setPage(p => Math.max(1, p - 1))}
								disabled={page === 1}
								className='p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
							>
								<ChevronLeft className='w-5 h-5' />
							</button>
							<span className='px-4 py-2 text-sm text-gray-700 dark:text-gray-300'>
								Страница {page} из {totalPages}
							</span>
							<button
								onClick={() => setPage(p => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className='p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
							>
								<ChevronRight className='w-5 h-5' />
							</button>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
