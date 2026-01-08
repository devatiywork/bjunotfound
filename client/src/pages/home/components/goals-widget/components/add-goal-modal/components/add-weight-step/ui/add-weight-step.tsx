import { useState, type FormEvent } from 'react'
import { Scale, Loader2, ArrowRight } from 'lucide-react'
import { addWeight, type ApiError } from '../../../../../../../../../api'
import { Input } from '../../../../../../../../../components'

interface AddWeightStepProps {
	onWeightAdded: (weight: number) => void
}

export const AddWeightStep = ({ onWeightAdded }: AddWeightStepProps) => {
	const [weight, setWeight] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')

		const weightValue = parseFloat(weight)

		if (isNaN(weightValue) || weightValue < 20 || weightValue > 500) {
			setError('Вес должен быть в диапазоне 20-500 кг')
			return
		}

		setIsSubmitting(true)

		try {
			await addWeight({ weight: weightValue })
			onWeightAdded(weightValue)
		} catch (err: any) {
			const apiError = err.response?.data as ApiError
			setError(
				apiError?.message || 'Ошибка при добавлении веса. Попробуйте снова.'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='text-center'>
				<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
					<Scale className='h-8 w-8 text-purple-600 dark:text-purple-400' />
				</div>
				<h3 className='mb-2 text-xl font-bold text-gray-900 dark:text-white'>
					Добавьте свой текущий вес
				</h3>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					Для автоматического расчета калорий и создания цели нам нужно знать
					ваш текущий вес
				</p>
			</div>

			{/* Error Message */}
			{error && (
				<div className='rounded-md bg-red-50 p-3 dark:bg-red-900/20'>
					<p className='text-sm text-red-800 dark:text-red-200'>{error}</p>
				</div>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<Input
						type='number'
						id='weight'
						label='Ваш текущий вес (кг)'
						value={weight}
						onChange={e => setWeight(e.target.value)}
						disabled={isSubmitting}
						placeholder='70'
						step='0.1'
						min='20'
						max='500'
						required
						autoFocus
					/>
					<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
						Вы сможете добавить историю веса позже в профиле
					</p>
				</div>

				{/* Submit Button */}
				<button
					type='submit'
					disabled={isSubmitting}
					className='flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600'
				>
					{isSubmitting ? (
						<>
							<Loader2 className='h-5 w-5 animate-spin' />
							<span>Сохранение...</span>
						</>
					) : (
						<>
							<span>Продолжить</span>
							<ArrowRight className='h-5 w-5' />
						</>
					)}
				</button>
			</form>

			{/* Info */}
			<div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
				<p className='text-sm text-blue-800 dark:text-blue-200'>
					💡 <strong>Совет:</strong> Взвешивайтесь утром натощак для более
					точных результатов
				</p>
			</div>
		</div>
	)
}
