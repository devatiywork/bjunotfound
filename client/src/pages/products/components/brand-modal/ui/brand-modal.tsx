import { useEffect, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import type { Brand } from '../../../../../api/types/brands'
import { Input, Modal, useToast } from '../../../../../components'

interface BrandModalProps {
	isOpen: boolean
	onClose: () => void
	mode: 'create' | 'edit'
	brand: Brand | null
	onSuccess: () => void
}

export const BrandModal = ({
	isOpen,
	onClose,
	mode,
	brand,
	onSuccess,
}: BrandModalProps) => {
	const { showToast } = useToast()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		country: '',
	})

	useEffect(() => {
		if (isOpen) {
			if (mode === 'edit' && brand) {
				setFormData({
					name: brand.name,
					country: brand.country || '',
				})
			} else {
				setFormData({
					name: '',
					country: '',
				})
			}
		}
	}, [isOpen, mode, brand])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			showToast('Название бренда обязательно', 'error')
			return
		}

		setLoading(true)
		try {
			const dto = {
				name: formData.name.trim(),
				country: formData.country.trim() || undefined,
			}

			if (mode === 'create') {
				await BrandsAPI.createBrand(dto)
				showToast('Бренд успешно создан', 'success')
			} else if (brand) {
				await BrandsAPI.updateBrand(brand.id, dto)
				showToast('Бренд успешно обновлен', 'success')
			}

			onSuccess()
			onClose()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				(mode === 'create'
					? 'Ошибка при создании бренда'
					: 'Ошибка при обновлении бренда')
			showToast(errorMessage, 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={mode === 'create' ? 'Создание бренда' : 'Редактирование бренда'}
			maxWidth='lg'
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<Input
					label='Название бренда'
					value={formData.name}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setFormData({ ...formData, name: e.target.value })
					}
					placeholder='Например: Danone, Dr. Oetker'
					required
					autoFocus
				/>

				<Input
					label='Страна производитель'
					value={formData.country}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setFormData({ ...formData, country: e.target.value })
					}
					placeholder='Например: Germany, Russia'
				/>

				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={onClose}
						disabled={loading}
						className='flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading || !formData.name.trim()}
						className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50'
					>
						{loading
							? mode === 'create'
								? 'Создание...'
								: 'Сохранение...'
							: mode === 'create'
							? 'Создать'
							: 'Сохранить'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
