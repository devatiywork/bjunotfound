import { useEffect, useState } from 'react'

/**
 * Хук для определения мобильного устройства (ширина < 768px)
 */
export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(() =>
		typeof window !== 'undefined' ? window.innerWidth < 768 : false
	)

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return isMobile
}

/**
 * Получить начало недели (понедельник) для указанной даты
 */
export const getStartOfWeek = (date: Date) => {
	const start = new Date(date)
	const dayIndex = (start.getDay() + 6) % 7
	start.setDate(start.getDate() - dayIndex)
	start.setHours(0, 0, 0, 0)
	return start
}

/**
 * Добавить указанное количество дней к дате
 */
export const addDays = (date: Date, days: number) => {
	const next = new Date(date)
	next.setDate(next.getDate() + days)
	return next
}

/**
 * Проверить, являются ли две даты одним днём
 */
export const isSameDay = (left: Date, right: Date) =>
	left.getFullYear() === right.getFullYear() &&
	left.getMonth() === right.getMonth() &&
	left.getDate() === right.getDate()

/**
 * Форматировать дату для API запроса (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	return `${year}-${month}-${day}`
}

/**
 * Массив часов для временной шкалы (0-23)
 */
export const HOURS = Array.from({ length: 24 }, (_, i) => i)
