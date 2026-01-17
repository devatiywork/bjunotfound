import { CalendarCheck } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DayTimeView } from '../../day-time-view/index.ts'

const WEEKDAY_LABELS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']

const isSameDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate()

interface MonthBlock {
	month: number
	year: number
	label: string
	yearLabel: string
	weeks: (Date | null)[][]
	key: string
}

const buildMonthBlock = (year: number, month: number): MonthBlock => {
	const monthDate = new Date(year, month, 1)
	const daysCount = new Date(year, month + 1, 0).getDate()
	const startWeekday = (monthDate.getDay() + 6) % 7

	const cells: (Date | null)[] = Array.from(
		{ length: startWeekday },
		() => null
	)
	for (let d = 1; d <= daysCount; d++) {
		cells.push(new Date(year, month, d))
	}
	while (cells.length % 7 !== 0) {
		cells.push(null)
	}

	const weeks: (Date | null)[][] = []
	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7))
	}

	return {
		month,
		year,
		label: monthDate.toLocaleDateString('ru-RU', { month: 'long' }),
		yearLabel: String(year),
		weeks,
		key: `${year}-${month}`,
	}
}

const buildInitialMonths = (): MonthBlock[] => {
	const now = new Date()
	const blocks: MonthBlock[] = []

	// 12 месяцев назад до 12 месяцев вперёд
	for (let offset = -12; offset <= 12; offset++) {
		const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)
		blocks.push(buildMonthBlock(date.getFullYear(), date.getMonth()))
	}

	return blocks
}

