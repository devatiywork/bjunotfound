import { format, parseISO } from 'date-fns'
import { Loader2, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import {
	calculatePace,
	createGoal,
	getActiveGoal,
	getWeightHistory,
	type ApiError,
	type CreateGoalRequest,
	type Goal,
	type PaceOption,
} from '../../../../../../../api'
import { DatePicker, Input, Modal } from '../../../../../../../components'
import { AddWeightStep, PaceOptions } from '../components/index.ts'

interface AddGoalModalProps {
	isOpen: boolean
	onClose: () => void
	onGoalCreated?: (goal: Goal) => void
}

export const AddGoalModal = ({
	isOpen,
	onClose,
	onGoalCreated,
}: AddGoalModalProps) => {
	// Данные пользователя
	const [latestWeight, setLatestWeight] = useState<number | null>(null)
	const [isLoadingData, setIsLoadingData] = useState(true)

	// Форма
	const [targetWeight, setTargetWeight] = useState('')
	const [targetCalories, setTargetCalories] = useState('')
	const [isManualCalories, setIsManualCalories] = useState(false)
	const [targetSteps, setTargetSteps] = useState('')
	const [targetBurnedCalories, setTargetBurnedCalories] = useState('')
	const [startDate, setStartDate] = useState<Date | null>(new Date())
	const [endDate, setEndDate] = useState<Date | null>(null)

	// Расчетные данные с бекенда
	const [paceOptions, setPaceOptions] = useState<PaceOption[]>([])
	const [selectedPace, setSelectedPace] = useState<PaceOption | null>(null)
	const [isLoadingPace, setIsLoadingPace] = useState(false)

	// Состояние отправки
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	// Загрузка данных пользователя
	useEffect(() => {
		if (isOpen) {
			loadUserData()
		}
	}, [isOpen])

	// Загрузка данных пользователя
	useEffect(() => {
		if (isOpen) {
			loadUserData()
		}
	}, [isOpen])

	// Генерация вариантов темпа при изменении целевого веса
	useEffect(() => {
		let mounted = true
		const timer = setTimeout(async () => {
			if (!mounted) return
			if (!targetWeight || !latestWeight) {
				setPaceOptions([])
				setSelectedPace(null)
				return
			}

			const targetWeightValue = parseFloat(targetWeight)
			if (isNaN(targetWeightValue) || targetWeightValue === latestWeight) {
				setPaceOptions([])
				setSelectedPace(null)
				return
			}

			setIsLoadingPace(true)
			try {
				// Вызываем API для расчета вариантов темпа
				const response = await calculatePace({
					targetWeight: targetWeightValue,
				})

				if (!mounted) return

				setPaceOptions(response.options)

				// Автоматически выбираем рекомендуемый вариант
				const recommendedOption = response.options.find(
					opt => opt.isRecommended
				)
				if (recommendedOption && !selectedPace) {
					handlePaceSelect(recommendedOption)
				}
			} catch (err) {
				console.error('Error calculating pace:', err)
				setPaceOptions([])
				setSelectedPace(null)
			} finally {
				if (mounted) {
					setIsLoadingPace(false)
				}
			}
		}, 500)

		return () => {
			mounted = false
			clearTimeout(timer)
		}
	}, [targetWeight, latestWeight])

	const loadUserData = async () => {
		setIsLoadingData(true)

		try {
			// Параллельно загружаем все данные
			const [weights] = await Promise.all([getWeightHistory(), getActiveGoal()])

			if (weights.length > 0) {
				setLatestWeight(weights[0].weight)
			}
		} catch (err) {
			console.error('Error loading user data:', err)
			setError('Ошибка загрузки данных пользователя')
		} finally {
			setIsLoadingData(false)
		}
	}

	const handleWeightAdded = async (weight: number) => {
		setLatestWeight(weight)
		// Перезагружаем данные о весе
		try {
			const weights = await getWeightHistory()
			if (weights.length > 0) {
				setLatestWeight(weights[0].weight)
			}
		} catch (err) {
			console.error('Error reloading weight data:', err)
			// Если не удалось загрузить, используем добавленный вес
			setLatestWeight(weight)
		}
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')
		setSuccess('')

		const weightValue = targetWeight ? parseFloat(targetWeight) : undefined
		const caloriesValue = targetCalories ? parseInt(targetCalories) : undefined

		// Валидация
		if (!weightValue && !caloriesValue) {
			setError('Укажите хотя бы одну цель: вес или калории')
			return
		}

		if (weightValue && (weightValue < 20 || weightValue > 500)) {
			setError('Целевой вес должен быть в диапазоне 20-500 кг')
			return
		}

		if (caloriesValue && (caloriesValue < 500 || caloriesValue > 10000)) {
			setError('Целевые калории должны быть в диапазоне 500-10000')
			return
		}

		if (!startDate || !endDate) {
			setError('Укажите период цели')
			return
		}

		if (endDate <= startDate) {
			setError('Дата окончания должна быть позже даты начала')
			return
		}

		// Проверяем warnings если выбран темп
		if (selectedPace && selectedPace.warning && !isManualCalories) {
			return
		}

		setIsSubmitting(true)

		try {
			const goalData: CreateGoalRequest = {
				targetWeight: weightValue,
				targetCalories: caloriesValue,
				targetSteps: targetSteps ? parseInt(targetSteps) : undefined,
				targetBurnedCalories: targetBurnedCalories
					? parseFloat(targetBurnedCalories)
					: undefined,
				startDate: format(startDate, 'yyyy-MM-dd'),
				endDate: format(endDate, 'yyyy-MM-dd'),
			}

			const newGoal = await createGoal(goalData)

			setSuccess('Цель успешно создана!')

			// Вызываем callback
			if (onGoalCreated) {
				onGoalCreated(newGoal)
			}

			// Закрываем модалку через 1 секунду
			setTimeout(() => {
				onClose()
				// Сброс формы
				resetForm()
			}, 1000)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message || 'Ошибка при создании цели. Попробуйте снова.'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const resetForm = () => {
		setTargetWeight('')
		setTargetCalories('')
		setIsManualCalories(false)
		setTargetSteps('')
		setTargetBurnedCalories('')
		setStartDate(new Date())
		setEndDate(null)
		setPaceOptions([])
		setSelectedPace(null)
		setSuccess('')
		setError('')
	}

	const handlePaceSelect = (option: PaceOption) => {
		setSelectedPace(option)
		setTargetCalories(option.targetCalories.toString())
		setTargetSteps(option.targetSteps.toString())
		setTargetBurnedCalories(option.targetBurnedCalories.toString())

		// Используем endDate из API напрямую
		setEndDate(parseISO(option.endDate))
	}

	// Разница веса (currentWeight - targetWeight, положительное = похудение)
	const weightDifference =
		latestWeight && targetWeight
			? latestWeight - parseFloat(targetWeight)
			: null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={latestWeight === null ? 'Добавление веса' : 'Создать новую цель'}
			maxWidth={latestWeight === null ? '2xl' : '4xl'}
		>
			{isLoadingData ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-blue-600 dark:text-blue-400' />
				</div>
			) : latestWeight === null ? (
				<AddWeightStep onWeightAdded={handleWeightAdded} />
			) : (
				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* Success Message */}
					{success && (
						<div className='rounded-md bg-green-50 p-3 dark:bg-green-900/20'>
							<p className='text-sm text-green-800 dark:text-green-200'>
								{success}
							</p>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className='rounded-md bg-red-50 p-3 dark:bg-red-900/20'>
							<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
						</div>
					)}

					{/* Current Weight Info */}
					<div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20'>
						<p className='text-sm text-blue-800 dark:text-blue-200'>
							Ваш текущий вес:{' '}
							<span className='font-bold'>{latestWeight} кг</span>
						</p>
					</div>

					{/* Target Weight */}
					<div>
						<Input
							type='number'
							id='targetWeight'
							label='Целевой вес (кг)'
							value={targetWeight}
							onChange={e => setTargetWeight(e.target.value)}
							disabled={isSubmitting}
							placeholder='70'
							step='0.1'
							min='20'
							max='500'
							required
						/>
						{weightDifference !== null && (
							<div className='mt-2 flex items-center gap-2 text-sm'>
								{weightDifference > 0 ? (
									<>
										<TrendingDown className='h-4 w-4 text-green-600 dark:text-green-400' />
										<span className='text-green-600 dark:text-green-400'>
											Сбросить: {weightDifference.toFixed(1)} кг
										</span>
									</>
								) : weightDifference < 0 ? (
									<>
										<TrendingUp className='h-4 w-4 text-red-600 dark:text-red-400' />
										<span className='text-red-600 dark:text-red-400'>
											Набрать: +{Math.abs(weightDifference).toFixed(1)} кг
										</span>
									</>
								) : (
									<span className='text-gray-600 dark:text-gray-400'>
										Поддерживать текущий вес
									</span>
								)}
							</div>
						)}
					</div>

					{/* Date Range */}
					<div className='grid gap-4 sm:grid-cols-2'>
						<DatePicker
							label='Дата начала'
							selected={startDate}
							onChange={date => setStartDate(date)}
							disabled={isSubmitting}
							placeholderText='Выберите дату начала'
							required
						/>
						<DatePicker
							label='Дата окончания'
							selected={endDate}
							onChange={date => {
								setEndDate(date)
								setSelectedPace(null) // Сбрасываем выбранный темп при ручном изменении даты
							}}
							disabled={isSubmitting || isLoadingPace}
							minDate={startDate || undefined}
							placeholderText='Выберите дату окончания'
							required
						/>
					</div>

					{/* Loading Pace Options */}
					{isLoadingPace && (
						<div className='flex items-center justify-center py-8'>
							<Loader2 className='h-6 w-6 animate-spin text-blue-600 dark:text-blue-400' />
							<span className='ml-2 text-sm text-gray-600 dark:text-gray-400'>
								Расчет вариантов темпа...
							</span>
						</div>
					)}

					{/* Pace Options */}
					{!isLoadingPace &&
						paceOptions.length > 0 &&
						weightDifference !== null &&
						!isManualCalories && (
							<PaceOptions
								options={paceOptions}
								selectedPace={selectedPace}
								onSelect={handlePaceSelect}
								weightDifference={weightDifference}
							/>
						)}

					{/* Target Calories */}
					<div>
						<div className='mb-2 flex items-center justify-between'>
							<label
								htmlFor='targetCalories'
								className='text-sm font-medium text-gray-700 dark:text-gray-300'
							>
								Целевые калории в день
							</label>
							<button
								type='button'
								onClick={() => setIsManualCalories(!isManualCalories)}
								className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
							>
								{isManualCalories ? 'Авто-расчет' : 'Ручной ввод'}
							</button>
						</div>
						<Input
							type='number'
							id='targetCalories'
							value={targetCalories}
							onChange={e => setTargetCalories(e.target.value)}
							disabled={isSubmitting || !isManualCalories}
							placeholder='2000'
							min='500'
							max='10000'
						/>
						{!isManualCalories && (
							<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
								Калории рассчитываются автоматически на основе ваших параметров
							</p>
						)}
					</div>

					{/* Divider */}
					<div className='border-t border-gray-200 pt-4 dark:border-gray-700'>
						<h3 className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
							Цели по активности (необязательно)
						</h3>
						<p className='mb-4 text-xs text-gray-600 dark:text-gray-400'>
							Укажите желаемое количество шагов и сожженных калорий в день
						</p>
					</div>

					{/* Target Steps */}
					<div>
						<label
							htmlFor='targetSteps'
							className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'
						>
							Целевое количество шагов в день
						</label>
						<Input
							type='number'
							id='targetSteps'
							value={targetSteps}
							onChange={e => setTargetSteps(e.target.value)}
							disabled={isSubmitting}
							placeholder='10000'
							min='1'
							max='100000'
						/>
						<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
							Рекомендуется 10 000 шагов в день для поддержания здоровья
						</p>
					</div>

					{/* Target Burned Calories */}
					<div>
						<label
							htmlFor='targetBurnedCalories'
							className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'
						>
							Целевые калории для сжигания в день
						</label>
						<Input
							type='number'
							id='targetBurnedCalories'
							value={targetBurnedCalories}
							onChange={e => setTargetBurnedCalories(e.target.value)}
							disabled={isSubmitting}
							placeholder='400'
							min='1'
							max='5000'
							step='1'
						/>
						<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
							Калории, которые вы планируете сжигать активностью
						</p>
					</div>

					{/* Submit Buttons */}
					<div className='flex gap-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							disabled={isSubmitting}
							className='flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							Отмена
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
						>
							{isSubmitting ? (
								<>
									<Loader2 className='h-5 w-5 animate-spin' />
									<span>Создание...</span>
								</>
							) : (
								<>
									<Plus className='h-5 w-5' />
									<span>Создать цель</span>
								</>
							)}
						</button>
					</div>
				</form>
			)}
		</Modal>
	)
}
