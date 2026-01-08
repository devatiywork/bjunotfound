import { differenceInDays, format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	Activity,
	AlertCircle,
	Archive,
	ArchiveRestore,
	Calendar,
	CheckCircle,
	Clock,
	Flame,
	Loader2,
	Plus,
	RefreshCw,
	Target,
	TrendingDown,
	TrendingUp,
	XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	archiveGoal,
	getArchivedGoals,
	getGoalHistory,
	getGoalProgress,
	getRecalculateRecommendation,
	restoreGoal,
	updateGoal,
	type ApiError,
	type Goal,
	type GoalProgress,
	type RecalculateRecommendation,
} from '../../../api'
import { Header, Modal, ProgressBar } from '../../../components/index.ts'
import { AddGoalModal } from '../../home/components/goals-widget/components/index.ts'

export const GoalsPage = () => {
	const [goals, setGoals] = useState<Goal[]>([])
	const [archivedGoals, setArchivedGoals] = useState<Goal[]>([])
	const [showArchived, setShowArchived] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Модальные окна архивирования
	const [archiveModalOpen, setArchiveModalOpen] = useState(false)
	const [restoreModalOpen, setRestoreModalOpen] = useState(false)
	const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)

	// Прогресс цели
	const [progressModalOpen, setProgressModalOpen] = useState(false)
	const [currentProgress, setCurrentProgress] = useState<GoalProgress | null>(
		null
	)
	const [isLoadingProgress, setIsLoadingProgress] = useState(false)
	const [progressError, setProgressError] = useState('')

	// Пересчет калорий
	const [recalculateModalOpen, setRecalculateModalOpen] = useState(false)
	const [recalculateData, setRecalculateData] =
		useState<RecalculateRecommendation | null>(null)
	const [isRecalculating, setIsRecalculating] = useState(false)
	const [isApplying, setIsApplying] = useState(false)

	useEffect(() => {
		document.title = 'Цели | BjuNotFound'
	}, [])

	useEffect(() => {
		loadGoals()
		loadArchivedGoals()
	}, [])

	const loadGoals = async () => {
		setIsLoading(true)
		setError('')

		try {
			const data = await getGoalHistory()
			// Фильтруем только не архивированные цели
			setGoals(data.filter(g => !g.isArchived))
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message ||
					'Ошибка при загрузке целей. Попробуйте обновить страницу.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const loadArchivedGoals = async () => {
		try {
			const data = await getArchivedGoals()
			setArchivedGoals(data)
		} catch (err: any) {
			console.error('Ошибка загрузки архивных целей:', err)
		}
	}

	const handleGoalCreated = () => {
		loadGoals()
	}

	const getStatusIcon = (status: Goal['status']) => {
		const icons = {
			IN_PROGRESS: (
				<Clock className='h-5 w-5 text-blue-600 dark:text-blue-400' />
			),
			COMPLETED: (
				<CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
			),
			FAILED: <XCircle className='h-5 w-5 text-red-600 dark:text-red-400' />,
		}

		return icons[status]
	}

	const getStatusBadge = (status: Goal['status']) => {
		const badges = {
			IN_PROGRESS: {
				label: 'В процессе',
				className:
					'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
			},
			COMPLETED: {
				label: 'Достигнута',
				className:
					'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
			},
			FAILED: {
				label: 'Не достигнута',
				className:
					'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
			},
		}

		const badge = badges[status]

		return (
			<span
				className={`rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}
			>
				{badge.label}
			</span>
		)
	}

	const calculateDaysRemaining = (endDate: string) => {
		const end = parseISO(endDate)
		const today = new Date()
		return differenceInDays(end, today)
	}

	const calculateDuration = (startDate: string, endDate: string) => {
		const start = parseISO(startDate)
		const end = parseISO(endDate)
		return differenceInDays(end, start)
	}

	const handleArchiveClick = (goal: Goal) => {
		setSelectedGoal(goal)
		setArchiveModalOpen(true)
	}

	const handleRestoreClick = (goal: Goal) => {
		setSelectedGoal(goal)
		setRestoreModalOpen(true)
	}

	const handleArchiveConfirm = async () => {
		if (!selectedGoal) return

		try {
			setIsProcessing(true)
			await archiveGoal(selectedGoal.id)
			setArchiveModalOpen(false)
			setSelectedGoal(null)
			await loadGoals()
			await loadArchivedGoals()
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(apiError?.message || 'Ошибка при архивировании цели')
		} finally {
			setIsProcessing(false)
		}
	}

	const handleRestoreConfirm = async () => {
		if (!selectedGoal) return

		try {
			setIsProcessing(true)
			await restoreGoal(selectedGoal.id)
			setRestoreModalOpen(false)
			setSelectedGoal(null)
			await loadGoals()
			await loadArchivedGoals()
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(apiError?.message || 'Ошибка при восстановлении цели')
		} finally {
			setIsProcessing(false)
		}
	}

	const handleShowProgress = async (goal: Goal) => {
		setProgressModalOpen(true)
		setCurrentProgress(null)
		setProgressError('')
		setIsLoadingProgress(true)

		try {
			const progress = await getGoalProgress(goal.id)
			setCurrentProgress(progress)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setProgressError(apiError?.message || 'Ошибка при загрузке прогресса')
		} finally {
			setIsLoadingProgress(false)
		}
	}

	const handleRecalculateFromProgress = async () => {
		if (!currentProgress) return

		setIsRecalculating(true)
		setProgressError('')

		try {
			const recommendation = await getRecalculateRecommendation(
				currentProgress.goalId
			)
			setRecalculateData(recommendation)
			setProgressModalOpen(false)
			setRecalculateModalOpen(true)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setProgressError(apiError?.message || 'Ошибка при получении рекомендации')
		} finally {
			setIsRecalculating(false)
		}
	}

	const handleApplyRecommendation = async () => {
		if (!recalculateData) return

		setIsApplying(true)

		try {
			await updateGoal(recalculateData.goalId, {
				targetCalories: recalculateData.recommendedCalories,
			})
			setRecalculateModalOpen(false)
			setRecalculateData(null)
			// Перезагружаем цели
			await loadGoals()
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setProgressError(
				apiError?.message || 'Ошибка при применении рекомендации'
			)
		} finally {
			setIsApplying(false)
		}
	}

	return (
		<div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
			<Header />

			<main className='container mx-auto flex-1 px-4 py-8'>
				{/* Page Title */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
						Мои цели
					</h1>
					<p className='mt-2 text-gray-600 dark:text-gray-400'>
						Полная история ваших целей и достижений
					</p>
				</div>

				{/* Add Goal Button */}
				<div className='mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between'>
					<button
						onClick={() => setIsModalOpen(true)}
						className='w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 sm:px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 cursor-pointer'
					>
						<Plus className='h-5 w-5' />
						<span>Создать новую цель</span>
					</button>

					{archivedGoals.length > 0 && (
						<button
							onClick={() => setShowArchived(!showArchived)}
							className='w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
						>
							<Archive className='h-5 w-5' />
							<span>
								{showArchived
									? 'Скрыть архив'
									: `Архив (${archivedGoals.length})`}
							</span>
						</button>
					)}
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className='flex items-center justify-center py-12'>
						<div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
							<Loader2 className='h-8 w-8 animate-spin' />
							<span className='text-lg'>Загрузка целей...</span>
						</div>
					</div>
				)}

				{/* Error State */}
				{error && !isLoading && (
					<div className='rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
						<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && goals.length === 0 && !showArchived && (
					<div className='rounded-lg border border-gray-200 bg-white p-16 text-center dark:border-gray-600 dark:bg-gray-800'>
						<Target className='mx-auto mb-4 h-20 w-20 text-gray-300 dark:text-gray-600' />
						<h3 className='mb-2 text-xl font-medium text-gray-900 dark:text-white'>
							У вас пока нет целей
						</h3>
						<p className='mb-6 text-sm text-gray-600 dark:text-gray-400'>
							Установите свою первую цель по весу или калориям!
							<br />
							Это поможет отслеживать прогресс и оставаться мотивированным.
						</p>
						<button
							onClick={() => setIsModalOpen(true)}
							className='inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
						>
							<Plus className='h-5 w-5' />
							<span>Создать первую цель</span>
						</button>
					</div>
				)}

				{/* Goals List */}
				{!isLoading && !error && goals.length > 0 && (
					<div className='space-y-4'>
						{goals.map(goal => {
							const daysRemaining = calculateDaysRemaining(goal.endDate)
							const duration = calculateDuration(goal.startDate, goal.endDate)

							return (
								<div
									key={goal.id}
									className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-800'
								>
									{/* Header */}
									<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
										<div className='flex items-center gap-3'>
											{getStatusIcon(goal.status)}
											<div>
												<div className='flex items-center gap-2'>
													{getStatusBadge(goal.status)}
													{goal.isActive && (
														<span className='rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'>
															Активная
														</span>
													)}
												</div>
											</div>
										</div>

										<div className='flex items-center gap-3'>
											{goal.status === 'IN_PROGRESS' && (
												<>
													<div className='flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
														<Calendar className='h-4 w-4' />
														<span>
															{daysRemaining < 0
																? 'Просрочена'
																: daysRemaining === 0
																? 'Последний день'
																: `Осталось ${daysRemaining} ${
																		daysRemaining === 1
																			? 'день'
																			: daysRemaining < 5
																			? 'дня'
																			: 'дней'
																  }`}
														</span>
													</div>

													<button
														onClick={() => handleShowProgress(goal)}
														className='flex items-center gap-2 rounded-lg border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 sm:px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30'
														title='Показать прогресс'
													>
														<Activity className='h-4 w-4' />
														<span className='hidden sm:inline'>Прогресс</span>
													</button>
												</>
											)}

											<button
												onClick={() => handleArchiveClick(goal)}
												className='flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700'
												title='Архивировать цель'
											>
												<Archive className='h-4 w-4' />
												<span className='hidden sm:inline'>Архивировать</span>
											</button>
										</div>
									</div>

									{/* Goals Info */}
									<div className='mb-4 grid gap-4 sm:grid-cols-2'>
										{goal.targetWeight && (
											<div className='flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
												<div className='rounded-full bg-green-100 p-2 dark:bg-green-900/30'>
													<TrendingDown className='h-5 w-5 text-green-600 dark:text-green-400' />
												</div>
												<div>
													<p className='text-xs text-gray-600 dark:text-gray-400'>
														Целевой вес
													</p>
													<p className='text-xl font-bold text-gray-900 dark:text-white'>
														{goal.targetWeight} кг
													</p>
												</div>
											</div>
										)}

										{goal.targetCalories && (
											<div className='flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50'>
												<div className='rounded-full bg-orange-100 p-2 dark:bg-orange-900/30'>
													<Flame className='h-5 w-5 text-orange-600 dark:text-orange-400' />
												</div>
												<div>
													<p className='text-xs text-gray-600 dark:text-gray-400'>
														Калории в день
													</p>
													<p className='text-xl font-bold text-gray-900 dark:text-white'>
														{goal.targetCalories} ккал
													</p>
												</div>
											</div>
										)}
									</div>

									{/* Period and Duration */}
									<div className='flex flex-wrap items-center gap-4 border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400'>
										<div className='flex items-center gap-2'>
											<Calendar className='h-4 w-4' />
											<span>
												{format(parseISO(goal.startDate), 'd MMM yyyy', {
													locale: ru,
												})}{' '}
												—{' '}
												{format(parseISO(goal.endDate), 'd MMM yyyy', {
													locale: ru,
												})}
											</span>
										</div>
										<span className='text-gray-400 dark:text-gray-600'>•</span>
										<span>
											Длительность:{' '}
											{duration === 1
												? '1 день'
												: `${duration} ${duration < 5 ? 'дня' : 'дней'}`}
										</span>
									</div>
								</div>
							)
						})}
					</div>
				)}

				{/* Archived Goals Section */}
				{showArchived && archivedGoals.length > 0 && (
					<div className='mt-8'>
						<div className='mb-4 flex items-center gap-2'>
							<Archive className='h-5 w-5 text-gray-600 dark:text-gray-400' />
							<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
								Архив целей
							</h2>
						</div>

						<div className='space-y-4'>
							{archivedGoals.map(goal => {
								const duration = calculateDuration(goal.startDate, goal.endDate)

								return (
									<div
										key={goal.id}
										className='rounded-lg border border-gray-300 bg-gray-50 p-6 shadow-sm dark:border-gray-600 dark:bg-gray-800/50'
									>
										{/* Header */}
										<div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
											<div className='flex items-center gap-3'>
												{getStatusIcon(goal.status)}
												<div>
													<div className='flex items-center gap-2'>
														{getStatusBadge(goal.status)}
														<span className='rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
															Архивная
														</span>
													</div>
												</div>
											</div>

											<button
												onClick={() => handleRestoreClick(goal)}
												className='flex items-center gap-2 rounded-lg border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 sm:px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30'
												title='Восстановить цель'
											>
												<ArchiveRestore className='h-4 w-4' />
												<span className='hidden sm:inline'>Восстановить</span>
											</button>
										</div>

										{/* Goals Info */}
										<div className='mb-4 grid gap-4 sm:grid-cols-2'>
											{goal.targetWeight && (
												<div className='flex items-start gap-3 rounded-lg bg-white dark:bg-gray-700 p-4'>
													<div className='rounded-full bg-green-100 p-2 dark:bg-green-900/30'>
														<TrendingDown className='h-5 w-5 text-green-600 dark:text-green-400' />
													</div>
													<div>
														<p className='text-xs text-gray-600 dark:text-gray-400'>
															Целевой вес
														</p>
														<p className='text-xl font-bold text-gray-900 dark:text-white'>
															{goal.targetWeight} кг
														</p>
													</div>
												</div>
											)}

											{goal.targetCalories && (
												<div className='flex items-start gap-3 rounded-lg bg-white dark:bg-gray-700 p-4'>
													<div className='rounded-full bg-orange-100 p-2 dark:bg-orange-900/30'>
														<Flame className='h-5 w-5 text-orange-600 dark:text-orange-400' />
													</div>
													<div>
														<p className='text-xs text-gray-600 dark:text-gray-400'>
															Калории в день
														</p>
														<p className='text-xl font-bold text-gray-900 dark:text-white'>
															{goal.targetCalories} ккал
														</p>
													</div>
												</div>
											)}
										</div>

										{/* Period and Duration */}
										<div className='flex flex-wrap items-center gap-4 border-t border-gray-300 dark:border-gray-600 pt-4 text-sm text-gray-600 dark:text-gray-400'>
											<div className='flex items-center gap-2'>
												<Calendar className='h-4 w-4' />
												<span>
													{format(parseISO(goal.startDate), 'd MMM yyyy', {
														locale: ru,
													})}{' '}
													—{' '}
													{format(parseISO(goal.endDate), 'd MMM yyyy', {
														locale: ru,
													})}
												</span>
											</div>
											<span className='text-gray-400 dark:text-gray-600'>
												•
											</span>
											<span>
												Длительность:{' '}
												{duration === 1
													? '1 день'
													: `${duration} ${duration < 5 ? 'дня' : 'дней'}`}
											</span>
											{goal.deletedAt && (
												<>
													<span className='text-gray-400 dark:text-gray-600'>
														•
													</span>
													<span>
														Архивирована:{' '}
														{format(parseISO(goal.deletedAt), 'd MMM yyyy', {
															locale: ru,
														})}
													</span>
												</>
											)}
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</main>

			{/* Add Goal Modal */}
			<AddGoalModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onGoalCreated={handleGoalCreated}
			/>

			{/* Archive Confirmation Modal */}
			<Modal
				isOpen={archiveModalOpen}
				onClose={() => {
					if (!isProcessing) {
						setArchiveModalOpen(false)
						setSelectedGoal(null)
					}
				}}
				title='Архивировать цель'
			>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-orange-100 p-3 dark:bg-orange-900/30'>
							<Archive className='h-6 w-6 text-orange-600 dark:text-orange-400' />
						</div>
						<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
							Архивировать цель?
						</h2>
					</div>

					{selectedGoal && (
						<div className='rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2'>
							<div className='flex items-center gap-2'>
								{getStatusBadge(selectedGoal.status)}
								{selectedGoal.isActive && (
									<span className='rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'>
										Активная
									</span>
								)}
							</div>
							<div className='grid gap-2 text-sm'>
								{selectedGoal.targetWeight && (
									<p className='text-gray-700 dark:text-gray-300'>
										<span className='font-medium'>Целевой вес:</span>{' '}
										{selectedGoal.targetWeight} кг
									</p>
								)}
								{selectedGoal.targetCalories && (
									<p className='text-gray-700 dark:text-gray-300'>
										<span className='font-medium'>Калории:</span>{' '}
										{selectedGoal.targetCalories} ккал/день
									</p>
								)}
								<p className='text-gray-700 dark:text-gray-300'>
									<span className='font-medium'>Период:</span>{' '}
									{format(parseISO(selectedGoal.startDate), 'd MMM yyyy', {
										locale: ru,
									})}{' '}
									—{' '}
									{format(parseISO(selectedGoal.endDate), 'd MMM yyyy', {
										locale: ru,
									})}
								</p>
							</div>
						</div>
					)}

					<p className='text-gray-600 dark:text-gray-400'>
						Цель будет перенесена в архив и станет неактивной. Вы сможете
						восстановить её позже.
					</p>

					<div className='flex gap-3 pt-2'>
						<button
							onClick={() => {
								setArchiveModalOpen(false)
								setSelectedGoal(null)
							}}
							disabled={isProcessing}
							className='flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Отмена
						</button>
						<button
							onClick={handleArchiveConfirm}
							disabled={isProcessing}
							className='flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
						>
							{isProcessing ? (
								<>
									<Loader2 className='h-4 w-4 animate-spin' />
									<span>Архивация...</span>
								</>
							) : (
								<span>Архивировать</span>
							)}
						</button>
					</div>
				</div>
			</Modal>

			{/* Restore Confirmation Modal */}
			<Modal
				isOpen={restoreModalOpen}
				onClose={() => {
					if (!isProcessing) {
						setRestoreModalOpen(false)
						setSelectedGoal(null)
					}
				}}
				title='Восстановить цель'
			>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-purple-100 p-3 dark:bg-purple-900/30'>
							<ArchiveRestore className='h-6 w-6 text-purple-600 dark:text-purple-400' />
						</div>
						<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
							Восстановить цель?
						</h2>
					</div>

					{selectedGoal && (
						<div className='rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2'>
							<div className='flex items-center gap-2'>
								{getStatusBadge(selectedGoal.status)}
								<span className='rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
									Архивная
								</span>
							</div>
							<div className='grid gap-2 text-sm'>
								{selectedGoal.targetWeight && (
									<p className='text-gray-700 dark:text-gray-300'>
										<span className='font-medium'>Целевой вес:</span>{' '}
										{selectedGoal.targetWeight} кг
									</p>
								)}
								{selectedGoal.targetCalories && (
									<p className='text-gray-700 dark:text-gray-300'>
										<span className='font-medium'>Калории:</span>{' '}
										{selectedGoal.targetCalories} ккал/день
									</p>
								)}
								<p className='text-gray-700 dark:text-gray-300'>
									<span className='font-medium'>Период:</span>{' '}
									{format(parseISO(selectedGoal.startDate), 'd MMM yyyy', {
										locale: ru,
									})}{' '}
									—{' '}
									{format(parseISO(selectedGoal.endDate), 'd MMM yyyy', {
										locale: ru,
									})}
								</p>
							</div>
						</div>
					)}

					<p className='text-gray-600 dark:text-gray-400'>
						Цель будет восстановлена из архива и снова станет активной.
					</p>

					<div className='flex gap-3 pt-2'>
						<button
							onClick={() => {
								setRestoreModalOpen(false)
								setSelectedGoal(null)
							}}
							disabled={isProcessing}
							className='flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Отмена
						</button>
						<button
							onClick={handleRestoreConfirm}
							disabled={isProcessing}
							className='flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
						>
							{isProcessing ? (
								<>
									<Loader2 className='h-4 w-4 animate-spin' />
									<span>Восстановление...</span>
								</>
							) : (
								<span>Восстановить</span>
							)}
						</button>
					</div>
				</div>
			</Modal>

			{/* Progress Modal */}
			<Modal
				isOpen={progressModalOpen}
				onClose={() => {
					if (!isLoadingProgress && !isRecalculating) {
						setProgressModalOpen(false)
						setCurrentProgress(null)
						setProgressError('')
					}
				}}
				title='Прогресс цели'
			>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-purple-100 p-3 dark:bg-purple-900/30'>
							<Activity className='h-6 w-6 text-purple-600 dark:text-purple-400' />
						</div>
						<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
							Прогресс цели
						</h2>
					</div>

					{isLoadingProgress ? (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='h-8 w-8 animate-spin text-purple-600 dark:text-purple-400' />
						</div>
					) : progressError ? (
						<div className='rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
							<p className='text-sm text-red-800 dark:text-red-200'>
								{progressError}
							</p>
						</div>
					) : currentProgress ? (
						<>
							{/* Progress Bars */}
							<div className='space-y-4'>
								<ProgressBar
									value={currentProgress.progressPercent}
									label='Прогресс по весу'
									color={currentProgress.onTrack ? 'green' : 'orange'}
									height='lg'
								/>
								<ProgressBar
									value={currentProgress.timeProgressPercent}
									label='Прогресс по времени'
									color='blue'
									height='lg'
								/>
							</div>

							{/* Weight Stats */}
							<div className='rounded-lg bg-gray-50 dark:bg-gray-800 p-4'>
								<h3 className='mb-3 font-semibold text-gray-900 dark:text-white'>
									Статистика веса
								</h3>
								<div className='grid grid-cols-3 gap-4 text-sm'>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>
											Начальный
										</p>
										<p className='text-lg font-bold text-gray-900 dark:text-white'>
											{currentProgress.initialWeight} кг
										</p>
									</div>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>Текущий</p>
										<p className='text-lg font-bold text-gray-900 dark:text-white'>
											{currentProgress.currentWeight} кг
										</p>
									</div>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>Целевой</p>
										<p className='text-lg font-bold text-gray-900 dark:text-white'>
											{currentProgress.targetWeight} кг
										</p>
									</div>
								</div>
								<div className='mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm'>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>Изменено</p>
										<p
											className={`text-lg font-bold ${
												currentProgress.weightChanged >= 0
													? 'text-green-600 dark:text-green-400'
													: 'text-red-600 dark:text-red-400'
											}`}
										>
											{currentProgress.weightChanged.toFixed(1)} кг
										</p>
									</div>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>Осталось</p>
										<p className='text-lg font-bold text-orange-600 dark:text-orange-400'>
											{currentProgress.weightRemaining.toFixed(1)} кг
										</p>
									</div>
								</div>
							</div>
							{/* Time Stats */}
							<div className='rounded-lg bg-gray-50 dark:bg-gray-800 p-4'>
								<h3 className='mb-3 font-semibold text-gray-900 dark:text-white'>
									Прогресс по времени
								</h3>
								<div className='grid grid-cols-3 gap-4 text-sm'>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>
											Всего дней
										</p>
										<p className='text-lg font-bold text-gray-900 dark:text-white'>
											{currentProgress.daysTotal}
										</p>
									</div>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>Прошло</p>
										<p className='text-lg font-bold text-gray-900 dark:text-white'>
											{currentProgress.daysPassed}
										</p>
									</div>
									<div>
										<p className='text-gray-600 dark:text-gray-400'>Осталось</p>
										<p className='text-lg font-bold text-gray-900 dark:text-white'>
											{currentProgress.daysRemaining}
										</p>
									</div>
								</div>
							</div>

							{/* Recommendation */}
							<div
								className={`flex items-start gap-2 rounded-lg p-4 ${
									currentProgress.onTrack
										? 'bg-green-50 dark:bg-green-900/20'
										: 'bg-orange-50 dark:bg-orange-900/20'
								}`}
							>
								{currentProgress.onTrack ? (
									<TrendingUp className='h-6 w-6 shrink-0 text-green-600 dark:text-green-400' />
								) : (
									<AlertCircle className='h-6 w-6 shrink-0 text-orange-600 dark:text-orange-400' />
								)}
								<p
									className={`text-sm ${
										currentProgress.onTrack
											? 'text-green-800 dark:text-green-300'
											: 'text-orange-800 dark:text-orange-300'
									}`}
								>
									{currentProgress.recommendation}
								</p>
							</div>

							{/* Actions */}
							<div className='flex gap-3 pt-2'>
								<button
									onClick={() => {
										setProgressModalOpen(false)
										setCurrentProgress(null)
									}}
									disabled={isRecalculating}
									className='flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									Закрыть
								</button>
								<button
									onClick={handleRecalculateFromProgress}
									disabled={isRecalculating}
									className='flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
								>
									{isRecalculating ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin' />
											<span>Расчет...</span>
										</>
									) : (
										<>
											<RefreshCw className='h-4 w-4' />
											<span>Пересчитать калории</span>
										</>
									)}
								</button>
							</div>
						</>
					) : null}
				</div>
			</Modal>

			{/* Recalculate Modal */}
			<Modal
				isOpen={recalculateModalOpen}
				onClose={() => {
					if (!isApplying) {
						setRecalculateModalOpen(false)
						setRecalculateData(null)
					}
				}}
				title='Рекомендация по калориям'
			>
				{recalculateData && (
					<div className='space-y-4'>
						<div className='flex items-center gap-3'>
							<div className='rounded-full bg-purple-100 p-3 dark:bg-purple-900/30'>
								<RefreshCw className='h-6 w-6 text-purple-600 dark:text-purple-400' />
							</div>
							<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
								Рекомендация по калориям
							</h2>
						</div>

						{/* Current vs Recommended */}
						<div className='grid gap-4 sm:grid-cols-2'>
							<div className='rounded-lg bg-gray-50 dark:bg-gray-800 p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Текущие калории
								</p>
								<p className='mt-1 text-2xl font-bold text-gray-900 dark:text-white'>
									{recalculateData.currentCalories || 'Не установлены'}{' '}
									{recalculateData.currentCalories && 'ккал'}
								</p>
							</div>
							<div className='rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4'>
								<p className='text-sm text-purple-600 dark:text-purple-400'>
									Рекомендуемые калории
								</p>
								<p className='mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100'>
									{recalculateData.recommendedCalories} ккал
								</p>
							</div>
						</div>

						{/* Stats */}
						<div className='rounded-lg bg-gray-50 dark:bg-gray-800 p-4 space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>
									Текущий вес:
								</span>
								<span className='font-medium text-gray-900 dark:text-white'>
									{recalculateData.currentWeight} кг
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>
									Целевой вес:
								</span>
								<span className='font-medium text-gray-900 dark:text-white'>
									{recalculateData.targetWeight} кг
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>
									Осталось дней:
								</span>
								<span className='font-medium text-gray-900 dark:text-white'>
									{recalculateData.remainingDays}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600 dark:text-gray-400'>
									Реалистичность:
								</span>
								<span
									className={`font-medium ${
										recalculateData.isRealistic
											? 'text-green-600 dark:text-green-400'
											: 'text-orange-600 dark:text-orange-400'
									}`}
								>
									{recalculateData.isRealistic ? 'Да' : 'Нет'}
								</span>
							</div>
						</div>

						{/* Warning */}
						{recalculateData.warning && (
							<div className='flex items-start gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3'>
								<AlertCircle className='h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400' />
								<p className='text-sm text-orange-800 dark:text-orange-300'>
									{recalculateData.warning}
								</p>
							</div>
						)}

						{/* Message */}
						<div className='rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3'>
							<p className='text-sm text-blue-800 dark:text-blue-300'>
								{recalculateData.message}
							</p>
						</div>

						{/* Actions */}
						<div className='flex gap-3 pt-2'>
							<button
								onClick={() => {
									setRecalculateModalOpen(false)
									setRecalculateData(null)
								}}
								disabled={isApplying}
								className='flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								Отмена
							</button>
							{recalculateData.currentCalories !==
								recalculateData.recommendedCalories && (
								<button
									onClick={handleApplyRecommendation}
									disabled={isApplying}
									className='flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
								>
									{isApplying ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin' />
											<span>Применение...</span>
										</>
									) : (
										<span>Применить рекомендацию</span>
									)}
								</button>
							)}
						</div>
					</div>
				)}
			</Modal>
		</div>
	)
}
