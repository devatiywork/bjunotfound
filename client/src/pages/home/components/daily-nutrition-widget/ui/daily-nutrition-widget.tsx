import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
	CheckCircle,
	ChevronRight,
	Clock,
	Flame,
	Loader2,
	SkipForward,
	Target,
	Utensils,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDailyStats } from '../../../../../api/services/meal-statistics.ts'
import type { DailyStatsResponse } from '../../../../../api/types/meal-statistics.ts'
import { CollapsibleSection, ProgressBar } from '../../../../../components'

export const DailyNutritionWidget = () => {
	const [data, setData] = useState<DailyStatsResponse | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadData()
	}, [])

	const loadData = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await getDailyStats()
			setData(response)
		} catch (err) {
			console.error('Ошибка загрузки дневной статистики:', err)
			setError('Не удалось загрузить данные')
		} finally {
			setIsLoading(false)
		}
	}

	const today = format(new Date(), 'd MMMM', { locale: ru })

	// Расчёт прогресса калорий
	const getCaloriesProgress = () => {
		if (!data?.goal?.calories) return null
		const consumed =
			data.totals.consumed.calories + data.totals.planned.calories
		return Math.min(100, Math.round((consumed / data.goal.calories) * 100))
	}

	const caloriesProgress = getCaloriesProgress()

	return (
		<CollapsibleSection
			title='Питание сегодня'
			description={today}
			icon={Utensils}
			iconColor='text-orange-600 dark:text-orange-400'
			iconBgColor='bg-orange-100 dark:bg-orange-900/30'
		>
			{isLoading ? (
				<div className='flex justify-center py-8'>
					<Loader2 className='h-6 w-6 animate-spin text-orange-500' />
				</div>
			) : error ? (
				<div className='text-center py-4'>
					<p className='text-red-500 text-sm mb-2'>{error}</p>
					<button
						onClick={loadData}
						className='text-sm text-blue-500 hover:underline'
					>
						Попробовать снова
					</button>
				</div>
			) : data ? (
				<div className='space-y-4'>
					{/* Прогресс калорий */}
					{data.goal?.calories && (
						<div className='p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20'>
							<div className='flex items-center justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<Flame className='w-4 h-4 text-orange-500' />
									<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Калории
									</span>
								</div>
								<div className='text-right'>
									<span className='text-lg font-bold text-orange-600 dark:text-orange-400'>
										{Math.round(data.totals.consumed.calories)}
									</span>
									<span className='text-sm text-gray-500 dark:text-gray-400'>
										{' '}
										/ {data.goal.calories} ккал
									</span>
								</div>
							</div>
							<ProgressBar
								value={caloriesProgress || 0}
								color='orange'
								height='md'
								showPercentage={false}
							/>
							{data.remaining?.calories != null &&
								data.remaining.calories > 0 && (
									<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
										Осталось: {Math.round(data.remaining.calories)} ккал
									</p>
								)}
						</div>
					)}

					{/* БЖУ */}
					<div className='grid grid-cols-3 gap-2'>
						<NutrientCard
							label='Белки'
							value={data.totals.consumed.proteins}
							goal={data.goal?.proteins}
							color='red'
						/>
						<NutrientCard
							label='Жиры'
							value={data.totals.consumed.fats}
							goal={data.goal?.fats}
							color='yellow'
						/>
						<NutrientCard
							label='Углеводы'
							value={data.totals.consumed.carbs}
							goal={data.goal?.carbs}
							color='green'
						/>
					</div>

					{/* Приёмы пищи */}
					{data.meals.length > 0 && (
						<div className='space-y-2'>
							<h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Приёмы пищи
							</h4>
							<div className='space-y-2'>
								{data.meals.map(meal => (
									<MealCard key={meal.mealTypeId} meal={meal} />
								))}
							</div>
						</div>
					)}

					{/* Ссылка на график питания */}
					<Link
						to='/app/nutrition-chart'
						className='flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
					>
						<Target className='w-4 h-4' />
						<span className='text-sm'>Открыть график питания</span>
						<ChevronRight className='w-4 h-4' />
					</Link>
				</div>
			) : (
				<div className='text-center py-4 text-gray-500 text-sm'>
					Нет данных о питании
				</div>
			)}
		</CollapsibleSection>
	)
}

// Карточка нутриента (Б/Ж/У)
const NutrientCard = ({
	label,
	value,
	goal,
	color,
}: {
	label: string
	value: number
	goal: number | null
	color: 'red' | 'yellow' | 'green'
}) => {
	const colorClasses = {
		red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
		yellow:
			'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
		green:
			'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
	}

	return (
		<div className={`p-2 rounded-lg text-center ${colorClasses[color]}`}>
			<p className='text-lg font-bold'>{Math.round(value)}</p>
			<p className='text-xs opacity-75'>{goal ? `/ ${goal}` : ''} г</p>
			<p className='text-xs mt-1 opacity-60'>{label}</p>
		</div>
	)
}

// Карточка приёма пищи
const MealCard = ({ meal }: { meal: DailyStatsResponse['meals'][0] }) => {
	const completedCount = meal.events.filter(
		e => e.status === 'COMPLETED'
	).length
	const plannedCount = meal.events.filter(e => e.status === 'PLANNED').length
	const skippedCount = meal.events.filter(e => e.status === 'SKIPPED').length

	return (
		<div className='flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
			<div className='flex items-center gap-2'>
				<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
					{meal.mealTypeName}
				</span>
				<div className='flex items-center gap-1'>
					{completedCount > 0 && (
						<span className='flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400'>
							<CheckCircle className='w-3 h-3' />
							{completedCount}
						</span>
					)}
					{plannedCount > 0 && (
						<span className='flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400'>
							<Clock className='w-3 h-3' />
							{plannedCount}
						</span>
					)}
					{skippedCount > 0 && (
						<span className='flex items-center gap-0.5 text-xs text-gray-400'>
							<SkipForward className='w-3 h-3' />
							{skippedCount}
						</span>
					)}
				</div>
			</div>
			<div className='text-right'>
				<span className='text-sm font-semibold text-orange-600 dark:text-orange-400'>
					{Math.round(meal.totals.calories)}
				</span>
				<span className='text-xs text-gray-500 dark:text-gray-400'> ккал</span>
			</div>
		</div>
	)
}