export const MobileCalendar = memo(function MobileCalendar() {
	const [months, setMonths] = useState(() => buildInitialMonths())
	const [visibleMonth, setVisibleMonth] = useState(() => {
		const now = new Date()
		return now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
	})
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const today = useMemo(() => new Date(), [])
	const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map())

	const handleDateClick = useCallback((date: Date) => {
		setSelectedDate(date)
	}, [])

	const handleBackToCalendar = useCallback(() => {
		setSelectedDate(null)
	}, [])

	const loadMorePast = useCallback(() => {
		setMonths(current => {
			const first = current[0]
			const newBlocks: MonthBlock[] = []
			for (let i = 6; i >= 1; i--) {
				const date = new Date(first.year, first.month - i, 1)
				newBlocks.push(buildMonthBlock(date.getFullYear(), date.getMonth()))
			}
			return [...newBlocks, ...current]
		})
	}, [])

	const loadMoreFuture = useCallback(() => {
		setMonths(current => {
			const last = current[current.length - 1]
			const newBlocks: MonthBlock[] = []
			for (let i = 1; i <= 6; i++) {
				const date = new Date(last.year, last.month + i, 1)
				newBlocks.push(buildMonthBlock(date.getFullYear(), date.getMonth()))
			}
			return [...current, ...newBlocks]
		})
	}, [])

	const handleScroll = useCallback(() => {
		// Бесконечная прокрутка (используем window scroll)
		const scrollTop = window.scrollY
		const scrollHeight = document.documentElement.scrollHeight
		const clientHeight = window.innerHeight

		if (scrollTop < 500) {
			loadMorePast()
		}
		if (scrollHeight - scrollTop - clientHeight < 500) {
			loadMoreFuture()
		}

		// Определяем видимый месяц
		const headerHeight = 160
		let closestMonth = months[0]
		let closestDistance = Infinity

		monthRefs.current.forEach((el, key) => {
			const rect = el.getBoundingClientRect()
			const distance = Math.abs(rect.top - headerHeight)
			if (distance < closestDistance) {
				closestDistance = distance
				const block = months.find(m => m.key === key)
				if (block) closestMonth = block
			}
		})

		const label = `${closestMonth.label} ${closestMonth.yearLabel}`
		setVisibleMonth(label)
	}, [months, loadMorePast, loadMoreFuture])

	const handleGoToday = useCallback(() => {
		const now = new Date()
		const key = `${now.getFullYear()}-${now.getMonth()}`
		const el = monthRefs.current.get(key)
		if (el) {
			// Учитываем высоту sticky header (основной header 64px + calendar header ~130px)
			const rect = el.getBoundingClientRect()
			const scrollTop = window.scrollY + rect.top - 140
			window.scrollTo({ top: scrollTop, behavior: 'smooth' })
		}
	}, [])

	// Подписка на скролл окна (только когда календарь виден)
	useEffect(() => {
		if (selectedDate) return // Не слушаем скролл когда показываем DayTimeView
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [handleScroll, selectedDate])

	// Флаг для отслеживания первого скролла
	const hasScrolledToCurrentMonth = useRef(false)

	// Скролл к текущему месяцу при загрузке
	useEffect(() => {
		// Скроллим только при первой загрузке или при возврате из DayTimeView
		if (selectedDate) {
			hasScrolledToCurrentMonth.current = false
			return
		}

		// Если уже скроллили и просто вернулись, скроллим снова
		const now = new Date()
		const key = `${now.getFullYear()}-${now.getMonth()}`

		const scrollToCurrentMonth = () => {
			const el = monthRefs.current.get(key)
			if (el) {
				// Используем scrollTo вместо scrollIntoView для более надёжной работы
				const rect = el.getBoundingClientRect()
				const scrollTop = window.scrollY + rect.top - 130 // 130px - высота sticky header
				window.scrollTo({ top: scrollTop, behavior: 'instant' })
				hasScrolledToCurrentMonth.current = true
			}
		}

		// Увеличиваем задержку для гарантии что DOM готов
		const timeoutId = setTimeout(scrollToCurrentMonth, 100)
		return () => clearTimeout(timeoutId)
	}, [selectedDate])

	// Показываем DayTimeView если выбрана дата
	if (selectedDate) {
		return (
			<div className='md:hidden h-[calc(100vh-4rem)]'>
				<DayTimeView
					selectedDate={selectedDate}
					onBack={handleBackToCalendar}
					onDateChange={setSelectedDate}
				/>
			</div>
		)
	}

	return (
		<div className='md:hidden bg-white dark:bg-gray-900'>
			{/* Header - sticky */}
			<div className='sticky top-16 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-5 pt-4 pb-4'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white capitalize'>
						{visibleMonth}
					</h1>
					<button
						onClick={handleGoToday}
						className='p-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
						aria-label='Сегодня'
					>
						<CalendarCheck className='h-5 w-5' />
					</button>
				</div>
				{/* Weekday header */}
				<div className='grid grid-cols-7 mt-4 text-center text-sm font-medium text-gray-400 dark:text-gray-500'>
					{WEEKDAY_LABELS.map((label, i) => (
						<span key={i}>{label}</span>
					))}
				</div>
			</div>

			{/* Months content */}
			<div className='px-5 pb-24'>
				{months.map(block => (
					<div
						key={block.key}
						ref={el => {
							if (el) monthRefs.current.set(block.key, el)
						}}
						className='mt-8'
					>
						<h2 className='text-red-500 dark:text-red-400 font-semibold text-xl mb-4 capitalize'>
							{block.label}
						</h2>
						<div className='space-y-3'>
							{block.weeks.map((week, wIdx) => (
								<div key={wIdx} className='grid grid-cols-7 gap-2'>
									{week.map((day, dIdx) => {
										if (!day) {
											return <div key={`e-${dIdx}`} className='h-12' />
										}
										const isToday = isSameDay(day, today)
										return (
											<button
												key={day.toISOString()}
												onClick={() => handleDateClick(day)}
												className='flex h-12 items-center justify-center'
											>
												<span
													className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-medium transition-colors ${
														isToday
															? 'bg-red-500 text-white'
															: 'text-gray-900 dark:text-gray-100 active:bg-gray-200 dark:active:bg-gray-700'
													}`}
												>
													{day.getDate()}
												</span>
											</button>
										)
									})}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
})
