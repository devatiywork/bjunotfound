import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: ReactNode
	maxWidth?:
		| 'sm'
		| 'md'
		| 'lg'
		| 'xl'
		| '2xl'
		| '3xl'
		| '4xl'
		| '5xl'
		| '6xl'
		| 'full'
}

export const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = 'md',
}: ModalProps) => {
	// Закрытие по Escape
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [isOpen, onClose])

	// Блокировка скролла body при открытии модалки
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!isOpen) return null

	const maxWidthClasses = {
		sm: 'max-w-[95vw] sm:max-w-sm',
		md: 'max-w-[95vw] sm:max-w-md',
		lg: 'max-w-[95vw] sm:max-w-lg',
		xl: 'max-w-[95vw] sm:max-w-xl',
		'2xl': 'max-w-[95vw] sm:max-w-2xl',
		'3xl': 'max-w-[95vw] sm:max-w-3xl',
		'4xl': 'max-w-[95vw] sm:max-w-5xl',
		'5xl': 'max-w-[95vw] sm:max-w-6xl',
		'6xl': 'max-w-[95vw] sm:max-w-7xl',
		full: 'max-w-[95vw] sm:max-w-[95vw]',
	}

	const modalContent = (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={`relative flex w-full flex-col ${maxWidthClasses[maxWidth]} max-h-[95vh] sm:max-h-[90vh] rounded-xl bg-white shadow-2xl dark:bg-gray-800`}
			>
				{/* Header */}
				<div className='flex shrink-0 items-center justify-between border-b border-gray-200 p-4 sm:p-6 dark:border-gray-700'>
					<h2 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
						{title}
					</h2>
					<button
						onClick={onClose}
						className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
					>
						<X className='h-5 w-5' />
					</button>
				</div>

				{/* Content - с возможностью скролла на мобильных */}
				<div className='overflow-y-auto p-4 sm:p-6'>{children}</div>
			</div>
		</div>
	)

	return createPortal(modalContent, document.body)
}
