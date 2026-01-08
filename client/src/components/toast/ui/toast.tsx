import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
	id: string
	type: ToastType
	message: string
}

interface ToastContextType {
	showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
	const context = useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within ToastProvider')
	}
	return context
}

interface ToastProviderProps {
	children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const showToast = useCallback((message: string, type: ToastType = 'info') => {
		const id = Math.random().toString(36).substring(7)
		setToasts(prev => [...prev, { id, type, message }])

		// Автоматически убираем уведомление через 5 секунд
		setTimeout(() => {
			setToasts(prev => prev.filter(toast => toast.id !== id))
		}, 5000)
	}, [])

	const removeToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}

			{/* Контейнер для уведомлений */}
			<div className='fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm'>
				{toasts.map(toast => (
					<ToastItem
						key={toast.id}
						toast={toast}
						onClose={() => removeToast(toast.id)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	)
}

interface ToastItemProps {
	toast: Toast
	onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
	const icons = {
		success: (
			<CheckCircle className='w-5 h-5 text-green-500 dark:text-green-400' />
		),
		error: <XCircle className='w-5 h-5 text-red-500 dark:text-red-400' />,
		warning: (
			<AlertTriangle className='w-5 h-5 text-yellow-500 dark:text-yellow-400' />
		),
		info: <Info className='w-5 h-5 text-blue-500 dark:text-blue-400' />,
	}

	const bgColors = {
		success:
			'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
		error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
		warning:
			'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
		info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
	}

	return (
		<div
			className={`
				flex items-start gap-3 p-4 rounded-lg border shadow-lg
				${bgColors[toast.type]}
				animate-slide-in
			`}
		>
			<div className='shrink-0 mt-0.5'>{icons[toast.type]}</div>
			<p className='flex-1 text-sm text-gray-900 dark:text-white'>
				{toast.message}
			</p>
			<button
				onClick={onClose}
				className='shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
			>
				<X className='w-4 h-4' />
			</button>
		</div>
	)
}
