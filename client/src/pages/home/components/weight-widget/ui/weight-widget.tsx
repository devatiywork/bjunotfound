import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	History,
	Loader2,
	Minus,
	Plus,
	Scale,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import {
	addWeight,
	getUserProfile,
	getWeightHistory,
	type ApiError,
	type WeightEntry,
} from '../../../../../api'
import { CollapsibleSection, Input } from '../../../../../components'
import { calculateBMI } from '../../../../../utils'

export const WeightWidget = () => {
	// Состояние формы добавления веса
	const [weight, setWeight] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState('')
	const [submitSuccess, setSubmitSuccess] = useState('')

	// Состояние истории веса
	const [history, setHistory] = useState<WeightEntry[]>([])
	const [isLoadingHistory, setIsLoadingHistory] = useState(true)
	const [historyError, setHistoryError] = useState('')

	// Рост пользователя для расчета ИМТ
	const [userHeight, setUserHeight] = useState<number | null>(null)

	useEffect(() => {
		loadUserProfile()
		loadHistory()
	}, [])

	const loadUserProfile = async () => {
		try {
			const profile = await getUserProfile()
			setUserHeight(profile.height)
		} catch (err) {
			console.error('Ошибка при загрузке профиля:', err)
		}
	}

	const loadHistory = async () => {
		setIsLoadingHistory(true)
		setHistoryError('')

		try {
			const data = await getWeightHistory()
			// Берем только последние 5 записей и переворачиваем для отображения от старых к новым
			setHistory(data.slice(0, 5))
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setHistoryError(
				apiError?.message ||
					'Ошибка при загрузке истории. Попробуйте обновить страницу.'
			)
		} finally {
			setIsLoadingHistory(false)
		}
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSubmitError('')
		setSubmitSuccess('')

		const weightValue = parseFloat(weight)

		if (!weightValue || weightValue <= 0) {
			setSubmitError('Укажите корректный вес')
			return
		}

		if (weightValue < 20 || weightValue > 500) {
			setSubmitError('Вес должен быть в диапазоне 20-500 кг')
			return
		}

		setIsSubmitting(true)

		try {
			// Автоматически используем текущую дату
			await addWeight({
				weight: weightValue,
				date: format(new Date(), 'yyyy-MM-dd'),
			})

			setSubmitSuccess('Вес успешно добавлен!')
			setWeight('')

			// Обновляем историю
			await loadHistory()

			// Скрыть сообщение об успехе через 3 секунды
			setTimeout(() => setSubmitSuccess(''), 3000)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setSubmitError(
				apiError?.message || 'Ошибка при добавлении веса. Попробуйте снова.'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const calculateDifference = (current: number, previous: number) => {
		return current - previous
	}

	const getDifferenceIcon = (diff: number) => {
		if (diff > 0) return <TrendingUp className='h-4 w-4 text-red-500' />
		if (diff < 0) return <TrendingDown className='h-4 w-4 text-green-500' />
		return <Minus className='h-4 w-4 text-gray-400' />
	}

	const getDifferenceColor = (diff: number) => {
		if (diff > 0) return 'text-red-600 dark:text-red-400'
		if (diff < 0) return 'text-green-600 dark:text-green-400'
		return 'text-gray-600 dark:text-gray-400'
	}

	return (
		<CollapsibleSection
			title='Управление весом'
			description='Добавление и история веса'
			icon={Scale}
		>
			{/* Success Message */}
			{submitSuccess && (
				<div className='mb-4 rounded-md bg-green-50 p-3 dark:bg-green-900/20'>
					<p className='text-sm text-green-800 dark:text-green-200'>
						{submitSuccess}
					</p>
				</div>
			)}

			{/* Error Message */}
			{submitError && (
				<div className='mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20'>
					<p className='text-sm text-red-800 dark:text-red-200'>
						{submitError}
					</p>
				</div>
			)}

			{/* Add Weight Form */}
			<form className='mb-6 space-y-4' onSubmit={handleSubmit}>
				<div className='flex gap-3'>
					<div className='flex-1'>
						<Input
							type='number'
							id='weight'
							label='Вес (кг)'
							value={weight}
							onChange={e => setWeight(e.target.value)}
							required
							disabled={isSubmitting}
							placeholder='75.5'
							step='0.1'
							min='20'
							max='500'
						/>
					</div>
					<div className='flex items-end'>
						<button
							type='submit'
							disabled={isSubmitting}
							className='flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
						>
							{isSubmitting ? (
								<Loader2 className='h-5 w-5 animate-spin' />
							) : (
								<Plus className='h-5 w-5' />
							)}
							<span className='hidden sm:inline'>
								{isSubmitting ? 'Добавление...' : 'Добавить'}
							</span>
						</button>
					</div>
				</div>
			</form>

			{/* Divider */}
			<div className='my-6 border-t border-gray-200 dark:border-gray-700' />

			{/* History Section Header */}
			<div className='mb-4 flex items-center gap-2'>
				<History className='h-5 w-5 text-gray-600 dark:text-gray-400' />
				<h3 className='text-base font-semibold text-gray-900 dark:text-white'>
					История веса
				</h3>
			</div>

			{/* Loading State */}
			{isLoadingHistory && (
				<div className='flex items-center justify-center py-8'>
					<div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
						<Loader2 className='h-5 w-5 animate-spin' />
						<span className='text-sm'>Загрузка истории...</span>
					</div>
				</div>
			)}

			{/* Error State */}
			{historyError && !isLoadingHistory && (
				<div className='rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
					<p className='text-sm text-red-800 dark:text-red-200'>
						{historyError}
					</p>
				</div>
			)}

			{/* Empty State */}
			{!isLoadingHistory && !historyError && history.length === 0 && (
				<div className='py-8 text-center'>
					<History className='mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600' />
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						История пуста
					</p>
					<p className='text-xs text-gray-500 dark:text-gray-500'>
						Добавьте первую запись о весе
					</p>
				</div>
			)}

			{/* History List */}
			{!isLoadingHistory && !historyError && history.length > 0 && (
				<div className='space-y-2'>
					{history.map((entry, index) => {
						const previousEntry = history[index + 1]
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
								className='flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50'
							>
								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										<span className='text-lg font-bold text-gray-900 dark:text-white'>
											{entry.weight} кг
										</span>
										{diff !== null && (
											<div className='flex items-center gap-1'>
												{getDifferenceIcon(diff)}
												<span
													className={`text-xs font-medium ${getDifferenceColor(
														diff
													)}`}
												>
													{diff > 0 ? '+' : ''}
													{diff.toFixed(1)} кг
												</span>
											</div>
										)}
									</div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										{format(parseISO(entry.date), 'd MMMM yyyy', {
											locale: ru,
										})}
									</p>
									{bmi && (
										<p
											className={`text-xs font-medium mt-1 ${bmi.color} ${bmi.darkColor}`}
										>
											ИМТ: {bmi.value} — {bmi.categoryLabel}
										</p>
									)}
								</div>

								{index === 0 && (
									<span className='ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'>
										Последний
									</span>
								)}
							</div>
						)
					})}
				</div>
			)}
		</CollapsibleSection>
	)
}
