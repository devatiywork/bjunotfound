import {
	BarChart3,
	CheckCircle,
	Flame,
	Package,
	ShoppingCart,
	SkipForward,
	TrendingUp,
	Utensils,
} from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import {
	getPeriodStats,
	getShoppingList,
} from '../../../../../api/services/meal-statistics.ts'
import type {
	PeriodStatsResponse,
	ShoppingListResponse,
} from '../../../../../api/types/meal-statistics.ts'
import { Modal } from '../../../../../components/index.ts'

interface StatisticsModalProps {
	isOpen: boolean
	onClose: () => void
	startDate: string
	endDate: string
}

export const StatisticsModal = memo(function StatisticsModal({
	isOpen,
	onClose,
	startDate,
	endDate,
}: StatisticsModalProps) {
	const [periodStats, setPeriodStats] = useState<PeriodStatsResponse | null>(
		null
	)
	const [shoppingList, setShoppingList] = useState<ShoppingListResponse | null>(
		null
	)
	const [isLoadingStats, setIsLoadingStats] = useState(false)
	const [isLoadingShopping, setIsLoadingShopping] = useState(false)
	const [statsError, setStatsError] = useState<string | null>(null)
	const [shoppingError, setShoppingError] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'stats' | 'shopping'>('stats')

	// Загрузка статистики
	const loadStats = useCallback(async () => {
		setIsLoadingStats(true)
		setStatsError(null)
		try {
			const data = await getPeriodStats({ startDate, endDate })
			setPeriodStats(data)
		} catch (error) {
			console.error('Ошибка загрузки статистики:', error)
			setStatsError('Не удалось загрузить статистику')
		} finally {
			setIsLoadingStats(false)
		}
	}, [startDate, endDate])

	// Загрузка списка покупок
	const loadShoppingList = useCallback(async () => {
		setIsLoadingShopping(true)
		setShoppingError(null)
		try {
			const data = await getShoppingList({ startDate, endDate })
			setShoppingList(data)
		} catch (error) {
			console.error('Ошибка загрузки списка покупок:', error)
			setShoppingError('Не удалось загрузить список покупок')
		} finally {
			setIsLoadingShopping(false)
		}
	}, [startDate, endDate])

	// Загрузка при открытии модалки
	useEffect(() => {
		if (isOpen) {
			loadStats()
			loadShoppingList()
		}
	}, [isOpen, loadStats, loadShoppingList])

	const periodLabel = `${new Date(startDate).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})} — ${new Date(endDate).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})}`

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Статистика за неделю'>
			<div className='space-y-4'>
				{/* Период */}
				<p className='text-sm text-gray-500 dark:text-gray-400 text-center'>
					{periodLabel}
				</p>

				{/* Tabs */}
				<div className='flex gap-2 border-b border-gray-200 dark:border-gray-700'>
					<button
						onClick={() => setActiveTab('stats')}
						className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'stats'
								? 'border-blue-500 text-blue-600 dark:text-blue-400'
								: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
						}`}
					>
						<BarChart3 className='w-4 h-4' />
						Статистика
					</button>
					<button
						onClick={() => setActiveTab('shopping')}
						className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
							activeTab === 'shopping'
								? 'border-green-500 text-green-600 dark:text-green-400'
								: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
						}`}
					>
						<ShoppingCart className='w-4 h-4' />
						Покупки
					</button>
				</div>

				{/* Content */}
				<div className='max-h-[60vh] overflow-y-auto'>
					{activeTab === 'stats' ? (
						<StatsContent
							periodStats={periodStats}
							isLoading={isLoadingStats}
							error={statsError}
						/>
					) : (
						<ShoppingContent
							shoppingList={shoppingList}
							isLoading={isLoadingShopping}
							error={shoppingError}
						/>
					)}
				</div>
			</div>
		</Modal>
	)
})

