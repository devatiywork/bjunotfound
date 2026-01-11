import { useEffect, useState } from 'react'
import type {
	CreatePackageDto,
	ProductPackage,
	UpdatePackageDto,
} from '../../../../../../../api'
import { Input, Modal, Select, useToast } from '../../../../../../../components'

interface PackageModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: CreatePackageDto | UpdatePackageDto) => Promise<void>
	package?: ProductPackage
	title: string
	saving: boolean
}

const currencies = [
	{ value: 'RUB', label: '₽ RUB' },
	{ value: 'USD', label: '$ USD' },
	{ value: 'EUR', label: '€ EUR' },
	{ value: 'UAH', label: '₴ UAH' },
	{ value: 'KZT', label: '₸ KZT' },
]

export const PackageModal = ({
	isOpen,
	onClose,
	onSave,
	package: editingPackage,
	title,
	saving,
}: PackageModalProps) => {
	const { showToast } = useToast()
	const [formData, setFormData] = useState<CreatePackageDto>({
		totalWeightG: undefined,
		totalVolumeMl: undefined,
		priceTotal: 0,
		currency: 'RUB',
		purchasedAt: new Date().toISOString().split('T')[0],
		store: '',
		note: '',
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (isOpen) {
			if (editingPackage) {
				// Редактирование
				setFormData({
					totalWeightG: editingPackage.totalWeightG ?? undefined,
					totalVolumeMl: editingPackage.totalVolumeMl ?? undefined,
					priceTotal: editingPackage.priceTotal,
					currency: editingPackage.currency,
					purchasedAt: editingPackage.purchasedAt.split('T')[0],
					store: editingPackage.store ?? '',
					note: editingPackage.note ?? '',
				})
			} else {
				// Создание
				setFormData({
					totalWeightG: undefined,
					totalVolumeMl: undefined,
					priceTotal: 0,
					currency: 'RUB',
					purchasedAt: new Date().toISOString().split('T')[0],
					store: '',
					note: '',
				})
			}
			setErrors({})
		}
	}, [isOpen, editingPackage])

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		// Проверяем что хотя бы одно из полей веса/объема заполнено
		if (!formData.totalWeightG && !formData.totalVolumeMl) {
			newErrors.weight = 'Укажите вес или объем'
		}

		// Валидация веса
		if (
			formData.totalWeightG !== undefined &&
			(formData.totalWeightG < 0.01 || formData.totalWeightG > 999999.99)
		) {
			newErrors.weight = 'Вес должен быть от 0.01 до 999999.99 г'
		}

		// Валидация объема
		if (
			formData.totalVolumeMl !== undefined &&
			(formData.totalVolumeMl < 0.01 || formData.totalVolumeMl > 999999.99)
		) {
			newErrors.volume = 'Объем должен быть от 0.01 до 999999.99 мл'
		}

		// Валидация цены
		if (formData.priceTotal < 0.01 || formData.priceTotal > 9999999.99) {
			newErrors.price = 'Цена должна быть от 0.01 до 9999999.99'
		}

		// Валидация магазина
		if (formData.store && formData.store.length > 100) {
			newErrors.store = 'Название магазина не может быть длиннее 100 символов'
		}

		// Валидация заметки
		if (formData.note && formData.note.length > 500) {
			newErrors.note = 'Заметка не может быть длиннее 500 символов'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			showToast('Проверьте правильность заполнения полей', 'error')
			return
		}

		try {
			const submitData: CreatePackageDto | UpdatePackageDto = {
				...formData,
				totalWeightG: formData.totalWeightG || undefined,
				totalVolumeMl: formData.totalVolumeMl || undefined,
				store: formData.store || undefined,
				note: formData.note || undefined,
				purchasedAt: formData.purchasedAt
					? new Date(formData.purchasedAt).toISOString()
					: undefined,
			}

			await onSave(submitData)
			onClose()
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || 'Произошла ошибка'
			showToast(errorMessage, 'error')
		}
	}

	const handleChange = (
		field: keyof CreatePackageDto,
		value: string | number
	) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (errors[field as string]) {
			setErrors(prev => ({ ...prev, [field as string]: '' }))
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth='md'>
			<form onSubmit={handleSubmit} className='space-y-3'>
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
							value={formData.totalWeightG ?? ''}
							onChange={e =>
								handleChange(
									'totalWeightG',
									e.target.value ? Number(e.target.value) : 0
								)
							}
							disabled={saving}
							placeholder='Например, 500'
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
							value={formData.totalVolumeMl ?? ''}
							onChange={e =>
								handleChange(
									'totalVolumeMl',
									e.target.value ? Number(e.target.value) : 0
								)
							}
							disabled={saving}
							placeholder='Например, 1000'
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

				{/* Цена и валюта */}
				<div className='grid grid-cols-2 gap-3'>
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Цена
						</label>
						<Input
							type='number'
							step='0.01'
							min='0.01'
							max='9999999.99'
							value={formData.priceTotal}
							onChange={e => handleChange('priceTotal', Number(e.target.value))}
							disabled={saving}
							placeholder='Например, 89.99'
							required
						/>
						{errors.price && (
							<p className='text-red-600 dark:text-red-400 text-xs mt-1'>
								{errors.price}
							</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Валюта
						</label>
						<Select
							value={formData.currency}
							onChange={(value: string) => handleChange('currency', value)}
							options={currencies}
							disabled={saving}
						/>
					</div>
				</div>

				{/* Дата покупки и магазин */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Дата покупки
						</label>
						<Input
							type='date'
							value={formData.purchasedAt}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleChange('purchasedAt', e.target.value)
							}
							disabled={saving}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
							Магазин
						</label>
						<Input
							type='text'
							maxLength={100}
							value={formData.store}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleChange('store', e.target.value)
							}
							disabled={saving}
							placeholder='Название магазина'
						/>
						{errors.store && (
							<p className='text-red-600 dark:text-red-400 text-xs mt-1'>
								{errors.store}
							</p>
						)}
					</div>
				</div>

				{/* Заметка */}
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Заметка
					</label>
					<textarea
						maxLength={500}
						rows={3}
						value={formData.note}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							handleChange('note', e.target.value)
						}
						disabled={saving}
						placeholder='Дополнительная информация о покупке'
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none'
					/>
					{errors.note && (
						<p className='text-red-600 dark:text-red-400 text-xs mt-1'>
							{errors.note}
						</p>
					)}
				</div>

				{/* Кнопки */}
				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={onClose}
						disabled={saving}
						className='flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={saving}
						className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
					>
						{saving ? (
							<>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								Сохранение...
							</>
						) : (
							'Сохранить'
						)}
					</button>
				</div>
			</form>
		</Modal>
	)
}
