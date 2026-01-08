import { useState } from 'react'
import { createCategory, updateCategory } from '../../../../../api/services'
import type { Category } from '../../../../../api/types'
import { useToast } from '../../../../../components'
import { Input } from '../../../../../components/input'
import { Modal } from '../../../../../components/modal'

interface CategoryModalProps {
	isOpen: boolean
	category?: Category
	onClose: () => void
	onSuccess: () => void
}

export default function CategoryModal({
	isOpen,
	category,
	onClose,
	onSuccess,
}: CategoryModalProps) {
	const toast = useToast()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: category?.name || '',
		description: category?.description || '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			toast.showToast('Введите название категории', 'error')
			return
		}

		try {
			setLoading(true)
			if (category) {
				await updateCategory(category.id, formData)
				toast.showToast('Категория успешно обновлена', 'success')
			} else {
				await createCategory(formData)
				toast.showToast('Категория успешно создана', 'success')
			}
			onSuccess()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message ||
					`Ошибка ${category ? 'обновления' : 'создания'} категории`,
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={category ? 'Редактировать категорию' : 'Новая категория'}
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<Input
					label='Название'
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
					placeholder='Например: Мясо и птица'
					required
				/>

				<div className='space-y-2'>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Описание (необязательно)
					</label>
					<textarea
						value={formData.description}
						onChange={e =>
							setFormData({ ...formData, description: e.target.value })
						}
						placeholder='Краткое описание категории'
						rows={3}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
				</div>

				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={onClose}
						disabled={loading}
						className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading}
						className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50'
					>
						{loading ? 'Сохранение...' : category ? 'Сохранить' : 'Создать'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