// Контент статистики
const StatsContent = memo(function StatsContent({
	periodStats,
	isLoading,
	error,
}: {
	periodStats: PeriodStatsResponse | null
	isLoading: boolean
	error: string | null
}) {
	if (isLoading) {
		return (
			<div className='flex justify-center py-8'>
				<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500' />
			</div>
		)
	}

	if (error) {
		return <div className='text-center py-4 text-red-500 text-sm'>{error}</div>
	}

	if (!periodStats) {
		return (
			<div className='text-center py-4 text-gray-500 text-sm'>Нет данных</div>
		)
	}

	return (
		<div className='space-y-4'>
			{/* События */}
			<div className='p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
				<div className='flex items-center gap-2 mb-3'>
					<Utensils className='w-4 h-4 text-blue-500' />
					<span className='font-medium text-gray-900 dark:text-white'>
						События
					</span>
				</div>
				<div className='grid grid-cols-2 gap-2'>
					<StatCard
						label='Всего'
						value={periodStats.events.total}
						icon={<Package className='w-4 h-4 text-gray-500' />}
					/>
					<StatCard
						label='Выполнено'
						value={periodStats.events.completed}
						icon={<CheckCircle className='w-4 h-4 text-green-500' />}
					/>
					<StatCard
						label='Пропущено'
						value={periodStats.events.skipped}
						icon={<SkipForward className='w-4 h-4 text-gray-400' />}
					/>
					<StatCard
						label='Запланировано'
						value={periodStats.events.planned}
						icon={<TrendingUp className='w-4 h-4 text-blue-500' />}
					/>
				</div>
				{periodStats.events.total > 0 && (
					<div className='mt-3'>
						<div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1'>
							<span>Выполнение плана</span>
							<span>{periodStats.events.completionRate}%</span>
						</div>
						<div className='h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
							<div
								className='h-full bg-green-500 rounded-full transition-all'
								style={{ width: `${periodStats.events.completionRate}%` }}
							/>
						</div>
					</div>
				)}
			</div>

			{/* КБЖУ */}
			<div className='p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
				<div className='flex items-center gap-2 mb-3'>
					<Flame className='w-4 h-4 text-orange-500' />
					<span className='font-medium text-gray-900 dark:text-white'>
						КБЖУ за период
					</span>
				</div>
				<div className='space-y-2'>
					<NutritionRow
						label='Калории'
						total={periodStats.nutrition.total.calories}
						perDay={periodStats.nutrition.averagePerDay.calories}
						unit='ккал'
						color='text-orange-500'
					/>
					<NutritionRow
						label='Белки'
						total={periodStats.nutrition.total.proteins}
						perDay={periodStats.nutrition.averagePerDay.proteins}
						unit='г'
						color='text-red-500'
					/>
					<NutritionRow
						label='Жиры'
						total={periodStats.nutrition.total.fats}
						perDay={periodStats.nutrition.averagePerDay.fats}
						unit='г'
						color='text-yellow-500'
					/>
					<NutritionRow
						label='Углеводы'
						total={periodStats.nutrition.total.carbs}
						perDay={periodStats.nutrition.averagePerDay.carbs}
						unit='г'
						color='text-green-500'
					/>
				</div>
			</div>

			{/* Популярные блюда */}
			{periodStats.dishes.mostFrequent.length > 0 && (
				<div className='p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50'>
					<div className='flex items-center gap-2 mb-3'>
						<Utensils className='w-4 h-4 text-purple-500' />
						<span className='font-medium text-gray-900 dark:text-white'>
							Блюда ({periodStats.dishes.uniqueCount})
						</span>
					</div>
					<div className='space-y-2'>
						{periodStats.dishes.mostFrequent.map(dish => (
							<div
								key={dish.dishId}
								className='flex justify-between items-center text-sm'
							>
								<span className='text-gray-700 dark:text-gray-300 truncate flex-1'>
									{dish.dishName}
								</span>
								<span className='text-gray-500 dark:text-gray-400 ml-2'>
									×{dish.count}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
})

// Контент списка покупок
const ShoppingContent = memo(function ShoppingContent({
	shoppingList,
	isLoading,
	error,
}: {
	shoppingList: ShoppingListResponse | null
	isLoading: boolean
	error: string | null
}) {
	if (isLoading) {
		return (
			<div className='flex justify-center py-8'>
				<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-green-500' />
			</div>
		)
	}

	if (error) {
		return <div className='text-center py-4 text-red-500 text-sm'>{error}</div>
	}

	if (!shoppingList || shoppingList.items.length === 0) {
		return (
			<div className='text-center py-4 text-gray-500 text-sm'>
				Нет запланированных покупок
			</div>
		)
	}

	return (
		<div className='space-y-3'>
			<div className='text-xs text-gray-500 dark:text-gray-400'>
				{shoppingList.summary.totalProducts} продуктов для{' '}
				{shoppingList.summary.totalEvents} событий
			</div>

			{/* Общая стоимость */}
			{shoppingList.summary.totalEstimatedPrice != null && (
				<div className='flex justify-between items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20'>
					<span className='text-sm text-gray-700 dark:text-gray-300'>
						Примерная стоимость:
					</span>
					<span className='text-sm font-bold text-green-600 dark:text-green-400'>
						{Number(shoppingList.summary.totalEstimatedPrice).toFixed(2)}{' '}
						{shoppingList.summary.currency || '₽'}
					</span>
				</div>
			)}

			{(shoppingList.summary.productsWithoutPrice ?? 0) > 0 && (
				<div className='text-xs text-amber-600 dark:text-amber-400'>
					⚠ {shoppingList.summary.productsWithoutPrice} продуктов без цены
				</div>
			)}

			{/* Список продуктов */}
			<div className='space-y-2'>
				{shoppingList.items.map(item => (
					<div
						key={item.productId}
						className='flex justify-between items-start p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50'
					>
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
								{item.productName}
							</p>
							{item.brandName && (
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									{item.brandName}
								</p>
							)}
						</div>
						<div className='text-right ml-2'>
							<span className='text-sm font-semibold text-green-600 dark:text-green-400'>
								{item.totalGrams} г
							</span>
							{item.estimatedPrice != null && (
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									~{Number(item.estimatedPrice).toFixed(2)}{' '}
									{item.currency || '₽'}
								</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
})

// Компонент карточки статистики
const StatCard = memo(function StatCard({
	label,
	value,
	icon,
}: {
	label: string
	value: number
	icon: React.ReactNode
}) {
	return (
		<div className='flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800'>
			{icon}
			<div>
				<p className='text-lg font-semibold text-gray-900 dark:text-white'>
					{value}
				</p>
				<p className='text-xs text-gray-500 dark:text-gray-400'>{label}</p>
			</div>
		</div>
	)
})

// Компонент строки КБЖУ
const NutritionRow = memo(function NutritionRow({
	label,
	total,
	perDay,
	unit,
	color,
}: {
	label: string
	total: number
	perDay: number
	unit: string
	color: string
}) {
	return (
		<div className='flex justify-between items-center'>
			<span className={`text-sm font-medium ${color}`}>{label}</span>
			<div className='text-right'>
				<span className='text-sm font-semibold text-gray-900 dark:text-white'>
					{Math.round(total)} {unit}
				</span>
				<span className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
					(~{Math.round(perDay)}/день)
				</span>
			</div>
		</div>
	)
})
