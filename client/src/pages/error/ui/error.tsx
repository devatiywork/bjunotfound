import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../../../components/index.ts'

export const ErrorPage = () => {
	useEffect(() => {
		document.title = 'Ошибка доступа | TimeNoFat'
	}, [])

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<div className='absolute right-4 top-4'>
				<ThemeToggle />
			</div>
			<div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800'>
				<h1 className='mb-4 text-center text-3xl font-bold text-red-600 dark:text-red-400'>
					Доступ запрещен
				</h1>
				<p className='mb-6 text-center text-gray-600 dark:text-gray-300'>
					Вы не авторизованы. Пожалуйста, войдите в систему или
					зарегистрируйтесь.
				</p>
				<div className='flex flex-col gap-3'>
					<Link
						to='/app/login'
						className='rounded-lg bg-blue-600 px-4 py-2 text-center text-white transition hover:bg-blue-700'
					>
						Войти
					</Link>
					<Link
						to='/app/register'
						className='rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
					>
						Регистрация
					</Link>
					<Link
						to='/'
						className='rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
					>
						На главную
					</Link>
				</div>
			</div>
		</div>
	)
}
