import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider, ToastProvider } from './components/index.ts'
import './index.css'
import './index.scss'
import { router } from './router/index.tsx'

// Монтируем React приложение только на маршрутах /app/*
if (window.location.pathname.startsWith('/app')) {
	const rootElement = document.getElementById('root')
	if (rootElement) {
		createRoot(rootElement).render(
			<StrictMode>
				<ThemeProvider>
					<ToastProvider>
						<RouterProvider router={router} />
					</ToastProvider>
				</ThemeProvider>
			</StrictMode>
		)
	}
}
