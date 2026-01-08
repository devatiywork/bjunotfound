import {
	Activity,
	Apple,
	Home,
	LogOut,
	Menu,
	Target,
	User,
	X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../api'
import { Modal } from '../../modal'
import { useTheme } from '../../theme-provider'
import { ThemeToggle } from '../../theme-toggle'

export const Header = () => {
	const navigate = useNavigate()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const { theme } = useTheme()
	const handleLogout = async () => {
		try {
			await logout()
			navigate('/app/login')
		} catch (error) {
			console.error('Logout error:', error)
			// Даже при ошибке перенаправляем на логин
			navigate('/app/login')
		}
	}

	const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

	const confirmLogout = async () => {
		setIsLogoutConfirmOpen(false)
		await handleLogout()
	}

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen)
	}

	const navigateAndClose = (path: string) => {
		navigate(path)
		setIsMobileMenuOpen(false)
	}

	return (
		<header className='sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
			<div className='container mx-auto px-4 relative'>
				<div className='flex h-16 items-center justify-between'>
					{/* Logo / Brand */}
					<div className='flex items-center gap-2'>
						<button
							onClick={() => navigate('/app/home')}
							className='group text-xl font-bold text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400 cursor-pointer flex items-center gap-1'
						>
							<img
								src={theme === 'dark' ? '/logo-black.png' : '/logo-white.png'}
								className='w-14 h-14 object-contain transition-transform duration-150 group-hover:scale-105 group-hover:brightness-110'
								loading='lazy'
							/>
							<span className='mt-2.5'>NotFound</span>
						</button>
					</div>

					{/* Desktop Navigation */}
					<nav className='hidden items-center gap-6 md:flex'>
						<button
							onClick={() => navigate('/app/home')}
							className='flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
						>
							<Home className='h-4 w-4' />
							<span>Главная</span>
						</button>

						<button
							onClick={() => navigate('/app/goals')}
							className='flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
						>
							<Target className='h-4 w-4' />
							<span>Цели</span>
						</button>

						<button
							onClick={() => navigate('/app/activity')}
							className='flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
						>
							<Activity className='h-4 w-4' />
							<span>Активность</span>
						</button>

						<button
							onClick={() => navigate('/app/products')}
							className='flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
						>
							<Apple className='h-4 w-4' />
							<span>Продукты и Блюда</span>
						</button>

						<button
							onClick={() => navigate('/app/profile')}
							className='flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
						>
							<User className='h-4 w-4' />
							<span>Профиль</span>
						</button>

						<ThemeToggle />

						<button
							onClick={() => setIsLogoutConfirmOpen(true)}
							className='flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
						>
							<LogOut className='h-4 w-4' />
							<span>Выйти</span>
						</button>
					</nav>

					{/* Mobile Menu Toggle & Theme */}
					<div className='flex items-center gap-2 md:hidden'>
						<ThemeToggle />
						<button
							onClick={toggleMobileMenu}
							className='rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
							aria-label='Toggle menu'
						>
							{isMobileMenuOpen ? (
								<X className='h-6 w-6' />
							) : (
								<Menu className='h-6 w-6' />
							)}
						</button>
					</div>

					{/* Logout Confirmation Modal */}
					<Modal
						isOpen={isLogoutConfirmOpen}
						onClose={() => setIsLogoutConfirmOpen(false)}
						title='Подтвердите выход'
						maxWidth='sm'
					>
						<div className='space-y-4'>
							<p className='text-sm text-gray-700 dark:text-gray-300'>
								Вы уверены, что хотите выйти из аккаунта?
							</p>
							<div className='flex items-center justify-end gap-3'>
								<button
									type='button'
									onClick={() => setIsLogoutConfirmOpen(false)}
									className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
								>
									Отмена
								</button>
								<button
									type='button'
									onClick={confirmLogout}
									className='rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
								>
									Выйти
								</button>
							</div>
						</div>
					</Modal>
				</div>
				{/* Mobile Menu (always mounted for smooth transition) */}
				<div
					aria-hidden={!isMobileMenuOpen}
					className={`absolute left-0 right-0 top-full md:hidden overflow-hidden transition-[max-height,padding] duration-200 ease-out origin-top bg-white dark:bg-gray-800 ${
						isMobileMenuOpen
							? 'max-h-130 py-4 border-t border-gray-200 dark:border-gray-700 pointer-events-auto'
							: 'max-h-0 py-0 pointer-events-none'
					}`}
					style={{ zIndex: 45 }}
				>
					<nav className='flex flex-col gap-2'>
						<button
							onClick={() => navigateAndClose('/app/home')}
							className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<Home className='h-5 w-5' />
							<span>Главная</span>
						</button>

						<button
							onClick={() => navigateAndClose('/app/goals')}
							className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<Target className='h-5 w-5' />
							<span>Цели</span>
						</button>

						<button
							onClick={() => navigateAndClose('/app/activity')}
							className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<Activity className='h-5 w-5' />
							<span>Активность</span>
						</button>

						<button
							onClick={() => navigateAndClose('/app/products')}
							className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<Apple className='h-5 w-5' />
							<span>Продукты</span>
						</button>

						<button
							onClick={() => navigateAndClose('/app/profile')}
							className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
						>
							<User className='h-5 w-5' />
							<span>Профиль</span>
						</button>

						<button
							onClick={() => setIsLogoutConfirmOpen(true)}
							className='flex items-center gap-3 rounded-lg bg-red-500 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
						>
							<LogOut className='h-5 w-5' />
							<span>Выйти</span>
						</button>
					</nav>
				</div>
			</div>
		</header>
	)
}
