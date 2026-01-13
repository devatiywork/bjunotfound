import { useState, useEffect } from 'react'
import { Modal, Input } from '../../../../../../../components'
import type { Dish, CreateDishDto, UpdateDishDto } from '../../../../../../../api/types'

interface DishFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: CreateDishDto | UpdateDishDto) => Promise<void>
	dish?: Dish | null
	isLoading?: boolean
}

export const DishFormModal = ({
	isOpen,
	onClose,
	onSubmit,
	dish,
	isLoading = false,
}: DishFormModalProps) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		portions: 1,
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	// Заполнение формы при редактировании
	useEffect(() => {
		if (dish) {
			setFormData({
				name: dish.name,
				description: dish.description,
				portions: dish.portions,
			})
		} else {
			setFormData({ name: '', description: '', portions: 1 })
		}
		setErrors({})
	}, [dish, isOpen])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		const validationErrors = validateForm(formData)
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors)
			return
		}

		try {
			await onSubmit(formData)
			onClose()
		} catch (error) {
			console.error('Error submitting form:', error)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={dish ? 'Редактировать блюдо' : 'Создать блюдо'}
			maxWidth='md'
		>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Название */}
				<FormField
					label='Название блюда'
					required
					error={errors.name}
				>
					<Input
						type='text'
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
							setFormData(prev => ({ ...prev, name: e.target.value }))
						}
						placeholder='Например, Омлет с сыром'
						required
					/>
				</FormField>

				{/* Описание */}
				<FormField
					label='Описание'
					error={errors.description}
				>
					<textarea
						value={formData.description}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setFormData(prev => ({ ...prev, description: e.target.value }))
						}
						placeholder='Краткое описание блюда'
						rows={3}
						className='w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
					/>
				</FormField>

				{/* Количество порций */}
				<FormField
					label='Количество порций'
					required
					error={errors.portions}
				>
					<Input
						type='number'
						value={formData.portions}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFormData(prev => ({ ...prev, portions: Number(e.target.value) }))
						}
						min={1}
						max={100}
						required
					/>
				</FormField>

				{/* Кнопки */}
				<div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
					<button
						type='button'
						onClick={onClose}
						disabled={isLoading}
						className='px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={isLoading}
						className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isLoading ? 'Сохранение...' : (dish ? 'Обновить' : 'Создать')}
					</button>
				</div>
			</form>
		</Modal>
	)
}

// Подкомпонент для поля формы
const FormField = ({ label, required, error, children }: {
	label: string
	required?: boolean
	error?: string
	children: React.ReactNode
}) => {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
				{label}
				{required && <span className='text-red-500 ml-1'>*</span>}
			</label>
			{children}
			{error && (
				<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{error}</p>
			)}
		</div>
	)
}

// Функция валидации формы
const validateForm = (data: { name: string; description: string; portions: number }): Record<string, string> => {
	const errors: Record<string, string> = {}

	if (!data.name.trim()) {
		errors.name = 'Название обязательно'
	} else if (data.name.length > 100) {
		errors.name = 'Название не должно превышать 100 символов'
	}

	if (data.description && data.description.length > 500) {
		errors.description = 'Описание не должно превышать 500 символов'
	}

	if (data.portions < 1 || data.portions > 100) {
		errors.portions = 'Количество порций должно быть от 1 до 100'
	}

	return errors
}