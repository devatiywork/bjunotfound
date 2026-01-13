import type { Dish } from '../../../../../../../api/types'
import { DishCard } from '../../dish-card'

interface DishesListProps {
	dishes: Dish[]
	isLoading: boolean
	onEdit: (dish: Dish) => void
	onArchive: (dishId: string) => void
	onDelete: (dishId: string) => void
	onRefresh: () => void | Promise<void>
	expandedDishId?: string | null
	onExpandedDishClose?: () => void
}

export const DishesList = ({
	dishes,
	isLoading,
	onEdit,
	onArchive,
	onDelete,
	onRefresh,
	expandedDishId,
	onExpandedDishClose,
}: DishesListProps) => {
	if (isLoading) {
		return <LoadingState />
	}

	if (dishes.length === 0) {
		return <EmptyState />
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{dishes.map(dish => (
				<DishCard
					key={dish.id}
					dish={dish}
					onEdit={onEdit}
					onArchive={onArchive}
					onDelete={onDelete}
					onRefresh={onRefresh}
					autoExpand={expandedDishId === dish.id}
					onAutoExpandClose={onExpandedDishClose}
				/>
			))}
		</div>
	)
}

// Подкомпонент состояния загрузки
const LoadingState = () => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={index}
					className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse'
				>
					<div className='flex justify-between items-start mb-3'>
						<div className='space-y-2 flex-1'>
							<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
							<div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-16'></div>
						</div>
						<div className='w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded'></div>
					</div>
					<div className='space-y-2 mb-3'>
						<div className='h-3 bg-gray-200 dark:bg-gray-700 rounded'></div>
						<div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3'></div>
					</div>
					<div className='flex justify-between items-center'>
						<div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-20'></div>
						<div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-16'></div>
					</div>
				</div>
			))}
		</div>
	)
}

// Подкомпонент пустого состояния
const EmptyState = () => {
	return (
		<div className='text-center py-12'>
			<div className='text-gray-400 dark:text-gray-500 mb-4'>
				<svg
					className='mx-auto h-16 w-16'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={1}
						d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
					/>
				</svg>
			</div>
			<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
				Нет блюд
			</h3>
			<p className='text-gray-600 dark:text-gray-400 mb-6'>
				Создайте первое блюдо, чтобы начать составлять рецепты
			</p>
		</div>
	)
}
