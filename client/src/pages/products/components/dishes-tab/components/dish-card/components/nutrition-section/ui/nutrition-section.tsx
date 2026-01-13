import type { DishCalculations } from '../../../../../../../../../api'
import { NutritionCard } from '../../nutrition-card'

interface NutritionSectionProps {
	calculations: DishCalculations
}

export const NutritionSection = ({ calculations }: NutritionSectionProps) => {
	const format = (value?: number, digits = 1) =>
		typeof value === 'number' && Number.isFinite(value)
			? value.toFixed(digits)
			: '—'

	const round = (value?: number) =>
		typeof value === 'number' && Number.isFinite(value)
			? Math.round(value)
			: '—'

	const totals = calculations?.totals
	const perPortion = calculations?.perPortion
	const per100g = calculations?.per100g

	const hasAnyValues =
		totals?.kcal !== undefined ||
		totals?.proteins !== undefined ||
		totals?.fats !== undefined ||
		totals?.carbs !== undefined ||
		perPortion?.kcal !== undefined ||
		perPortion?.proteins !== undefined ||
		perPortion?.fats !== undefined ||
		perPortion?.carbs !== undefined ||
		per100g?.kcal !== undefined ||
		per100g?.proteins !== undefined ||
		per100g?.fats !== undefined ||
		per100g?.carbs !== undefined

	if (!hasAnyValues) {
		return (
			<div>
				<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
					Пищевая ценность
				</h3>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					Данные о пищевой ценности отсутствуют
				</p>
			</div>
		)
	}

	return (
		<div>
			<h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
				Пищевая ценность
			</h3>

			<div className='mb-6'>
				<h4 className='font-medium text-gray-900 dark:text-white mb-3'>
					Общие значения
				</h4>
				<div className='grid grid-cols-4 gap-4'>
					<NutritionCard label='ккал' value={round(totals?.kcal)} tone='blue' />
					<NutritionCard
						label='белки (г)'
						value={format(totals?.proteins)}
						tone='green'
					/>
					<NutritionCard
						label='жиры (г)'
						value={format(totals?.fats)}
						tone='yellow'
					/>
					<NutritionCard
						label='углеводы (г)'
						value={format(totals?.carbs)}
						tone='purple'
					/>
				</div>
			</div>

			<div className='mb-6'>
				<h4 className='font-medium text-gray-900 dark:text-white mb-3'>
					На порцию
				</h4>
				<div className='grid grid-cols-4 gap-4'>
					<NutritionCard label='ккал' value={round(perPortion?.kcal)} />
					<NutritionCard
						label='белки (г)'
						value={format(perPortion?.proteins)}
					/>
					<NutritionCard label='жиры (г)' value={format(perPortion?.fats)} />
					<NutritionCard
						label='углеводы (г)'
						value={format(perPortion?.carbs)}
					/>
				</div>
			</div>

			<div>
				<h4 className='font-medium text-gray-900 dark:text-white mb-3'>
					На 100 г продукта
				</h4>
				<div className='grid grid-cols-4 gap-4'>
					<NutritionCard label='ккал' value={round(per100g?.kcal)} />
					<NutritionCard label='белки (г)' value={format(per100g?.proteins)} />
					<NutritionCard label='жиры (г)' value={format(per100g?.fats)} />
					<NutritionCard label='углеводы (г)' value={format(per100g?.carbs)} />
				</div>
			</div>
		</div>
	)
}
