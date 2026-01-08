import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	isAuthenticated,
	login,
	setAccessToken,
	type ApiError,
} from '../../../api'
import { ThemeToggle } from '../../../components/index.ts'

export const LoginPage = () => {
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		document.title = 'Вход | BjuNotFound'
	}, [])

	useEffect(() => {
		if (isAuthenticated()) navigate('/app/home', { replace: true })
	}, [navigate])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const response = await login({ email, password })
			setAccessToken(response.access_token)
			navigate('/app/home')
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message ||
					'Ошибка при входе. Проверьте данные и попробуйте снова.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<div className='absolute right-4 top-4'>
				<ThemeToggle />
			</div>
			<div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800'>
				<h1 className='mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white'>
					Вход
				</h1>

				{error && (
					<div className='mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
						<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
					</div>
				)}

				<form className='space-y-4' onSubmit={handleSubmit}>
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'
						>
							Email
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							disabled={isLoading}
							className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500'
							placeholder='example@mail.com'
						/>
					</div>
					<div>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'
						>
							Пароль
						</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							disabled={isLoading}
							className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500'
							placeholder='••••••••'
						/>
					</div>
					<button
						type='submit'
						disabled={isLoading}
						className='w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
					>
						{isLoading ? 'Вход...' : 'Войти'}
					</button>
				</form>
				<div className='mt-4 text-center'>
					<a
						href='/app/register'
						className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
					>
						Нет аккаунта? Зарегистрироваться
					</a>
				</div>
			</div>
		</div>
	)
}
