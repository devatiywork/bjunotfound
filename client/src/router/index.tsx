import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute.tsx'

// Lazy loaded pages
const LoginPage = lazy(() =>
	import('../pages/login/index.ts').then(m => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
	import('../pages/register/index.ts').then(m => ({ default: m.RegisterPage }))
)
const ErrorPage = lazy(() =>
	import('../pages/error/index.ts').then(m => ({ default: m.ErrorPage }))
)
const HomePage = lazy(() =>
	import('../pages/home/index.ts').then(m => ({ default: m.HomePage }))
)
const ProfilePage = lazy(() =>
	import('../pages/profile/index.ts').then(m => ({ default: m.ProfilePage }))
)
const GoalsPage = lazy(() =>
	import('../pages/goals/index.ts').then(m => ({ default: m.GoalsPage }))
)
const ActivityPage = lazy(() =>
	import('../pages/activity/index.ts').then(m => ({ default: m.ActivityPage }))
)
const NutritionChartPage = lazy(() =>
	import('../pages/nutrition-chart/index.ts').then(m => ({
		default: m.NutritionChartPage,
	}))
)
const ProductsPage = lazy(() =>
	import('../pages/products/index.ts').then(m => ({ default: m.ProductsPage }))
)
const AdminPage = lazy(() =>
	import('../pages/admin/index.ts').then(m => ({ default: m.AdminPage }))
)

// Loading fallback
const PageLoader = () => (
	<div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
		<div className='h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent' />
	</div>
)

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
				element: (
					<Suspense fallback={<PageLoader />}>
						<LoginPage />
					</Suspense>
				),
			},
			{
				path: 'register',
				element: (
					<Suspense fallback={<PageLoader />}>
						<RegisterPage />
					</Suspense>
				),
			},
			{
				path: 'error',
				element: (
					<Suspense fallback={<PageLoader />}>
						<ErrorPage />
					</Suspense>
				),
			},
			{
				path: 'home',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<HomePage />
						</Suspense>
					</ProtectedRoute>
				),
			},
			{
				path: 'profile',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<ProfilePage />
						</Suspense>
					</ProtectedRoute>
				),
			},
			{
				path: 'goals',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<GoalsPage />
						</Suspense>
					</ProtectedRoute>
				),
			},
			{
				path: 'activity',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<ActivityPage />
						</Suspense>
					</ProtectedRoute>
				),
			},
			{
				path: 'nutrition-chart',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<NutritionChartPage />
						</Suspense>
					</ProtectedRoute>
				),
			},
			{
				path: 'products',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<ProductsPage />
						</Suspense>
					</ProtectedRoute>
				),
			},
			{
				path: 'admin',
				element: (
					<ProtectedRoute>
						<Suspense fallback={<PageLoader />}>
							<AdminPage />
						</Suspense>
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
