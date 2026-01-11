import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
	ActivityPage,
	AdminPage,
	ErrorPage,
	GoalsPage,
	HomePage,
	LoginPage,
	ProductsPage,
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
				path: 'activity',
				element: (
					<ProtectedRoute>
						<ActivityPage />
					</ProtectedRoute>
				),
			},
			{
				path: 'products',
				element: (
					<ProtectedRoute>
						<ProductsPage />
					</ProtectedRoute>
				),
			},
			{
				path: 'admin',
				element: (
					<ProtectedRoute>
						<AdminPage />
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
