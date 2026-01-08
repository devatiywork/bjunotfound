import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'

interface CollapsibleSectionProps {
	/** Заголовок секции */
	title: string
	/** Описание секции (опционально) */
	description?: string
	/** Иконка секции */
	icon?: LucideIcon
	/** Содержимое секции */
	children: ReactNode
	/** Изначально свернута ли секция */
	defaultCollapsed?: boolean
	/** Цвет иконки (Tailwind классы) */
	iconColor?: string
	/** Цвет фона иконки (Tailwind классы) */
	iconBgColor?: string
}

export const CollapsibleSection = ({
	title,
	description,
	icon: Icon,
	children,
	defaultCollapsed = false,
	iconColor = 'text-blue-600 dark:text-blue-400',
	iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
}: CollapsibleSectionProps) => {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
	const [height, setHeight] = useState<number | undefined>(
		defaultCollapsed ? 0 : undefined
	)
	const [shouldRender, setShouldRender] = useState(!defaultCollapsed)
	const contentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isCollapsed) {
			// При закрытии сначала устанавливаем текущую высоту
			if (contentRef.current) {
				const contentHeight = contentRef.current.scrollHeight
				setHeight(contentHeight)

				// Затем через минимальную задержку сворачиваем до 0
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						setHeight(0)
					})
				})
			}

			// Убираем контент из DOM после завершения анимации
			const timer = setTimeout(() => {
				setShouldRender(false)
			}, 300) // Длительность анимации

			return () => clearTimeout(timer)
		} else {
			// При открытии сначала рендерим контент
			setShouldRender(true)
			setHeight(0)

			// Ждем следующий фрейм, чтобы контент отрендерился
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (contentRef.current) {
						const contentHeight = contentRef.current.scrollHeight
						setHeight(contentHeight)
					}
				})
			})

			// После завершения анимации убираем фиксированную высоту
			const timer = setTimeout(() => {
				setHeight(undefined)
			}, 300) // Длительность анимации

			return () => clearTimeout(timer)
		}
	}, [isCollapsed])

	return (
		<div className='rounded-lg bg-white shadow-md dark:bg-gray-800'>
			{/* Header with Toggle */}
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className='flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50'
			>
				<div className='flex items-center gap-3'>
					{Icon && (
						<div
							className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}
						>
							<Icon className={`h-5 w-5 ${iconColor}`} />
						</div>
					)}
					<div>
						<h2 className='text-lg font-bold text-gray-900 dark:text-white'>
							{title}
						</h2>
						{description && (
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								{description}
							</p>
						)}
					</div>
				</div>
				<ChevronDown
					className={`h-5 w-5 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${
						isCollapsed ? '' : 'rotate-180'
					}`}
				/>
			</button>

			{/* Collapsible Content */}
			<div
				ref={contentRef}
				style={{ height }}
				className='overflow-hidden transition-all duration-300 ease-in-out'
			>
				{shouldRender && (
					<div className='border-t border-gray-200 p-6 dark:border-gray-700'>
						{children}
					</div>
				)}
			</div>
		</div>
	)
}
