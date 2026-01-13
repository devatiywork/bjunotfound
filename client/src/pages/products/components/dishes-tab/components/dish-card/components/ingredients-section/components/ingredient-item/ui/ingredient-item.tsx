import { ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import type { DishItem } from '../../../../../../../../../../../api/types/dishes'

interface IngredientItemProps {
	item: DishItem
	isFirst: boolean
	isLast: boolean
	editMode: boolean
	onEdit: (item: DishItem) => void
	onDelete: (item: DishItem) => void
	onMoveUp: (item: DishItem) => void
	onMoveDown: (item: DishItem) => void
}

export const IngredientItem = ({
	item,
	isFirst,
	isLast,
	editMode,
	onEdit,
	onDelete,
	onMoveUp,
	onMoveDown,
}: IngredientItemProps) => {
	const productName = item.productUser?.names?.[0]?.name || 'Продукт'
	const pkg = item.productUser?.packages?.[0]
	const currency = pkg?.currency

	const displayAmount = useMemo(() => {
		if (item.measureType === 'GRAMS') return `${item.amountG} г`
		if (item.measureType === 'MILLILITERS') return `${item.amountMl} мл`
		if (item.measureType === 'SERVINGS') {
			// Try to find serving name from the item.serving (if populated)
			const servingName = (item as any).serving?.name
			if (servingName) {
				return `${item.servingsCount} × ${servingName}`
			}
			return `${item.servingsCount} порц.`
		}
		return ''
	}, [item])

	const nutrition = useMemo(() => {
		if (!item.productUser?.nutrition) return null
		const { caloriesKcal, proteinsG, fatsG, carbohydratesG } =
			item.productUser.nutrition

		let ratio = 0
		if (item.measureType === 'GRAMS') {
			ratio = (item.amountG || 0) / 100
		} else if (item.measureType === 'MILLILITERS') {
			ratio = (item.amountMl || 0) / 100
		} else if (item.measureType === 'SERVINGS') {
			// Для порций: используем данные из serving если есть
			const serving = (item as any).serving
			if (serving) {
				const servingWeight = serving.weightG || serving.volumeMl || 0
				ratio = ((item.servingsCount || 0) * servingWeight) / 100
			} else {
				return null
			}
		}

		if (ratio === 0) return null

		return {
			kcal: Math.round(caloriesKcal * ratio),
			proteins: Math.round(proteinsG * ratio * 10) / 10,
			fats: Math.round(fatsG * ratio * 10) / 10,
			carbs: Math.round(carbohydratesG * ratio * 10) / 10,
		}
	}, [item])

	// Расчет цены ингредиента
	const ingredientPrice = useMemo(() => {
		if (!pkg || !pkg.priceTotal) return null

		const packageWeight = pkg.totalWeightG || pkg.totalVolumeMl
		if (!packageWeight || packageWeight <= 0) return null

		let ingredientAmount = 0
		if (item.measureType === 'GRAMS') {
			ingredientAmount = item.amountG || 0
		} else if (item.measureType === 'MILLILITERS') {
			ingredientAmount = item.amountMl || 0
		} else if (item.measureType === 'SERVINGS') {
			// Для порций: используем serving weight/volume
			const serving = (item as any).serving
			if (serving) {
				const servingWeight = serving.weightG || serving.volumeMl || 0
				ingredientAmount = (item.servingsCount || 0) * servingWeight
			}
		}

		if (ingredientAmount <= 0) return null

		const pricePerUnit = pkg.priceTotal / packageWeight
		return Math.round(pricePerUnit * ingredientAmount * 100) / 100
	}, [item, pkg])

	return (
		<div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors'>
			<div className='flex items-center gap-3 flex-1 min-w-0'>
				<div className='min-w-0 flex-1'>
					<div className='font-medium text-gray-900 dark:text-white truncate'>
						{productName}
					</div>
					<div className='text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2'>
						{nutrition ? (
							<span className='text-blue-600 dark:text-blue-400'>
								{nutrition.kcal} ккал • {nutrition.proteins} Б •{' '}
								{nutrition.fats} Ж • {nutrition.carbs} У
							</span>
						) : (
							<span>{item.productUser.nutrition.caloriesKcal} ккал / 100г</span>
						)}
					</div>
					{item.note && (
						<div className='text-xs text-gray-400 italic mt-0.5'>
							{item.note}
						</div>
					)}
				</div>
			</div>

			<div className='flex items-center gap-3 ml-3'>
				<div className='text-right whitespace-nowrap'>
					<div className='font-medium text-gray-900 dark:text-white'>
						{displayAmount}
					</div>
					{ingredientPrice !== null && currency && (
						<div className='text-xs text-green-600 dark:text-green-400'>
							{ingredientPrice} {currency}
						</div>
					)}
				</div>

				{editMode && (
					<div className='flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-600 ml-2'>
						<div className='flex flex-col mr-1'>
							<button
								onClick={() => onMoveUp(item)}
								disabled={isFirst}
								className='p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30'
								aria-label='Move up'
							>
								<ArrowUp size={14} />
							</button>
							<button
								onClick={() => onMoveDown(item)}
								disabled={isLast}
								className='p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30'
								aria-label='Move down'
							>
								<ArrowDown size={14} />
							</button>
						</div>
						<button
							onClick={() => onEdit(item)}
							className='p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded'
							aria-label='Edit'
						>
							<Edit2 size={16} />
						</button>
						<button
							onClick={() => onDelete(item)}
							className='p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded'
							aria-label='Delete'
						>
							<Trash2 size={16} />
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
