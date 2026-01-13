import type { DishItem } from '../../../../../../../../../api'

interface IngredientsSectionProps {
	items: DishItem[]
}

export const IngredientsSection = ({ items }: IngredientsSectionProps) => {
	return (
		<div>
			<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
				Состав блюда
			</h3>
			<div className='space-y-3'>
				{items.map(item => (
					<div
						key={item.id}
						className='flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'
					>
						<div>
							<div className='font-medium text-gray-900 dark:text-white'>
								{item.productUser?.names?.[0]?.name || 'Продукт'}
							</div>
							{item.productUser?.packages?.[0]?.currency && (
								<div className='text-xs text-gray-500 dark:text-gray-400'>
									Валюта: {item.productUser.packages[0].currency}
								</div>
							)}
						</div>
						<div className='text-right'>
							<div className='font-medium text-gray-900 dark:text-white'>
								{item.measureType === 'MILLILITERS'
									? `${item.amountMl ?? 0} мл`
									: item.measureType === 'SERVINGS'
									? `${item.servingsCount ?? 0} порц.`
									: `${item.amountG ?? 0} г`}
							</div>
							{item.note && (
								<div className='text-xs text-gray-500 dark:text-gray-400'>
									{item.note}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
