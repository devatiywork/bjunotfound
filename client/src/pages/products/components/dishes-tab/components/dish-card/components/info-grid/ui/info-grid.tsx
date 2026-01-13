import type { Dish } from '../../../../../../../../../api'
import { DishStatusBadge } from '../../dish-status-badge'

interface InfoGridProps {
	dish: Dish
	ingredientsCount: number
}

export const InfoGrid = ({ dish, ingredientsCount }: InfoGridProps) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Статус
					</label>
					<DishStatusBadge status={dish.status} />
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Порций
					</label>
					<div className='text-gray-900 dark:text-white font-medium'>
						{dish.portions ?? '—'}
					</div>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				{ingredientsCount > 0 && (
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Ингредиентов
						</label>
						<div className='text-gray-900 dark:text-white font-medium'>
							{ingredientsCount}
						</div>
					</div>
				)}
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Статус архива
					</label>
					<span className='text-gray-900 dark:text-white'>
						{dish.isArchived ? 'В архиве' : 'Активно'}
					</span>
				</div>
			</div>
		</div>
	)
}
