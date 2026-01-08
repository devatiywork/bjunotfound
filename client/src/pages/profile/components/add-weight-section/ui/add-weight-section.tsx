import { format } from 'date-fns'
import { Loader2, Plus, Scale } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { addWeight, type ApiError } from '../../../../../api'
import { CollapsibleSection, Input } from '../../../../../components'

interface AddWeightSectionProps {
	onWeightAdded?: () => void
}

export const AddWeightSection = ({ onWeightAdded }: AddWeightSectionProps) => {
	// Состояние формы добавления веса
	const [weight, setWeight] = useState('')
	const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitError, setSubmitError] = useState('')
	const [submitSuccess, setSubmitSuccess] = useState('')

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSubmitError('')
		setSubmitSuccess('')

		const weightValue = parseFloat(weight)

		if (!weightValue || weightValue <= 0) {
			setSubmitError('Укажите корректный вес')
			return
		}

		if (weightValue < 20 || weightValue > 500) {
			setSubmitError('Вес должен быть в диапазоне 20-500 кг')
			return
		}

		if (!date) {
			setSubmitError('Укажите дату')
			return
		}

		setIsSubmitting(true)

		try {
			await addWeight({
				weight: weightValue,
				date: date,
			})

			setSubmitSuccess('Вес успешно добавлен!')
			setWeight('')
			setDate(format(new Date(), 'yyyy-MM-dd'))

			// Вызываем callback для обновления истории
			if (onWeightAdded) {
				onWeightAdded()
			}

			// Скрыть сообщение об успехе через 3 секунды
			setTimeout(() => setSubmitSuccess(''), 3000)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setSubmitError(
				apiError?.message || 'Ошибка при добавлении веса. Попробуйте снова.'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<CollapsibleSection
			title='Управление весом'
			description='Добавление записи о весе'
			icon={Scale}
			iconColor='text-green-600 dark:text-green-400'
			iconBgColor='bg-green-100 dark:bg-green-900/30'
		>
			<div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
				{/* Success Message */}
				{submitSuccess && (
					<div className='mb-4 rounded-md bg-green-50 p-3 dark:bg-green-900/20'>
						<p className='text-sm text-green-800 dark:text-green-200'>
							{submitSuccess}
						</p>
					</div>
				)}

				{/* Error Message */}
				{submitError && (
					<div className='mb-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20'>
						<p className='text-sm text-red-800 dark:text-red-200'>
							{submitError}
						</p>
					</div>
				)}

				{/* Add Weight Form */}
				<form className='space-y-4' onSubmit={handleSubmit}>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<Input
								type='number'
								id='weight'
								label='Вес (кг)'
								value={weight}
								onChange={e => setWeight(e.target.value)}
								required
								disabled={isSubmitting}
								placeholder='75.5'
								step='0.1'
								min='20'
								max='500'
							/>
						</div>
						<div>
							<Input
								type='date'
								id='date'
								label='Дата'
								value={date}
								onChange={e => setDate(e.target.value)}
								required
								disabled={isSubmitting}
								max={new Date().toISOString().split('T')[0]}
							/>
						</div>
					</div>

					<button
						type='submit'
						disabled={isSubmitting}
						className='flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600'
					>
						{isSubmitting ? (
							<>
								<Loader2 className='h-5 w-5 animate-spin' />
								<span>Добавление...</span>
							</>
						) : (
							<>
								<Plus className='h-5 w-5' />
								<span>Добавить запись</span>
							</>
						)}
					</button>
				</form>
			</div>
		</CollapsibleSection>
	)
}
