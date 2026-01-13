interface NutritionCardProps {
	label: string
	value: string | number
	tone?: 'blue' | 'green' | 'yellow' | 'purple'
}

export const NutritionCard = ({ label, value, tone }: NutritionCardProps) => {
	const toneMap: Record<NonNullable<typeof tone>, string> = {
		blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
		green:
			'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
		yellow:
			'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
		purple:
			'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
	}

	const classes = tone
		? toneMap[tone]
		: 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'

	return (
		<div className={`text-center p-3 rounded-lg ${classes}`}>
			<div className='text-xl font-semibold'>{value}</div>
			<div className='text-sm text-gray-600 dark:text-gray-400'>{label}</div>
		</div>
	)
}
