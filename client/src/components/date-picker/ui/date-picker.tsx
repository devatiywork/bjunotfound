import { Calendar } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface DatePickerProps {
	label?: string
	error?: string
	onChange: (date: Date | null) => void
	selected?: Date | null
	placeholderText?: string
	maxDate?: Date
	minDate?: Date
	disabled?: boolean
	required?: boolean
}

const MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
]

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const DatePicker = ({
	label,
	error,
	onChange,
	selected,
	placeholderText = 'Выберите дату',
	maxDate,
	minDate,
	disabled,
}: DatePickerProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const today = new Date()
	const defaultDate = selected || today
	const [currentMonth, setCurrentMonth] = useState(defaultDate.getMonth())
	const [currentYear, setCurrentYear] = useState(defaultDate.getFullYear())
	const containerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })

	// Не устанавливаем дату автоматически - пользователь должен сам выбрать

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Обновляем позицию календаря при открытии и скролле
	useEffect(() => {
		const updatePosition = () => {
			if (isOpen && buttonRef.current) {
				const rect = buttonRef.current.getBoundingClientRect()
				setCalendarPosition({
					top: rect.bottom + 8,
					left: rect.left,
				})
			}
		}

		if (isOpen) {
			updatePosition()
			window.addEventListener('scroll', updatePosition, true)
			window.addEventListener('resize', updatePosition)

			return () => {
				window.removeEventListener('scroll', updatePosition, true)
				window.removeEventListener('resize', updatePosition)
			}
		}
	}, [isOpen])

	const getDaysInMonth = (year: number, month: number) => {
		return new Date(year, month + 1, 0).getDate()
	}

	const getFirstDayOfMonth = (year: number, month: number) => {
		const day = new Date(year, month, 1).getDay()
		return day === 0 ? 6 : day - 1
	}

	const handleDateClick = (day: number) => {
		const newDate = new Date(currentYear, currentMonth, day)
		onChange(newDate)
		setIsOpen(false)
	}

	const handlePrevMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11)
			setCurrentYear(currentYear - 1)
		} else {
			setCurrentMonth(currentMonth - 1)
		}
	}

	const handleNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0)
			setCurrentYear(currentYear + 1)
		} else {
			setCurrentMonth(currentMonth + 1)
		}
	}

	const isDateDisabled = (day: number) => {
		const date = new Date(currentYear, currentMonth, day)
		if (minDate && date < minDate) return true
		if (maxDate && date > maxDate) return true
		return false
	}

	const isToday = (day: number) => {
		const today = new Date()
		return (
			day === today.getDate() &&
			currentMonth === today.getMonth() &&
			currentYear === today.getFullYear()
		)
	}

	const isSelected = (day: number) => {
		if (!selected) return false
		return (
			day === selected.getDate() &&
			currentMonth === selected.getMonth() &&
			currentYear === selected.getFullYear()
		)
	}

	const formatDate = (date: Date) => {
		return date.toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
	}

	const renderCalendar = () => {
		const daysInMonth = getDaysInMonth(currentYear, currentMonth)
		const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
		const days = []

		// Empty cells before first day
		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className='p-2' />)
		}

		// Days of month
		for (let day = 1; day <= daysInMonth; day++) {
			const disabled = isDateDisabled(day)
			const today = isToday(day)
			const selectedDay = isSelected(day)

			days.push(
				<button
					key={day}
					type='button'
					onClick={() => !disabled && handleDateClick(day)}
					disabled={disabled}
					className={`
						relative p-2 text-sm font-medium rounded-lg transition-all duration-200
						${
							selectedDay
								? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 dark:from-blue-600 dark:via-blue-700 dark:to-purple-700 text-white font-bold shadow-lg shadow-blue-500/50 dark:shadow-blue-900/50 scale-110 ring-2 ring-blue-400/50 dark:ring-blue-500/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
								: today
								? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-400 dark:ring-blue-500 ring-inset shadow-inner'
								: 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-700/50 hover:scale-105 hover:shadow-md'
						}
						${
							disabled
								? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:scale-100 hover:shadow-none'
								: 'cursor-pointer active:scale-95'
						}
					`}
				>
					{day}
				</button>
			)
		}

		return days
	}

	const renderYearSelector = () => {
		const currentYearVal = new Date().getFullYear()
		const years = []
		for (let i = currentYearVal; i >= currentYearVal - 100; i--) {
			years.push(i)
		}

		return (
			<select
				value={currentYear}
				onChange={e => setCurrentYear(parseInt(e.target.value))}
				className='px-3 py-1.5 text-sm font-bold bg-white/20 dark:bg-gray-700/50 text-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-all duration-200 backdrop-blur-sm'
			>
				{years.map(year => (
					<option
						key={year}
						value={year}
						className='text-gray-900 dark:text-white bg-white dark:bg-gray-800'
					>
						{year}
					</option>
				))}
			</select>
		)
	}

	return (
		<div className='w-full' ref={containerRef}>
			{label && (
				<label className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
					{label}
				</label>
			)}
			<div className='relative'>
				<button
					ref={buttonRef}
					type='button'
					onClick={() => !disabled && setIsOpen(!isOpen)}
					disabled={disabled}
					className='group w-full px-4 py-2.5 text-sm font-medium text-left text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md'
				>
					<span
						className={
							!selected ? 'text-gray-500 dark:text-gray-400' : 'font-semibold'
						}
					>
						{selected ? formatDate(selected) : placeholderText}
					</span>
					<Calendar className='w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200' />
				</button>

				{isOpen && (
					<div
						className='fixed z-50 w-full sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden'
						style={{
							top: `${calendarPosition.top}px`,
							left: `${calendarPosition.left}px`,
							width: buttonRef.current?.offsetWidth || 'auto',
						}}
					>
						{/* Header with gradient */}
						<div className='bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 dark:from-blue-600 dark:via-blue-700 dark:to-purple-700 px-4 py-4 relative overflow-hidden'>
							{/* Декоративные элементы */}
							<div className='absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50'></div>
							<div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl'></div>
							<div className='absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl'></div>
							<div className='flex items-center justify-between mb-2 relative z-10'>
								<button
									type='button'
									onClick={handlePrevMonth}
									className='p-2 text-white hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm'
								>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 19l-7-7 7-7'
										/>
									</svg>
								</button>
								<div className='flex items-center gap-2'>
									<select
										value={currentMonth}
										onChange={e => setCurrentMonth(parseInt(e.target.value))}
										className='px-3 py-1.5 text-sm font-bold bg-white/20 dark:bg-gray-700/50 text-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-all duration-200 backdrop-blur-sm'
									>
										{MONTHS.map((month, index) => (
											<option
												key={month}
												value={index}
												className='text-gray-900 dark:text-white bg-white dark:bg-gray-800'
											>
												{month}
											</option>
										))}
									</select>
									{renderYearSelector()}
								</div>
								<button
									type='button'
									onClick={handleNextMonth}
									className='p-2 text-white hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm'
								>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 5l7 7-7 7'
										/>
									</svg>
								</button>
							</div>
						</div>

						{/* Calendar body */}
						<div className='p-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/20'>
							{/* Weekday headers */}
							<div className='grid grid-cols-7 gap-1 mb-3'>
								{WEEKDAYS.map(day => (
									<div
										key={day}
										className='text-center text-xs font-bold text-gray-700 dark:text-gray-300 p-2 uppercase tracking-wider'
									>
										{day}
									</div>
								))}
							</div>

							{/* Days grid */}
							<div className='grid grid-cols-7 gap-1'>{renderCalendar()}</div>
						</div>
					</div>
				)}
			</div>

			{error && (
				<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{error}</p>
			)}
		</div>
	)
}
