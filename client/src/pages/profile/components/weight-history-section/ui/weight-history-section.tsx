import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Loader2,
	Minus,
	Scale,
	Trash2,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	deleteWeight,
	getUserProfile,
	getWeightHistory,
	getWeightPeriod,
	type ApiError,
	type WeightEntry,
} from '../../../../../api'
import {
	CollapsibleSection,
	DatePicker,
	Modal,
} from '../../../../../components'
import { calculateBMI } from '../../../../../utils'

export const WeightHistorySection = () => {
	const [history, setHistory] = useState<WeightEntry[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	const [showAll, setShowAll] = useState(false)
	const [dateFrom, setDateFrom] = useState<Date | null>(null)
	const [dateTo, setDateTo] = useState<Date | null>(null)

	// Рост пользователя для расчета ИМТ
	const [userHeight, setUserHeight] = useState<number | null>(null)

	// Модальное окно удаления
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [entryToDelete, setEntryToDelete] = useState<WeightEntry | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	useEffect(() => {
		loadProfile()
		loadHistory()
	}, [dateFrom, dateTo])

	const loadProfile = async () => {
		try {
			const profile = await getUserProfile()
			setUserHeight(profile.height)
		} catch (err) {
			console.error('Ошибка при загрузке профиля:', err)
		}
	}

	const loadHistory = async () => {
		setIsLoading(true)
		setError('')

		try {
			// Если выбран период, используем API для фильтрации
			if (dateFrom || dateTo) {
				const start = dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '1900-01-01'
				const end = dateTo
					? format(dateTo, 'yyyy-MM-dd')
					: format(new Date(), 'yyyy-MM-dd')

				const periodData = await getWeightPeriod(start, end)
				setHistory(periodData.weights.slice(0, 50).reverse())
			} else {
				// Загружаем все записи (API возвращает последние 50)
				const data = await getWeightHistory()
				setHistory(data.slice(0, 50))
			}
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message ||
					'Ошибка при загрузке истории. Попробуйте обновить страницу.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	// Показываем только 3 записи или все
	const displayedHistory = showAll ? history : history.slice(0, 3)

	// Текущий вес (первая запись)
	const currentWeight = history.length > 0 ? history[0].weight : null

	const calculateDifference = (current: number, previous: number) => {
		return current - previous
	}

	const getDifferenceIcon = (diff: number) => {
		if (diff > 0)
			return <TrendingUp className='h-5 w-5 text-red-500 dark:text-red-400' />
		if (diff < 0)
			return (
				<TrendingDown className='h-5 w-5 text-green-500 dark:text-green-400' />
			)
		return <Minus className='h-5 w-5 text-gray-400' />
	}

	const getDifferenceColor = (diff: number) => {
		if (diff > 0) return 'text-red-600 dark:text-red-400'
		if (diff < 0) return 'text-green-600 dark:text-green-400'
		return 'text-gray-600 dark:text-gray-400'
	}

	const handleDeleteClick = (entry: WeightEntry) => {
		setEntryToDelete(entry)
		setDeleteModalOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!entryToDelete) return

		try {
			setIsDeleting(true)
			await deleteWeight(entryToDelete.id)
			setDeleteModalOpen(false)
			setEntryToDelete(null)
			// Перезагружаем историю
			await loadHistory()
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message || 'Ошибка при удалении записи. Попробуйте снова.'
			)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<CollapsibleSection
			title='История веса'
			description='Все записи о вашем весе'
			icon={Scale}
			iconColor='text-purple-600 dark:text-purple-400'
			iconBgColor='bg-purple-100 dark:bg-purple-900/30'
		>
			{/* Loading State */}
			{isLoading && (
				<div className='flex items-center justify-center rounded-lg bg-white p-12 shadow-md dark:bg-gray-800'>
					<div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
						<Loader2 className='h-6 w-6 animate-spin' />
						<span className='text-lg'>Загрузка истории...</span>
					</div>
				</div>
			)}

			{/* Error State */}
			{error && !isLoading && (
				<div className='rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
					<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
				</div>
			)}

			{/* Date Filter - всегда доступен */}
			{!isLoading && !error && (
				<div className='rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800'>
					<h3 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>
						Фильтр по периоду
					</h3>
					<div className='grid gap-4 sm:grid-cols-2'>
						<DatePicker
							label='С'
							selected={dateFrom}
							onChange={setDateFrom}
							maxDate={new Date()}
							placeholderText='Выберите дату начала'
						/>
						<DatePicker
							label='По'
							selected={dateTo}
							onChange={setDateTo}
							maxDate={new Date()}
							minDate={dateFrom || undefined}
							placeholderText='Выберите дату окончания'
						/>
					</div>
					{(dateFrom || dateTo) && (
						<button
							onClick={() => {
								setDateFrom(null)
								setDateTo(null)
							}}
							className='mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
						>
							Сбросить фильтр
						</button>
					)}
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !error && history.length === 0 && (
				<div className='rounded-lg border border-gray-200 bg-white p-12 text-center shadow-md dark:border-gray-600 dark:bg-gray-800'>
					<Scale className='mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600' />
					<h3 className='mb-2 text-lg font-medium text-gray-900 dark:text-white'>
						{dateFrom || dateTo
							? 'Нет записей за выбранный период'
							: 'История пуста'}
					</h3>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						{dateFrom || dateTo
							? 'Попробуйте выбрать другой период или сбросить фильтр'
							: 'Добавьте первую запись о весе на главной странице'}
					</p>
				</div>
			)}

			{/* Content */}
			{!isLoading && !error && history.length > 0 && (
				<div className='space-y-4'>
					{/* Current Weight Card */}
					{currentWeight !== null && (
						<div className='rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-gray-800 mt-3'>
							<p className='mb-1 text-xs font-medium text-gray-600 dark:text-gray-400'>
								Текущий вес
							</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-white'>
								{currentWeight.toFixed(1)} кг
							</p>
						</div>
					)}

					{/* History List */}
					<div className='rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800'>
						<div className='border-b border-gray-200 p-4 dark:border-gray-600'>
							<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
								Записи ({history.length})
							</h3>
						</div>

						<div className='divide-y divide-gray-200 dark:divide-gray-600'>
							{displayedHistory.map((entry, index) => {
								const previousEntry = displayedHistory[index + 1]
								const diff = previousEntry
									? calculateDifference(entry.weight, previousEntry.weight)
									: null

								// Рассчитываем ИМТ если есть рост
								const bmi = userHeight
									? calculateBMI(entry.weight, userHeight)
									: null

								return (
									<div
										key={entry.id}
										className='p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
									>
										<div className='flex items-start justify-between gap-3'>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-3 flex-wrap'>
													<span className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
														{entry.weight} кг
													</span>

													{diff !== null && (
														<div className='flex items-center gap-1.5'>
															{getDifferenceIcon(diff)}
															<span
																className={`text-sm font-medium ${getDifferenceColor(
																	diff
																)}`}
															>
																{diff > 0 ? '+' : ''}
																{diff.toFixed(1)} кг
															</span>
														</div>
													)}

													{index === 0 && (
														<span className='rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
															Последний
														</span>
													)}
												</div>

												<div className='mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
													<Calendar className='h-4 w-4' />
													<span>
														{format(parseISO(entry.date), 'd MMMM yyyy', {
															locale: ru,
														})}
													</span>
												</div>

												{bmi && (
													<p
														className={`text-sm font-medium mt-2 ${bmi.color} ${bmi.darkColor}`}
													>
														ИМТ: {bmi.value} — {bmi.categoryLabel}
													</p>
												)}
											</div>

											<button
												onClick={() => handleDeleteClick(entry)}
												className='p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors shrink-0'
												title='Удалить запись'
											>
												<Trash2 className='h-4 w-4 sm:h-5 sm:w-5' />
											</button>
										</div>
									</div>
								)
							})}
						</div>

						{/* Show More Button */}
						{history.length > 3 && (
							<div className='border-t border-gray-200 p-4 dark:border-gray-600'>
								<button
									onClick={() => setShowAll(!showAll)}
									className='flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
								>
									{showAll ? (
										<>
											<span>Показать меньше</span>
											<ChevronUp className='h-4 w-4' />
										</>
									) : (
										<>
											<span>Показать все ({history.length - 3} еще)</span>
											<ChevronDown className='h-4 w-4' />
										</>
									)}
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Модальное окно удаления */}
			<Modal
				isOpen={deleteModalOpen}
				onClose={() => {
					if (!isDeleting) {
						setDeleteModalOpen(false)
						setEntryToDelete(null)
					}
				}}
				title='Удалить запись о весе?'
				maxWidth='sm'
			>
				<div className='space-y-4'>
					<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
						Вы уверены, что хотите удалить эту запись? Это действие нельзя
						отменить.
					</p>

					{entryToDelete && (
						<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
										{entryToDelete.weight} кг
									</p>
									<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
										{format(parseISO(entryToDelete.date), 'd MMMM yyyy', {
											locale: ru,
										})}
									</p>
								</div>
							</div>
						</div>
					)}

					<p className='text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-md'>
						⚠️ Удаление записи приведет к автоматическому пересчету активных
						целей
					</p>

					<div className='flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2'>
						<button
							onClick={() => {
								setDeleteModalOpen(false)
								setEntryToDelete(null)
							}}
							disabled={isDeleting}
							className='flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
						>
							Отмена
						</button>
						<button
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
							className='flex-1 px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
						>
							{isDeleting ? (
								<>
									<Loader2 className='w-4 h-4 animate-spin' />
									<span>Удаление...</span>
								</>
							) : (
								<>
									<Trash2 className='w-4 h-4' />
									<span>Удалить</span>
								</>
							)}
						</button>
					</div>
				</div>
			</Modal>
		</CollapsibleSection>
	)
}
