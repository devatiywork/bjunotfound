import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
	lazy,
	memo,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { getMealEventsPeriod } from '../../../../../api/services/meal-events.ts'
import type { MealEventWithDetails } from '../../../../../api/types/meal-events.ts'
import { AddEntryModal } from '../../add-entry-modal/index.ts'
import { EventDetailModal } from '../../event-detail-modal/index.ts'
import { StatisticsPanel } from '../../statistics-panel/index.ts'
import {
	addDays,
	formatDateForApi,
	getStartOfWeek,
	HOURS,
	isSameDay,
	useIsMobile,
} from '../utils/index.ts'

// Ленивая загрузка MobileCalendar для оптимизации
const MobileCalendar = lazy(() =>
	import('../../mobile-calendar/index.ts').then(m => ({
		default: m.MobileCalendar,
	}))
)

// Ленивая загрузка EventCard
const EventCard = lazy(() =>
	import('../../event-card/index.ts').then(m => ({
		default: m.EventCard,
	}))
)

// Мемоизированный компонент строки времени
interface TimeRowProps {
	hour: number
	events: MealEventWithDetails[]
	onAddClick: (hour: number) => void
	onEventClick: (event: MealEventWithDetails) => void
}

const TimeRow = memo(function TimeRow({
	hour,
	events,
	onAddClick,
	onEventClick,
}: TimeRowProps) {
	const handleClick = useCallback(() => {
		onAddClick(hour)
	}, [hour, onAddClick])

	return (
		<div
			onClick={handleClick}
			className='group flex min-h-15 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer'
		>
			<div className='w-16 shrink-0 pr-3 text-right'>
				<span className='text-xs text-gray-400 dark:text-gray-500 relative top-0.5'>
					{hour.toString().padStart(2, '0')}:00
				</span>
			</div>
			<div className='flex-1 border-l border-gray-200 dark:border-gray-600 relative py-1 px-2'>
				{/* События */}
				{events.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						<Suspense fallback={null}>
							{events.map(event => (
								<EventCard
									key={event.id}
									event={event}
									onClick={onEventClick}
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
})

export const WeekCalendar = () => {
	const isMobile = useIsMobile()
	const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()))
	const [selectedDate, setSelectedDate] = useState(() => new Date())
	const [currentTime, setCurrentTime] = useState(() => new Date())
	const [isAddModalOpen, setIsAddModalOpen] = useState(false)
	const [selectedHour, setSelectedHour] = useState<number | null>(null)
	const [events, setEvents] = useState<MealEventWithDetails[]>([])
	const [isLoadingEvents, setIsLoadingEvents] = useState(false)
	const [selectedEvent, setSelectedEvent] =
		useState<MealEventWithDetails | null>(null)
	const [isEventDetailOpen, setIsEventDetailOpen] = useState(false)
	const [refreshTrigger, setRefreshTrigger] = useState(0)
	const today = useMemo(() => new Date(), [])

	const weekDays = useMemo(
		() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
		[weekStart]
	)

	const weekRangeLabel = useMemo(() => {
		const start = weekDays[0]
		const end = weekDays[6]
		const startLabel = start.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
		})
		const endLabel = end.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
		return `${startLabel} — ${endLabel}`
	}, [weekDays])

	// Позиция текущего времени
	const currentTimePosition = useMemo(() => {
		if (!isSameDay(selectedDate, today)) return null
		const hours = currentTime.getHours()
		const minutes = currentTime.getMinutes()
		return hours * 60 + minutes
	}, [currentTime, selectedDate, today])

	const currentTimeLabel = useMemo(() => {
		return currentTime.toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}, [currentTime])

	// Форматирование выбранной даты
	const selectedDateLabel = useMemo(() => {
		const weekday = selectedDate.toLocaleDateString('ru-RU', {
			weekday: 'long',
		})
		const dayMonth = selectedDate.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
		return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`
	}, [selectedDate])

	const handlePrevWeek = useCallback(() => {
		setWeekStart(current => addDays(current, -7))
	}, [])

	const handleNextWeek = useCallback(() => {
		setWeekStart(current => addDays(current, 7))
	}, [])

	const handleDateClick = useCallback((date: Date) => {
		setSelectedDate(date)
	}, [])

	const handleAddClick = useCallback((hour: number) => {
		setSelectedHour(hour)
		setIsAddModalOpen(true)
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsAddModalOpen(false)
		setSelectedHour(null)
	}, [])

	const handleEventClick = useCallback((event: MealEventWithDetails) => {
		setSelectedEvent(event)
		setIsEventDetailOpen(true)
	}, [])

	const handleCloseEventDetail = useCallback(() => {
		setIsEventDetailOpen(false)
		setSelectedEvent(null)
	}, [])

	// Загрузка событий за неделю
	const loadEvents = useCallback(async () => {
		if (isMobile) return

		setIsLoadingEvents(true)
		try {
			const startDate = formatDateForApi(weekStart)
			const endDate = formatDateForApi(addDays(weekStart, 6))
			const data = await getMealEventsPeriod({ startDate, endDate })
			setEvents(Array.isArray(data) ? data : [])
			// Триггерим обновление статистики
			setRefreshTrigger(prev => prev + 1)
		} catch (error) {
			console.error('Не удалось загрузить события:', error)
			setEvents([])
		} finally {
			setIsLoadingEvents(false)
		}
	}, [weekStart, isMobile])

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

	// Обновление текущего времени (только для десктопа)
	useEffect(() => {
		if (isMobile) return
		const interval = setInterval(() => {
			setCurrentTime(new Date())
		}, 60000)
		return () => clearInterval(interval)
	}, [isMobile])

	// Мобильная версия - рендерим только MobileCalendar
	if (isMobile) {
		return (
			<section className='w-full'>
				<Suspense fallback={<div className='p-4 text-center'>Загрузка...</div>}>
					<MobileCalendar />
				</Suspense>
			</section>
		)
	}

	// Десктопная версия
	return (
		<section className='w-full max-w-400 mx-auto'>
			<div className='flex gap-4'>
				{/* Desktop Week Calendar */}
				<div className='flex-1 min-w-0'>
					{/* Sticky header with dates */}
					<div className='sticky top-16 z-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6 pb-4'>
						<div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Неделя
								</p>
								<h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
									{weekRangeLabel}
								</h2>
							</div>
							<div className='flex items-center gap-2'>
								<button
									onClick={handlePrevWeek}
									className='p-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
									aria-label='Предыдущая неделя'
								>
									<ChevronLeft className='h-4 w-4' />
								</button>
								<button
									onClick={handleNextWeek}
									className='p-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
									aria-label='Следующая неделя'
								>
									<ChevronRight className='h-4 w-4' />
								</button>
							</div>
						</div>

						<div className='grid grid-cols-7 gap-2'>
							{weekDays.map(day => {
								const isToday = isSameDay(day, today)
								const isSelected = isSameDay(day, selectedDate)
								const dayOfWeek = day.getDay()
								const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

								let buttonClass =
									'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'

								if (isWeekend && !isToday && !isSelected) {
									buttonClass =
										'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
								}
								if (isToday && !isSelected) {
									buttonClass =
										'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-200'
								}
								if (isSelected) {
									buttonClass =
										'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-200'
								}

								return (
									<button
										key={day.toISOString()}
										onClick={() => handleDateClick(day)}
										className={`flex flex-col items-center justify-center rounded-lg border px-2 py-3 text-center transition-colors cursor-pointer ${buttonClass}`}
									>
										<span
											className={`text-xs uppercase tracking-wide ${
												isWeekend && !isSelected
													? 'text-red-500 dark:text-red-400'
													: 'text-gray-500 dark:text-gray-400'
											}`}
										>
											{day.toLocaleDateString('ru-RU', { weekday: 'short' })}
										</span>
										<span className='text-lg font-semibold'>
											{day.getDate()}
										</span>
									</button>
								)
							})}
						</div>

						{/* Selected date label */}
						<div className='mt-4 pt-2 border-t border-gray-200 dark:border-gray-700'>
							<p className='text-center text-gray-600 dark:text-gray-400'>
								{selectedDateLabel}
							</p>
						</div>
					</div>

					{/* Timeline - scrolls with page */}
					<div className='mt-4 pt-4 bg-white dark:bg-gray-800 rounded-lg shadow'>
						{isLoadingEvents && (
							<div className='flex justify-center py-2'>
								<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500' />
							</div>
						)}
						<div className='relative'>
							{/* Current time indicator - ПОД карточками */}
							{currentTimePosition !== null && (
								<div
									className='absolute left-0 right-0 flex items-center pointer-events-none'
									style={{ top: `${currentTimePosition}px`, zIndex: 1 }}
								>
									<div className='w-16 pr-2 text-right relative top-3'>
										<span className='text-xs font-medium text-red-500 dark:text-red-400 bg-white dark:bg-gray-800 px-1 rounded'>
											{currentTimeLabel}
										</span>
									</div>
									<div className='flex-1 flex items-center'>
										<div className='w-2 h-2 rounded-full bg-red-500' />
										<div className='flex-1 h-0.5 bg-red-500' />
									</div>
								</div>
							)}

							{/* Timeline rows - НАД индикатором */}
							<div className='relative' style={{ zIndex: 2 }}>
								{HOURS.map(hour => (
									<TimeRow
										key={hour}
										hour={hour}
										events={getEventsForHour(hour)}
										onAddClick={handleAddClick}
										onEventClick={handleEventClick}
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Statistics Panel - справа от календаря */}
				<StatisticsPanel
					startDate={formatDateForApi(weekStart)}
					endDate={formatDateForApi(addDays(weekStart, 6))}
					refreshTrigger={refreshTrigger}
				/>
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
			<EventDetailModal
				isOpen={isEventDetailOpen}
				onClose={handleCloseEventDetail}
				event={selectedEvent}
				onUpdated={loadEvents}
			/>
		</section>
	)
}
