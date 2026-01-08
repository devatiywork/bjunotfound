interface ProgressBarProps {
	value: number // 0-100
	label?: string
	color?: 'purple' | 'blue' | 'green' | 'orange' | 'red'
	showPercentage?: boolean
	height?: 'sm' | 'md' | 'lg'
}

export const ProgressBar = ({
	value,
	label,
	color = 'purple',
	showPercentage = true,
	height = 'md',
}: ProgressBarProps) => {
	// Ограничиваем значение в диапазоне 0-100
	const normalizedValue = Math.min(Math.max(value, 0), 100)

	// Цвета для разных вариантов
	const colorClasses = {
		purple: 'bg-purple-600 dark:bg-purple-500',
		blue: 'bg-blue-600 dark:bg-blue-500',
		green: 'bg-green-600 dark:bg-green-500',
		orange: 'bg-orange-600 dark:bg-orange-500',
		red: 'bg-red-600 dark:bg-red-500',
	}

	// Высота прогресс-бара
	const heightClasses = {
		sm: 'h-2',
		md: 'h-3',
		lg: 'h-4',
	}

	return (
		<div className='w-full'>
			{/* Label и процент */}
			{(label || showPercentage) && (
				<div className='mb-2 flex items-center justify-between text-sm'>
					{label && (
						<span className='font-medium text-gray-700 dark:text-gray-300'>
							{label}
						</span>
					)}
					{showPercentage && (
						<span className='text-gray-600 dark:text-gray-400'>
							{normalizedValue}%
						</span>
					)}
				</div>
			)}

			{/* Progress bar */}
			<div
				className={`w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${heightClasses[height]}`}
			>
				<div
					className={`${heightClasses[height]} rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
					style={{ width: `${normalizedValue}%` }}
				/>
			</div>
		</div>
	)
}
