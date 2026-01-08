import { format, parseISO } from 'date-fns'
import { Loader2, Save, User } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import {
	getActivityLevels,
	getUserProfile,
	updateUserProfile,
	type ActivityLevel,
	type ApiError,
	type FormulaType,
	type UpdateProfileRequest,
	type UserProfile,
} from '../../../../../api'
import {
	CollapsibleSection,
	DatePicker,
	Input,
	Select,
} from '../../../../../components'
import { ALL_TIMEZONES, getUserTimezone } from '../../../../../utils'

// Словарь для отображения названий формул
const FORMULA_LABELS: Record<FormulaType, string> = {
	MIFFLIN_ST_JEOR: 'Миффлина-Сан Жеора (рекомендуется)',
	HARRIS_BENEDICT: 'Харриса-Бенедикта',
}

export const ProfileEditSection = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')

	// Список уровней активности с бэкенда
	const [activityLevels, setActivityLevels] = useState<ActivityLevel[]>([])

	// Форма редактирования
	const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE')
	const [birthDate, setBirthDate] = useState<Date | null>(null)
	const [height, setHeight] = useState('')

	// Настройки расчета калорий (из профиля с бэкенда)
	const [activityLevelId, setActivityLevelId] = useState<string>('sedentary')
	const [formulaType, setFormulaType] = useState<FormulaType>('MIFFLIN_ST_JEOR')
	const [timezone, setTimezone] = useState<string>('UTC')

	// Состояние сохранения
	const [isSaving, setIsSaving] = useState(false)
	const [saveError, setSaveError] = useState('')
	const [saveSuccess, setSaveSuccess] = useState('')

	useEffect(() => {
		loadProfile()
		loadActivityLevels()
	}, [])

	const loadProfile = async () => {
		setIsLoading(true)
		setError('')

		try {
			const data = await getUserProfile()
			setProfile(data)

			// Инициализируем форму текущими данными
			setGender(data.gender)
			setBirthDate(parseISO(data.birthDate))
			setHeight(data.height.toString())
			setActivityLevelId(data.activityLevelId)
			setFormulaType(data.formulaType)
			setTimezone(data.timezone || getUserTimezone())
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message ||
					'Ошибка при загрузке профиля. Попробуйте обновить страницу.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const loadActivityLevels = async () => {
		try {
			const levels = await getActivityLevels()
			setActivityLevels(levels)
		} catch (err: any) {
			console.error('Ошибка при загрузке уровней активности:', err)
			// Не показываем ошибку пользователю, так как это не критично
			// В случае ошибки просто будет пустой список в select
		}
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSaveError('')
		setSaveSuccess('')

		const heightValue = parseFloat(height)

		if (!heightValue || heightValue <= 0) {
			setSaveError('Укажите корректный рост')
			return
		}

		if (heightValue < 50 || heightValue > 300) {
			setSaveError('Рост должен быть в диапазоне 50-300 см')
			return
		}

		if (!birthDate) {
			setSaveError('Укажите дату рождения')
			return
		}

		setIsSaving(true)

		try {
			const updateData: UpdateProfileRequest = {
				gender,
				birthDate: format(birthDate!, 'yyyy-MM-dd'),
				height: heightValue,
				formulaType,
				activityLevelId,
				timezone,
			}

			const updatedProfile = await updateUserProfile(updateData)
			setProfile(updatedProfile)

			setSaveSuccess('Профиль и настройки успешно обновлены!')

			// Скрыть сообщение об успехе через 3 секунды
			setTimeout(() => setSaveSuccess(''), 3000)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setSaveError(
				apiError?.message || 'Ошибка при обновлении профиля. Попробуйте снова.'
			)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<CollapsibleSection
			title='Личные данные'
			description='Редактирование профиля'
			icon={User}
			iconColor='text-blue-600 dark:text-blue-400'
			iconBgColor='bg-blue-100 dark:bg-blue-900/30'
		>
			{/* Loading State */}
			{isLoading && (
				<div className='flex items-center justify-center rounded-lg bg-white p-12 shadow-md dark:bg-gray-800'>
					<div className='flex items-center gap-3 text-gray-600 dark:text-gray-400'>
						<Loader2 className='h-6 w-6 animate-spin' />
						<span className='text-lg'>Загрузка профиля...</span>
					</div>
				</div>
			)}

			{/* Error State */}
			{error && !isLoading && (
				<div className='rounded-md bg-red-50 p-4 dark:bg-red-900/20'>
					<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
				</div>
			)}

			{/* Profile Form */}
			{!isLoading && !error && profile && (
				<div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
					{/* Success Message */}
					{saveSuccess && (
						<div className='mb-4 rounded-md bg-green-50 p-3 dark:bg-green-900/20'>
							<p className='text-sm text-green-800 dark:text-green-200'>
								{saveSuccess}
							</p>
						</div>
					)}

					{/* Error Message */}
					{saveError && (
						<div className='mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20'>
							<p className='text-sm text-red-800 dark:text-red-200'>
								{saveError}
							</p>
						</div>
					)}

					{/* Email (read-only) */}
					<div className='mb-4'>
						<label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Email
						</label>
						<input
							type='email'
							value={profile.email}
							disabled
							className='w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
						/>
						<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
							Email нельзя изменить
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						{/* Gender */}
						<div>
							<label className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Пол
							</label>
							<div className='flex gap-4'>
								<label className='flex items-center gap-2'>
									<input
										type='radio'
										name='gender'
										value='MALE'
										checked={gender === 'MALE'}
										onChange={e =>
											setGender(e.target.value as 'MALE' | 'FEMALE')
										}
										disabled={isSaving}
										className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600'
									/>
									<span className='text-sm text-gray-900 dark:text-white'>
										Мужской
									</span>
								</label>
								<label className='flex items-center gap-2'>
									<input
										type='radio'
										name='gender'
										value='FEMALE'
										checked={gender === 'FEMALE'}
										onChange={e =>
											setGender(e.target.value as 'MALE' | 'FEMALE')
										}
										disabled={isSaving}
										className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600'
									/>
									<span className='text-sm text-gray-900 dark:text-white'>
										Женский
									</span>
								</label>
							</div>
						</div>

						{/* Birth Date */}
						<div>
							<DatePicker
								label='Дата рождения'
								selected={birthDate}
								onChange={setBirthDate}
								disabled={isSaving}
								maxDate={new Date()}
								placeholderText='Выберите дату рождения'
								required
							/>
						</div>

						{/* Height */}
						<div>
							<Input
								type='number'
								id='height'
								label='Рост (см)'
								value={height}
								onChange={e => setHeight(e.target.value)}
								required
								disabled={isSaving}
								placeholder='175'
								min='50'
								max='300'
								step='1'
							/>
						</div>

						{/* Divider */}
						<div className='border-t border-gray-200 pt-4 dark:border-gray-700'>
							<h3 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>
								Настройки расчета калорий
							</h3>
							<p className='mb-4 text-xs text-gray-600 dark:text-gray-400'>
								Эти настройки используются для автоматического расчета калорий
								при создании целей
							</p>
						</div>

						{/* Activity Level */}
						<div>
							<Select
								id='activityLevel'
								label='Уровень активности'
								value={activityLevelId}
								onChange={value => setActivityLevelId(value)}
								disabled={isSaving}
								options={activityLevels.map(level => ({
									value: level.id,
									label: level.name,
								}))}
							/>
							{profile?.activityLevel && (
								<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
									{profile.activityLevel.description}
								</p>
							)}
						</div>

						{/* Calorie Formula */}
						<div>
							<Select
								id='calorieFormula'
								label='Формула расчета'
								value={formulaType}
								onChange={value => setFormulaType(value as FormulaType)}
								disabled={isSaving}
								options={Object.entries(FORMULA_LABELS).map(
									([value, label]) => ({
										value,
										label,
									})
								)}
							/>
							<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
								Формула Миффлина-Сан Жеора считается более точной для
								современных людей
							</p>
						</div>

						{/* Timezone */}
						<div>
							<Select
								id='timezone'
								label='Часовой пояс'
								value={timezone}
								onChange={value => setTimezone(value)}
								disabled={isSaving}
								searchable={true}
								options={ALL_TIMEZONES}
							/>
							<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
								Используется для корректного учета активности и дневника питания
							</p>
						</div>

						{/* Submit Button */}
						<button
							type='submit'
							disabled={isSaving}
							className='flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
						>
							{isSaving ? (
								<>
									<Loader2 className='h-5 w-5 animate-spin' />
									<span>Сохранение...</span>
								</>
							) : (
								<>
									<Save className='h-5 w-5' />
									<span>Сохранить изменения</span>
								</>
							)}
						</button>
					</form>

					{/* Profile Info */}
					<div className='mt-6 border-t border-gray-200 pt-4 dark:border-gray-700'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							Профиль создан:{' '}
							{new Date(profile.createdAt).toLocaleDateString('ru-RU', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
					</div>
				</div>
			)}
		</CollapsibleSection>
	)
}
