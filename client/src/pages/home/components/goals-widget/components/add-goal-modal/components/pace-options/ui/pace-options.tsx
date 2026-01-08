import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Flame,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import type { PaceOption } from '../../../../../../../../../api'

interface PaceOptionsProps {
	options: PaceOption[]
	selectedPace: PaceOption | null
	onSelect: (option: PaceOption) => void
	weightDifference: number
}

export const PaceOptions = ({
	options,
	selectedPace,
	onSelect,
	weightDifference,
}: PaceOptionsProps) => {
	const isWeightLoss = weightDifference > 0

	return (
		<div className='space-y-3'>
			<div className='mb-3 flex items-center justify-between'>
				<h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
					Выберите темп {isWeightLoss ? 'похудения' : 'набора веса'}
				</h4>
				<p className='text-xs text-gray-500 dark:text-gray-400'>
					Рекомендуем средний темп
				</p>
			</div>

			<div className='grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
				{options.map(option => {
					const isSelected = selectedPace?.id === option.id
					// Рассчитываем количество недель из дней
					const weeks = Math.round(option.days / 7)
					const weeksText =
						weeks === 1
							? '1 неделя'
							: weeks < 5
							? `${weeks} недели`
							: `${weeks} недель`
					// API возвращает isRealistic: false вместо массива warnings
					const hasWarning = !option.isRealistic

					return (
						<button
							key={option.id}
							type='button'
							onClick={() => onSelect(option)}
							className={`group relative rounded-lg border-2 p-4 text-left transition-all ${
								isSelected
									? 'border-purple-500 bg-purple-50 shadow-md dark:border-purple-400 dark:bg-purple-900/30'
									: hasWarning
									? 'border-orange-300 bg-orange-50 hover:border-orange-400 hover:shadow-sm dark:border-orange-700 dark:bg-orange-900/20 dark:hover:border-orange-600'
									: 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:hover:border-purple-500'
							}`}
						>
							{/* Recommended Badge */}
							{option.isRecommended && (
								<span className='absolute -top-2 right-3 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm dark:bg-green-600'>
									Рекомендуем
								</span>
							)}

							{/* Warning Badge */}
							{hasWarning && !option.isRecommended && (
								<span className='absolute -top-2 right-3 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm dark:bg-orange-600 flex items-center gap-1'>
									<AlertTriangle className='h-3 w-3' />
									Риск
								</span>
							)}

							{/* Selected Icon */}
							{isSelected && (
								<div className='absolute -right-1 -top-1 rounded-full bg-purple-500 p-1 shadow-md dark:bg-purple-600'>
									<CheckCircle className='h-4 w-4 text-white' />
								</div>
							)}

							{/* Label */}
							<div className='mb-3 flex items-center gap-2'>
								{isWeightLoss ? (
									<TrendingDown className='h-5 w-5 text-green-600 dark:text-green-400' />
								) : (
									<TrendingUp className='h-5 w-5 text-blue-600 dark:text-blue-400' />
								)}
								<span className='font-semibold text-gray-900 dark:text-white'>
									{option.label}
								</span>
							</div>

							{/* Description */}
							<p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
								{option.description}
							</p>

							{/* Target Calories */}
							<div className='mb-2 flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-700/50'>
								<Flame className='h-4 w-4 text-orange-500 dark:text-orange-400' />
								<div className='flex-1'>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										Калории в день
									</p>
									<p className='font-bold text-gray-900 dark:text-white'>
										{option.targetCalories} ккал
									</p>
								</div>
							</div>

							{/* Duration */}
							<div className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400'>
								<Calendar className='h-4 w-4' />
								<span>{weeksText}</span>
							</div>

							{/* Warning for unrealistic goals */}
							{hasWarning && option.warning && (
								<div className='mt-2 rounded-md bg-orange-100 p-2 dark:bg-orange-900/40'>
									<p className='text-xs text-orange-800 dark:text-orange-200'>
										{option.warning}
									</p>
								</div>
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
