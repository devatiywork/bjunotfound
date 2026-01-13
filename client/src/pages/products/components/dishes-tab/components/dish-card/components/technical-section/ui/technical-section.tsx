import type { Dish } from '../../../../../../../../../api'

interface TechnicalSectionProps {
	dish: Dish
}

export const TechnicalSection = ({ dish }: TechnicalSectionProps) => {
	const created = dish.createdAt
	const updated = dish.updatedAt

	return (
		<div className='pt-6 border-t border-gray-200 dark:border-gray-700'>
			<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-4'>
				Технические данные
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
				<div>
					<span className='text-gray-500 dark:text-gray-400'>Создано:</span>
					<p className='text-gray-900 dark:text-white font-mono'>
						{created ? new Date(created).toLocaleString('ru-RU') : '—'}
					</p>
				</div>
				<div>
					<span className='text-gray-500 dark:text-gray-400'>Обновлено:</span>
					<p className='text-gray-900 dark:text-white font-mono'>
						{updated ? new Date(updated).toLocaleString('ru-RU') : '—'}
					</p>
				</div>
			</div>
		</div>
	)
}
