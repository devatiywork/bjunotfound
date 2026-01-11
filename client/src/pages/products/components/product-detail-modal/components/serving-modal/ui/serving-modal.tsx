import React, { useEffect, useState } from 'react'
import type {
	CreateServingDto,
	ProductServing,
	UpdateServingDto,
} from '../../../../../../../api/types/products'
import { Input, Modal } from '../../../../../../../components'

interface ServingModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: CreateServingDto | UpdateServingDto) => Promise<void>
	serving?: ProductServing
}

interface FormData {
	name: string
	amountUnits: number
	weightG: number
	volumeMl: number
	isDefault: boolean
}

interface FormErrors {
	name?: string
	weight?: string
	volume?: string
	general?: string
}

export const ServingModal: React.FC<ServingModalProps> = ({
	isOpen,
	onClose,
	onSave,
	serving,
}) => {
	const [saving, setSaving] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({})

	const [formData, setFormData] = useState<FormData>({
		name: '',
		amountUnits: 1,
		weightG: 0,
		volumeMl: 0,
		isDefault: false,
	})

	const title = serving ? 'Редактировать порцию' : 'Добавить порцию'

	useEffect(() => {
		if (isOpen) {
			if (serving) {
				// Редактирование
				setFormData({
					name: serving.name,
					amountUnits: serving.amountUnits,
					weightG: serving.weightG || 0,
					volumeMl: serving.volumeMl || 0,
					isDefault: serving.isDefault,
				})
			} else {
				// Создание
				setFormData({
					name: '',
					amountUnits: 1,
					weightG: 0,
					volumeMl: 0,
					isDefault: false,
				})
			}
			setErrors({})
		}
	}, [isOpen, serving])

	const handleChange = (
		field: keyof FormData,
		value: string | number | boolean
	) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (errors[field as keyof FormErrors]) {
			setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }))
		}
	}

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {}

		// Валидация названия
		if (!formData.name.trim() || formData.name.length < 2) {
			newErrors.name = 'Название должно содержать минимум 2 символа'
		}
		if (formData.name.length > 50) {
			newErrors.name = 'Название не может быть длиннее 50 символов'
		}

		// Валидация веса
		if (
			formData.weightG &&
			(formData.weightG < 0.01 || formData.weightG > 999999.99)
		) {
			newErrors.weight = 'Вес должен быть от 0.01 до 999999.99 г'
		}

		// Валидация объема
		if (
			formData.volumeMl &&
			(formData.volumeMl < 0.01 || formData.volumeMl > 999999.99)
		) {
			newErrors.volume = 'Объем должен быть от 0.01 до 999999.99 мл'
		}

		// Проверка наличия хотя бы одного из параметров
		if (!formData.weightG && !formData.volumeMl) {
			newErrors.general = 'Укажите вес или объем порции'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) return

		setSaving(true)
		try {
			const submitData: CreateServingDto | UpdateServingDto = {
				name: formData.name.trim(),
				amountUnits: formData.amountUnits,
				...(formData.weightG > 0 && { weightG: formData.weightG }),
				...(formData.volumeMl > 0 && { volumeMl: formData.volumeMl }),
				isDefault: formData.isDefault,
			}

			await onSave(submitData)
			onClose()
		} catch (error: any) {
			// Ошибка уже обработана в родительском компоненте
		} finally {
			setSaving(false)
		}
	}

	if (!isOpen) return null

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth='md'>
			<form onSubmit={handleSubmit} className='space-y-3'>
				{/* Название и количество */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Название порции *
						</label>
						<Input
							type='text'
							maxLength={50}
							value={formData.name}
							onChange={e => handleChange('name', e.target.value)}
							disabled={saving}
							placeholder='Например: Стакан'
							required
						/>
						{errors.name && (
							<p className='text-red-600 dark:text-red-400 text-xs mt-1'>
								{errors.name}
							</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Количество
						</label>
						<Input
							type='number'
							step='0.01'
							min='0.01'
							max='9999.99'
							value={formData.amountUnits}
							onChange={e =>
								handleChange('amountUnits', Number(e.target.value) || 1)
							}
							disabled={saving}
							placeholder='1'
						/>
					</div>
				</div>

				{/* Общая ошибка */}
				{errors.general && (
					<p className='text-red-600 dark:text-red-400 text-sm'>
						{errors.general}
					</p>
				)}

				{/* Вес и объем */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Вес (г)
						</label>
						<Input
							type='number'
							step='0.01'
							min='0.01'
							max='999999.99'
							value={formData.weightG || ''}
							onChange={e =>
								handleChange(
									'weightG',
									e.target.value ? Number(e.target.value) : 0
								)
							}
							disabled={saving}
							placeholder='Например, 100'
						/>
						{errors.weight && (
							<p className='text-red-600 dark:text-red-400 text-xs mt-1'>
								{errors.weight}
							</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Объем (мл)
						</label>
						<Input
							type='number'
							step='0.01'
							min='0.01'
							max='999999.99'
							value={formData.volumeMl || ''}
							onChange={e =>
								handleChange(
									'volumeMl',
									e.target.value ? Number(e.target.value) : 0
								)
							}
							disabled={saving}
							placeholder='Например, 250'
						/>
						{errors.volume && (
							<p className='text-red-600 dark:text-red-400 text-xs mt-1'>
								{errors.volume}
							</p>
						)}
					</div>
				</div>

				<p className='text-xs text-gray-500 dark:text-gray-400'>
					Укажите вес или объем (или оба параметра)
				</p>

				{/* По умолчанию */}
				<div>
					<label className='flex items-center gap-2'>
						<input
							type='checkbox'
							checked={formData.isDefault}
							onChange={e => handleChange('isDefault', e.target.checked)}
							disabled={saving}
							className='rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500'
						/>
						<span className='text-sm text-gray-700 dark:text-gray-300'>
							Сделать порцией по умолчанию
						</span>
					</label>
					<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
						Порция по умолчанию будет выбираться автоматически в дневнике
						питания
					</p>
				</div>

				{/* Кнопки */}
				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={onClose}
						disabled={saving}
						className='flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={saving}
						className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium'
					>
						{saving ? 'Сохранение...' : serving ? 'Обновить' : 'Добавить'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
