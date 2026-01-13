import type { DishCalculations } from '../../../../../../../../../api'

interface PriceSectionProps {
	calculations: DishCalculations
}

export const PriceSection = ({ calculations }: PriceSectionProps) => {
	const totalPrice = calculations.totals?.price
	const perPortionPrice = calculations.perPortion?.price
	const currency =
		calculations.totals?.currency || calculations.perPortion?.currency || '₽'

	const formatPrice = (value?: number) =>
		typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : '—'

	if (totalPrice === undefined && perPortionPrice === undefined) return null

	return (
		<div>
			<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
				Стоимость
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{totalPrice !== undefined && (
					<div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-green-600 dark:text-green-400'>
								{formatPrice(totalPrice)}
							</div>
							<div className='text-sm text-gray-600 dark:text-gray-400'>
								{currency} — общая стоимость
							</div>
						</div>
					</div>
				)}
				{perPortionPrice !== undefined && (
					<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
						<div className='text-center'>
							<div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
								{formatPrice(perPortionPrice)}
							</div>
							<div className='text-sm text-gray-600 dark:text-gray-400'>
								{currency} — за порцию
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
