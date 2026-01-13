import type { DishStatus } from '../../../../../../../../../api'

interface DishStatusBadgeProps {
	status: DishStatus
}

const statusConfig: Record<
	DishStatus,
	{ label: string; tone: 'green' | 'yellow' }
> = {
	DRAFT: { label: 'Черновик', tone: 'yellow' },
	READY: { label: 'Готово', tone: 'green' },
}

const toneClasses: Record<'green' | 'yellow', string> = {
	green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
	yellow:
		'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
}

export const DishStatusBadge = ({ status }: DishStatusBadgeProps) => {
	const config = statusConfig[status] ?? { label: status, tone: 'green' }

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				toneClasses[config.tone]
			}`}
		>
			{config.label}
		</span>
	)
}
