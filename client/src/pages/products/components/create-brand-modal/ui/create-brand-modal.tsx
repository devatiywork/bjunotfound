import { Plus } from 'lucide-react'
import { useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import type { Brand } from '../../../../../api/types/brands'
import { Input, Modal, useToast } from '../../../../../components'

interface CreateBrandModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: (brand: Brand) => void
}

export const CreateBrandModal = ({
	isOpen,
	onClose,
	onSuccess,
}: CreateBrandModalProps) => {
	const { showToast } = useToast()
	const [loading, setLoading] = useState(false)
	const [name, setName] = useState('')
	const [country, setCountry] = useState('')

	const resetForm = () => {
		setName('')
		setCountry('')
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim()) {
			showToast('Название бренда обязательно', 'error')
			return
		}

		if (name.trim().length < 2) {
			showToast('Название должно содержать минимум 2 символа', 'error')
			return
		}

		setLoading(true)
		try {
			const brand = await BrandsAPI.createBrand({
				name: name.trim(),
				country: country.trim() || undefined,
			})

			showToast('Бренд успешно создан и отправлен на модерацию', 'success')
			onSuccess(brand)
			handleClose()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при создании бренда'
			showToast(errorMessage, 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Создать бренд'
			maxWidth='lg'
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<p className='text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
					После создания бренд будет отправлен на модерацию. Вы сможете
					использовать его в своих продуктах сразу, но он станет доступен другим
					пользователям после одобрения.
				</p>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Название бренда <span className='text-red-500'>*</span>
					</label>
					<Input
						value={name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setName(e.target.value)
						}
						placeholder='Например: Danone, Dr. Oetker'
						maxLength={100}
						required
						autoFocus
						disabled={loading}
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Страна производитель
					</label>
					<Input
						value={country}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setCountry(e.target.value)
						}
						placeholder='Например: Germany, Russia'
						maxLength={100}
						disabled={loading}
					/>
					<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
						Опционально
					</p>
				</div>

				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={handleClose}
						disabled={loading}
						className='flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading || !name.trim()}
						className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50'
					>
						{loading ? (
							<>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								Создание...
							</>
						) : (
							<>
								<Plus className='w-4 h-4' />
								Создать
							</>
						)}
					</button>
				</div>
			</form>
		</Modal>
	)
}
