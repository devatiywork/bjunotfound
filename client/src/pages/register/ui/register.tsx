import { format } from 'date-fns'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	register as apiRegister,
	isAuthenticated,
	setAccessToken,
	type ApiError,
} from '../../../api'
import {
	DatePicker,
	Input,
	Select,
	ThemeToggle,
} from '../../../components/index.ts'
import { getUserTimezone } from '../../../utils'

export const RegisterPage = () => {
	const navigate = useNavigate()
	const [step, setStep] = useState(1) // 1 или 2

	// Шаг 1
	const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE')
	const [birthDate, setBirthDate] = useState<Date | null>(null)
	const [height, setHeight] = useState('')

	// Шаг 2
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		document.title = 'Регистрация | BjuNotFound'
	}, [])

	useEffect(() => {
		if (isAuthenticated()) navigate('/app/home', { replace: true })
	}, [navigate])

	const handleNextStep = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')

		// Валидация шага 1
		if (!birthDate) {
			setError('Укажите дату рождения')
			return
		}

		if (!height || parseInt(height) <= 0) {
			setError('Укажите корректный рост')
			return
		}

		setStep(2)
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')

		// Валидация шага 2
		if (password !== confirmPassword) {
			setError('Пароли не совпадают')
			return
		}

		if (!birthDate) {
			setError('Ошибка: дата рождения не указана')
			return
		}

		setIsLoading(true)

		try {
			const response = await apiRegister({
				email,
				password,
				gender,
				birthDate: format(birthDate, 'yyyy-MM-dd'),
				height: parseInt(height),
				timezone: getUserTimezone(),
			})
			setAccessToken(response.access_token)
			navigate('/app/home')
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message ||
					'Ошибка при регистрации. Проверьте данные и попробуйте снова.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-50 py-12 dark:bg-gray-900'>
			<div className='absolute right-4 top-4'>
				<ThemeToggle />
			</div>
			<div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800'>
				<h1 className='mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white'>
					Регистрация
				</h1>
				<p className='mb-6 text-center text-sm text-gray-600 dark:text-gray-400'>
					Шаг {step} из 2
				</p>

				{error && (
					<div className='mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
						<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
					</div>
				)}

				{step === 1 ? (
					<form className='space-y-4' onSubmit={handleNextStep}>
						<Select
							id='gender'
							label='Пол'
							value={gender}
							onChange={value => setGender(value as 'MALE' | 'FEMALE')}
							required
							placeholder='Выберите пол'
							options={[
								{ value: 'MALE', label: 'Мужской' },
								{ value: 'FEMALE', label: 'Женский' },
							]}
						/>
						<DatePicker
							label='Дата рождения'
							selected={birthDate}
							onChange={setBirthDate}
							maxDate={new Date()}
							placeholderText='Выберите дату'
							required
						/>
						<Input
							type='number'
							id='height'
							label='Рост (см)'
							value={height}
							onChange={e => setHeight(e.target.value)}
							required
							min='50'
							max='250'
							placeholder='180'
						/>
						<button
							type='submit'
							className='w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
						>
							Далее
						</button>
					</form>
				) : (
					<form className='space-y-4' onSubmit={handleSubmit}>
						<Input
							type='email'
							id='email'
							label='Email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							disabled={isLoading}
							placeholder='example@mail.com'
						/>
						<Input
							type='password'
							id='password'
							label='Пароль'
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							minLength={6}
							disabled={isLoading}
							placeholder='••••••••'
						/>
						<Input
							type='password'
							id='confirmPassword'
							label='Подтверждение пароля'
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							required
							minLength={6}
							disabled={isLoading}
							placeholder='••••••••'
						/>
						<div className='flex gap-3'>
							<button
								type='button'
								onClick={() => setStep(1)}
								disabled={isLoading}
								className='flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
							>
								Назад
							</button>
							<button
								type='submit'
								disabled={isLoading}
								className='flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
							>
								{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
							</button>
						</div>
					</form>
				)}

				<div className='mt-4 text-center'>
					<a
						href='/app/login'
						className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
					>
						Уже есть аккаунт? Войти
					</a>
				</div>
			</div>
		</div>
	)
}
