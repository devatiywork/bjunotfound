import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../api/index.ts'

interface ProtectedRouteProps {
	children: React.ReactNode
}

/**
 * Компонент для защиты маршрутов от неавторизованных пользователей
 * Если пользователь не авторизован, перенаправляет на страницу ошибки
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	if (!isAuthenticated()) {
		return <Navigate to='/app/error' replace />
	}

	return <>{children}</>
}
