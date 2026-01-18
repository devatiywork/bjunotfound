import { BarChart3, ChevronLeft, Plus } from 'lucide-react'
import {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { getMealEventsPeriod } from '../../../../../api/services/meal-events.ts'
import type { MealEventWithDetails } from '../../../../../api/types/meal-events.ts'
import { AddEntryModal } from '../../add-entry-modal/index.ts'
import { StatisticsModal } from '../../statistics-panel/index.ts'

const EventCard = lazy(() =>
	import('../../event-card/index.ts').then(m => ({ default: m.EventCard }))
)
const EventDetailModal = lazy(() =>
	import('../../event-detail-modal/index.ts').then(m => ({
		default: m.EventDetailModal,
	}))
)

const WEEKDAY_LABELS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']

const getStartOfWeek = (date: Date) => {
	const start = new Date(date)
	const dayIndex = (start.getDay() + 6) % 7
	start.setDate(start.getDate() - dayIndex)
	start.setHours(0, 0, 0, 0)
	return start
}

const addDays = (date: Date, days: number) => {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

const isSameDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate()

// Форматирование даты в локальном времени для API (YYYY-MM-DD)
const formatLocalDate = (date: Date): string => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	return `${year}-${month}-${day}`
}

interface DayTimeViewProps {
	selectedDate: Date
	onBack: () => void
	onDateChange: (date: Date) => void
}

export const DayTimeView = ({
	selectedDate,
	onBack,
	onDateChange,
}: DayTimeViewProps) => {
	const today = useMemo(() => new Date(), [])
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [selectedHour, setSelectedHour] = useState<number | null>(null)
	const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
	const timelineRef = useRef<HTMLDivElement>(null)

	// События
	const [events, setEvents] = useState<MealEventWithDetails[]>([])
	const [isLoadingEvents, setIsLoadingEvents] = useState(false)
	const [selectedEvent, setSelectedEvent] =
		useState<MealEventWithDetails | null>(null)
	const [isEventDetailOpen, setIsEventDetailOpen] = useState(false)

	// Дни текущей недели выбранной даты
	const weekStart = useMemo(() => getStartOfWeek(selectedDate), [selectedDate])
	const weekDays = useMemo(
		() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
		[weekStart]
	)

	// Часы для временной шкалы (0-23)
	const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])

	// Форматирование даты для заголовка
	const dateLabel = useMemo(() => {
		const weekday = selectedDate.toLocaleDateString('ru-RU', {
			weekday: 'long',
		})
		const dayMonth = selectedDate.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		})
		return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} — ${dayMonth}`
	}, [selectedDate])

	// Название месяца для кнопки "назад"
	const monthLabel = useMemo(() => {
		return selectedDate.toLocaleDateString('ru-RU', { month: 'long' })
	}, [selectedDate])

	// Скролл к текущему времени при загрузке
	useEffect(() => {
		if (timelineRef.current && isSameDay(selectedDate, today)) {
			const now = new Date()
			const scrollPosition = (now.getHours() - 2) * 60 // скролл к текущему часу минус 2 часа
			timelineRef.current.scrollTop = Math.max(0, scrollPosition)
		}
	}, [selectedDate, today])

	// Загрузка событий при изменении недели
	const loadEvents = useCallback(async () => {
		setIsLoadingEvents(true)
		try {
			const weekEnd = addDays(weekStart, 6)
			const startDate = formatLocalDate(weekStart)
			const endDate = formatLocalDate(weekEnd)

			const data = await getMealEventsPeriod({ startDate, endDate })
			setEvents(Array.isArray(data) ? data : [])
		} catch (error) {
			console.error('Ошибка загрузки событий:', error)
			setEvents([])
		} finally {
			setIsLoadingEvents(false)
		}
	}, [weekStart])

	// Загрузка при изменении недели
	useEffect(() => {
		loadEvents()
	}, [loadEvents])

	// Фильтрация событий по выбранной дате и часу
	const getEventsForHour = useCallback(
		(hour: number): MealEventWithDetails[] => {
			if (!Array.isArray(events)) return []
			return events.filter(event => {
				const eventDate = new Date(event.startAt)
				return (
					isSameDay(eventDate, selectedDate) && eventDate.getHours() === hour
				)
			})
		},
		[events, selectedDate]
	)

	// Клик по событию
	const handleEventClick = useCallback((event: MealEventWithDetails) => {
		setSelectedEvent(event)
		setIsEventDetailOpen(true)
	}, [])

	const handleCloseEventDetail = useCallback(() => {
		setIsEventDetailOpen(false)
		setSelectedEvent(null)
	}, [])

	const handleAddClick = useCallback((hour: number) => {
		setSelectedHour(hour)
		setIsAddModalOpen(true)
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsAddModalOpen(false)
		setSelectedHour(null)
	}, [])

	// Даты для статистики (начало и конец недели)
	const statsDateRange = useMemo(() => {
		const weekEnd = addDays(weekStart, 6)
		return {
			startDate: formatLocalDate(weekStart),
			endDate: formatLocalDate(weekEnd),
		}
	}, [weekStart])

	return (
		<div className='flex flex-col h-full bg-white dark:bg-gray-900'>
			{/* Header */}
			<div className='sticky top-16 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'>
				{/* Back button and month */}
				<div className='flex items-center px-4 py-3'>
					<button
						onClick={onBack}
						className='flex items-center text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors'
					>
						<ChevronLeft className='h-5 w-5' />
						<span className='text-lg capitalize'>{monthLabel}</span>
					</button>
				</div>

				{/* Week strip */}
				<div className='grid grid-cols-7 px-4 pb-3'>
					{weekDays.map((day, idx) => {
						const isSelected = isSameDay(day, selectedDate)
						const isToday = isSameDay(day, today)
						return (
							<button
								key={day.toISOString()}
								onClick={() => onDateChange(day)}
								className='flex flex-col items-center py-1'
							>
								<span className='text-xs font-medium text-gray-400 dark:text-gray-500 mb-1'>
									{WEEKDAY_LABELS[idx]}
								</span>
								<span
									className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-medium transition-colors ${
										isSelected
											? 'bg-red-500 text-white'
											: isToday
											? 'text-red-500 dark:text-red-400'
											: 'text-gray-900 dark:text-gray-100'
									}`}
								>
									{day.getDate()}
								</span>
							</button>
						)
					})}
				</div>

				{/* Date label */}
				<div className='px-4 py-2 border-t border-gray-100 dark:border-gray-800'>
					<p className='text-center text-gray-600 dark:text-gray-400 text-sm'>
						{dateLabel}
					</p>
				</div>
			</div>

			{/* Timeline */}
			<div
				ref={timelineRef}
				className='flex-1 overflow-y-auto'
				style={{ scrollBehavior: 'smooth' }}
			>
				{isLoadingEvents && (
					<div className='flex justify-center py-2'>
						<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500' />
					</div>
				)}
				<div className='relative'>
					{/* Timeline rows */}
					<div className='relative'>
						{hours.map(hour => {
							const hourEvents = getEventsForHour(hour)
							return (
								<div
									key={hour}
									onClick={() => handleAddClick(hour)}
									className='group flex min-h-15 border-b border-gray-100 dark:border-gray-800 cursor-pointer'
								>
									<div className='w-16 shrink-0 pr-3 text-right'>
										<span className='text-xs text-gray-400 dark:text-gray-500 relative top-2'>
											{hour.toString().padStart(2, '0')}:00
										</span>
									</div>
									<div className='flex-1 border-l border-gray-200 dark:border-gray-700 relative py-1 px-2'>
										{/* События */}
										{hourEvents.length > 0 ? (
											<div className='flex flex-wrap gap-2'>
												<Suspense fallback={null}>
													{hourEvents.map(event => (
														<EventCard
															key={event.id}
															event={event}
															onClick={handleEventClick}
														/>
													))}
												</Suspense>
											</div>
										) : (
											<div
												className='absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-blue-500 text-white shadow-md pointer-events-none'
												aria-hidden='true'
											>
												<Plus className='h-4 w-4' />
											</div>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			{/* Bottom bar - Today button + Stats button */}
			<div className='sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 safe-area-inset-bottom'>
				<div className='flex items-center gap-2'>
					<button
						onClick={() => onDateChange(today)}
						className='px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium'
					>
						Сегодня
					</button>
					<button
						onClick={() => setIsStatsModalOpen(true)}
						className='flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium'
					>
						<BarChart3 className='w-4 h-4' />
						Статистика
					</button>
				</div>
			</div>

			{/* Modal для добавления записи */}
			<AddEntryModal
				isOpen={isAddModalOpen}
				onClose={handleCloseModal}
				selectedDate={selectedDate}
				selectedHour={selectedHour}
				onCreated={loadEvents}
			/>

			{/* Modal для просмотра события */}
			<Suspense fallback={null}>
				<EventDetailModal
					isOpen={isEventDetailOpen}
					onClose={handleCloseEventDetail}
					event={selectedEvent}
					onUpdated={loadEvents}
				/>
			</Suspense>

			{/* Modal статистики */}
			<StatisticsModal
				isOpen={isStatsModalOpen}
				onClose={() => setIsStatsModalOpen(false)}
				startDate={statsDateRange.startDate}
				endDate={statsDateRange.endDate}
			/>
		</div>
	)
}
