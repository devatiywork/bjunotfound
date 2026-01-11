import { AlertTriangle, X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	message: string | ReactNode
	confirmText?: string
	cancelText?: string
	variant?: 'danger' | 'warning' | 'info'
	loading?: boolean
}

export const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = 'Подтвердить',
	cancelText = 'Отмена',
	variant = 'danger',
	loading = false,
}: ConfirmModalProps) => {
	// Закрытие по Escape
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen && !loading) {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [isOpen, onClose, loading])

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

	const variantStyles = {
		danger: {
			icon: 'text-red-600 dark:text-red-500',
			iconBg: 'bg-red-100 dark:bg-red-900/30',
			button:
				'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white disabled:cursor-not-allowed',
		},
		warning: {
			icon: 'text-yellow-600 dark:text-yellow-500',
			iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
			button:
				'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white disabled:cursor-not-allowed',
		},
		info: {
			icon: 'text-blue-600 dark:text-blue-500',
			iconBg: 'bg-blue-100 dark:bg-blue-900/30',
			button:
				'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white disabled:cursor-not-allowed',
		},
	}

	const styles = variantStyles[variant]

	const handleConfirm = () => {
		if (!loading) {
			onConfirm()
		}
	}

	const modalContent = (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			{/* Backdrop */}
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={() => !loading && onClose()}
			/>

			{/* Modal */}
			<div className='relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md'>
				{/* Header */}
				<div className='flex items-start gap-4 p-6 pb-4'>
					<div className={`${styles.iconBg} p-3 rounded-full shrink-0`}>
						<AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
					</div>
					<div className='flex-1 min-w-0'>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
							{title}
						</h3>
						<div className='text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line'>
							{message}
						</div>
					</div>
					<button
						onClick={onClose}
						disabled={loading}
						className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50'
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				{/* Footer */}
				<div className='flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg'>
					<button
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50'
					>
						{cancelText}
					</button>
					<button
						onClick={handleConfirm}
						disabled={loading}
						className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
					>
						{loading ? 'Загрузка...' : confirmText}
					</button>
				</div>
			</div>
		</div>
	)

	return createPortal(modalContent, document.body)
}
