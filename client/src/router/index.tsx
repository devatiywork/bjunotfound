import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
	ActivityPage,
	ErrorPage,
	GoalsPage,
	HomePage,
	LoginPage,
	Products,
	ProfilePage,
	RegisterPage,
} from '../pages/index.ts'
import { ProtectedRoute } from './ProtectedRoute.tsx'

/**
 * Конфигурация роутинга приложения
 * Все маршруты SPA имеют префикс /app
 */
export const router = createBrowserRouter([
	{
		path: '/',
		element: <Navigate to='/app/login' replace />,
	},
	{
		path: '/app',
		children: [
			{
				path: 'login',
				element: <LoginPage />,
			},
			{
				path: 'register',
				element: <RegisterPage />,
			},
			{
				path: 'error',
				element: <ErrorPage />,
			},
			{
				path: 'home',
				element: (
					<ProtectedRoute>
						<HomePage />
					</ProtectedRoute>
				),
			},
			{
				path: 'profile',
				element: (
					<ProtectedRoute>
						<ProfilePage />
					</ProtectedRoute>
				),
			},
			{
				path: 'goals',
				element: (
					<ProtectedRoute>
						<GoalsPage />
					</ProtectedRoute>
				),
			},
			{
				path: 'products',
				element: (
					<ProtectedRoute>
						<Products />
					</ProtectedRoute>
				),
			},
			{
				path: 'activity',
				element: (
					<ProtectedRoute>
						<ActivityPage />
					</ProtectedRoute>
				),
			},
			// Редирект на login по умолчанию
			{
				path: '',
				element: <Navigate to='/app/login' replace />,
			},
		],
	},
	// Обработка несуществующих маршрутов
	{
		path: '*',
		element: <Navigate to='/app/error' replace />,
	},
])
