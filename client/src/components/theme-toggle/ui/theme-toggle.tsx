import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme-provider'

export const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme()

	return (
		<button
			onClick={toggleTheme}
			className='rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800'
			aria-label='Переключить тему'
		>
			{theme === 'light' ? (
				<Moon className='h-5 w-5 text-gray-700 dark:text-gray-300' />
			) : (
				<Sun className='h-5 w-5 text-gray-700 dark:text-gray-300' />
			)}
		</button>
	)
}
