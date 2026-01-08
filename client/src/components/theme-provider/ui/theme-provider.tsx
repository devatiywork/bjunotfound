import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = useState<Theme>(() => {
		// Проверяем сохраненную тему в localStorage
		const savedTheme = localStorage.getItem('theme') as Theme | null
		if (savedTheme) {
			return savedTheme
		}
		// Проверяем системную тему
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark'
		}
		return 'light'
	})

	// Применяем начальную тему при монтировании
	useEffect(() => {
		const root = document.documentElement
		const savedTheme = localStorage.getItem('theme') as Theme | null
		const initialTheme =
			savedTheme ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light')

		if (initialTheme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
	}, [])

	useEffect(() => {
		// Применяем тему к документу
		const root = document.documentElement
		if (theme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
		// Сохраняем тему в localStorage
		localStorage.setItem('theme', theme)
	}, [theme])

	const toggleTheme = () => {
		setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
