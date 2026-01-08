import { differenceInDays, format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	Activity,
	AlertCircle,
	Calendar,
	ChevronRight,
	Flame,
	Loader2,
	Plus,
	RefreshCw,
	Target,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
	getGoalHistory,
	getGoalProgress,
	getRecalculateRecommendation,
	updateGoal,
	type ApiError,
	type Goal,
	type GoalProgress,
	type RecalculateRecommendation,
} from '../../../../../api'
import {
	CollapsibleSection,
	Modal,
	ProgressBar,
} from '../../../../../components'
import { AddGoalModal } from '../components/index.ts'

export const GoalsWidget = () => {
	const [goals, setGoals] = useState<Goal[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Прогресс для активной цели
	const [progressError, setProgressError] = useState('')

	// Модальное окно пересчета
	const [recalculateModalOpen, setRecalculateModalOpen] = useState(false)
	const [recalculateData, setRecalculateData] =
		useState<RecalculateRecommendation | null>(null)
	const [isRecalculating, setIsRecalculating] = useState(false)
	const [isApplying, setIsApplying] = useState(false)

	// Модальное окно прогресса для конкретной цели
	const [progressModalOpen, setProgressModalOpen] = useState(false)
	const [currentProgress, setCurrentProgress] = useState<GoalProgress | null>(
		null
	)
	const [isLoadingModalProgress] = useState(false)

	// Прогресс для каждой цели (для отображения в карточках)
	const [goalsProgress, setGoalsProgress] = useState<Map<string, GoalProgress>>(
		new Map()
	)

	useEffect(() => {
		loadGoals()
	}, [])

	useEffect(() => {
		// Загружаем прогресс для всех IN_PROGRESS целей
		const inProgressGoals = goals.filter(g => g.status === 'IN_PROGRESS')
		inProgressGoals.forEach(goal => {
			loadGoalProgress(goal.id)
		})
	}, [goals])

	const loadGoals = async () => {
		setIsLoading(true)
		setError('')

		try {
			const data = await getGoalHistory()
			// Берем только последнюю неархивную цель
			const nonArchivedGoals = data.filter(goal => !goal.isArchived)
			setGoals(nonArchivedGoals.slice(0, 1))
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

	const handleGoalCreated = () => {
		loadGoals()
	}

	const loadGoalProgress = async (goalId: string) => {
		try {
			const progress = await getGoalProgress(goalId)
			setGoalsProgress(prev => new Map(prev).set(goalId, progress))
		} catch (err: any) {
			// Игнорируем ошибки для индивидуальных целей
			console.error('Error loading progress for goal:', goalId, err)
		}
	}

	const handleRecalculateClick = async (goalId: string) => {
		setIsRecalculating(true)
		setProgressError('')

		try {
			const recommendation = await getRecalculateRecommendation(goalId)
			setRecalculateData(recommendation)
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
			// Перезагружаем цели и прогресс
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

	// Не используется, закомментировано
	// const handleShowProgress = async (goal: Goal) => {
	// 	setProgressModalOpen(true)
	// 	setCurrentProgress(null)
	// 	setIsLoadingModalProgress(true)

	// 	try {
	// 		const progress = await getGoalProgress(goal.id)
	// 		setCurrentProgress(progress)
	// 	} catch (err: any) {
	// 		const apiError = err.response?.data as ApiError
	// 		setProgressError(apiError?.message || 'Ошибка при загрузке прогресса')
	// 	} finally {
	// 		setIsLoadingModalProgress(false)
	// 	}
	// }

	const handleRecalculateFromProgress = async () => {
		if (!currentProgress) return

		setIsRecalculating(true)

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
				className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
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

	return (
		<>
			<CollapsibleSection
				title='Моя цель'
				description='Отслеживайте свой прогресс'
				icon={Target}
				iconColor='text-purple-600 dark:text-purple-400'
				iconBgColor='bg-purple-100 dark:bg-purple-900/30'
			>
				{/* Add Goal Button */}
				{goals.length === 0 && !isLoading && (
					<div className='mb-4'>
						<button
							onClick={() => setIsModalOpen(true)}
							className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 cursor-pointer'
						>
							<Plus className='h-5 w-5' />
							<span>Создать новую цель</span>
						</button>
					</div>
				)}

				{/* Loading State */}
				{isLoading && (
					<div className='flex items-center justify-center py-8'>
						<div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
							<Loader2 className='h-6 w-6 animate-spin' />
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

				{/* Progress Error */}
				{progressError && (
					<div className='mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20'>
						<p className='text-sm text-red-800 dark:text-red-200'>
							{progressError}
						</p>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && goals.length === 0 && (
					<div className='rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800'>
						<Target className='mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600' />
						<h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
							У вас пока нет целей
						</h3>
						<p className='text-sm text-gray-600 dark:text-gray-400'>
							Установите свою первую цель по весу или калориям
						</p>
					</div>
				)}

				{/* Goals List */}
				{!isLoading && !error && goals.length > 0 && (
					<div className='space-y-3'>
						{goals.map(goal => {
							const daysRemaining = calculateDaysRemaining(goal.endDate)

							return (
								<div
									key={goal.id}
									className='rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700/50'
								>
									{/* Header */}
									<div className='mb-3 flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											{getStatusBadge(goal.status)}
											{goal.isActive && (
												<span className='rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'>
													Активная
												</span>
											)}
										</div>
										{goal.status === 'IN_PROGRESS' && daysRemaining >= 0 && (
											<div className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400'>
												<Calendar className='h-3.5 w-3.5' />
												<span>
													{daysRemaining === 0
														? 'Последний день'
														: `${daysRemaining} ${
																daysRemaining === 1
																	? 'день'
																	: daysRemaining < 5
																	? 'дня'
																	: 'дней'
														  }`}
												</span>
											</div>
										)}
									</div>

									{/* Goals Info */}
									<div className='space-y-2'>
										{goal.targetWeight && (
											<div className='flex items-center gap-2 text-sm'>
												<TrendingDown className='h-4 w-4 text-green-600 dark:text-green-400' />
												<span className='text-gray-900 dark:text-white'>
													Целевой вес:
												</span>
												<span className='font-bold text-gray-900 dark:text-white'>
													{goal.targetWeight} кг
												</span>
											</div>
										)}
										{goal.targetCalories && (
											<div className='flex items-center gap-2 text-sm'>
												<Flame className='h-4 w-4 text-orange-600 dark:text-orange-400' />
												<span className='text-gray-900 dark:text-white'>
													Калории в день:
												</span>
												<span className='font-bold text-gray-900 dark:text-white'>
													{goal.targetCalories} ккал
												</span>
											</div>
										)}
									</div>

									{/* Progress Section for IN_PROGRESS goals */}
									{goal.status === 'IN_PROGRESS' &&
										goalsProgress.has(goal.id) && (
											<div className='mt-3 space-y-3 border-t border-gray-200 pt-3 dark:border-gray-700'>
												{(() => {
													const progress = goalsProgress.get(goal.id)!
													return (
														<>
															{/* Progress Bar */}
															<ProgressBar
																value={progress.progressPercent}
																label='Прогресс по весу'
																color={progress.onTrack ? 'green' : 'orange'}
																height='sm'
															/>

															{/* Compact Stats */}
															<div className='grid grid-cols-2 gap-2 text-xs'>
																<div
																	className={`rounded-lg p-2 ${
																		progress.weightChanged >= 0
																			? 'bg-green-50 dark:bg-green-900/20'
																			: 'bg-red-50 dark:bg-red-900/20'
																	}`}
																>
																	<p className='text-gray-600 dark:text-gray-400'>
																		Изменено
																	</p>
																	<p
																		className={`font-bold ${
																			progress.weightChanged >= 0
																				? 'text-green-700 dark:text-green-400'
																				: 'text-red-700 dark:text-red-400'
																		}`}
																	>
																		{progress.weightChanged.toFixed(1)} кг
																	</p>
																</div>
																<div className='rounded-lg bg-orange-50 dark:bg-orange-900/20 p-2'>
																	<p className='text-gray-600 dark:text-gray-400'>
																		Осталось
																	</p>
																	<p className='font-bold text-orange-700 dark:text-orange-400'>
																		{progress.weightRemaining.toFixed(1)} кг
																	</p>
																</div>
																<div className='rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2'>
																	<p className='text-gray-600 dark:text-gray-400'>
																		Прошло дней
																	</p>
																	<p className='font-bold text-blue-700 dark:text-blue-400'>
																		{progress.daysPassed} / {progress.daysTotal}
																	</p>
																</div>
																<div className='rounded-lg bg-purple-50 dark:bg-purple-900/20 p-2'>
																	<p className='text-gray-600 dark:text-gray-400'>
																		Осталось дней
																	</p>
																	<p className='font-bold text-purple-700 dark:text-purple-400'>
																		{progress.daysRemaining}
																	</p>
																</div>
															</div>

															{/* Mini Recommendation */}
															<div
																className={`flex items-start gap-2 rounded-lg p-2 ${
																	progress.onTrack
																		? 'bg-green-50 dark:bg-green-900/20'
																		: 'bg-orange-50 dark:bg-orange-900/20'
																}`}
															>
																{progress.onTrack ? (
																	<TrendingUp className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
																) : (
																	<AlertCircle className='h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400' />
																)}
																<p
																	className={`text-xs ${
																		progress.onTrack
																			? 'text-green-800 dark:text-green-300'
																			: 'text-orange-800 dark:text-orange-300'
																	}`}
																>
																	{progress.recommendation}
																</p>
															</div>

															{/* Recalculate Button */}
															<button
																onClick={() => handleRecalculateClick(goal.id)}
																disabled={isRecalculating}
																className='flex w-full items-center justify-center gap-2 rounded-lg border border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 text-xs font-medium text-purple-700 dark:text-purple-400 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed'
															>
																{isRecalculating ? (
																	<>
																		<Loader2 className='h-3.5 w-3.5 animate-spin' />
																		<span>Расчет...</span>
																	</>
																) : (
																	<>
																		<RefreshCw className='h-3.5 w-3.5' />
																		<span>Пересчитать калории</span>
																	</>
																)}
															</button>
														</>
													)
												})()}
											</div>
										)}

									{/* Period */}
									<div className='mt-3 border-t border-gray-200 pt-3 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400'>
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
								</div>
							)
						})}

						{/* Link to Full History */}
						<Link
							to='/app/goals'
							className='flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:border-gray-600 dark:text-purple-400 dark:hover:bg-purple-900/20'
						>
							<span>Смотреть все цели</span>
							<ChevronRight className='h-4 w-4' />
						</Link>
					</div>
				)}
			</CollapsibleSection>

			{/* Add Goal Modal */}
			<AddGoalModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onGoalCreated={handleGoalCreated}
			/>

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
									{recalculateData.currentCalories || 'Не установлены'} ккал
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
						<p className='text-gray-700 dark:text-gray-300'>
							{recalculateData.message}
						</p>

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
										<span>Применить</span>
									)}
								</button>
							)}
						</div>
					</div>
				)}
			</Modal>

			{/* Progress Modal */}
			<Modal
				isOpen={progressModalOpen}
				onClose={() => {
					if (!isLoadingModalProgress && !isRecalculating) {
						setProgressModalOpen(false)
						setCurrentProgress(null)
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

					{isLoadingModalProgress ? (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='h-8 w-8 animate-spin text-purple-600 dark:text-purple-400' />
						</div>
					) : progressError && !currentProgress ? (
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
		</>
	)
}
