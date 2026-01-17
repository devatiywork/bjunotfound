import { memo, useCallback } from 'react'
import type { MealEventWithDetails } from '../../../../../api/types/meal-events.ts'

interface EventCardProps {
	event: MealEventWithDetails
	onClick: (event: MealEventWithDetails) => void
}

const STATUS_COLORS: Record<string, string> = {
	PLANNED: 'border-l-blue-500 bg-blue-100 dark:bg-blue-900',
	COMPLETED: 'border-l-green-500 bg-green-100 dark:bg-green-900',
	SKIPPED: 'border-l-gray-400 bg-gray-100 dark:bg-gray-700 opacity-60',
}

export const EventCard = memo(function EventCard({
	event,
	onClick,
}: EventCardProps) {
	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			onClick(event)
		},
		[event, onClick]
	)

	const colorClass = STATUS_COLORS[event.status] || STATUS_COLORS.PLANNED

	return (
		<button
			onClick={handleClick}
			className={`relative z-10 flex items-center gap-3 px-3 py-2 rounded-lg border-l-4 ${colorClass} hover:shadow-md transition-shadow cursor-pointer text-left min-w-0`}
		>
			{/* Миниатюра */}
			{event.dish.photos && event.dish.photos.length > 0 ? (
				<img
					src={event.dish.photos[0]}
					alt={event.dish.name}
					className='w-12 h-12 rounded-lg object-cover shrink-0'
				/>
			) : (
				<div className='w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 shrink-0' />
			)}

			{/* Название и порции */}
			<div className='min-w-0 flex-1'>
				<p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
					{event.dish.name}
				</p>
				<p className='text-xs text-gray-500 dark:text-gray-400'>
					{event.portions} порц.
				</p>
			</div>
		</button>
	)
})
