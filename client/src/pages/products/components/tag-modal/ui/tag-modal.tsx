import { useState } from 'react'
import { createTag, updateTag } from '../../../../../api/services'
import type { Tag } from '../../../../../api/types'
import { useToast } from '../../../../../components'
import { Input } from '../../../../../components/input'
import { Modal } from '../../../../../components/modal'

interface TagModalProps {
	isOpen: boolean
	tag?: Tag
	onClose: () => void
	onSuccess: () => void
}

export default function TagModal({
	isOpen,
	tag,
	onClose,
	onSuccess,
}: TagModalProps) {
	const toast = useToast()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: tag?.name || '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			toast.showToast('Введите название тега', 'error')
			return
		}

		try {
			setLoading(true)
			if (tag) {
				await updateTag(tag.id, formData)
				toast.showToast('Тег успешно обновлен', 'success')
			} else {
				await createTag(formData)
				toast.showToast('Тег успешно создан', 'success')
			}
			onSuccess()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message ||
					`Ошибка ${tag ? 'обновления' : 'создания'} тега`,
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
			title={tag ? 'Редактировать тег' : 'Новый тег'}
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<Input
					label='Название'
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
					placeholder='Например: Веган, Без глютена'
					required
				/>

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
						{loading ? 'Сохранение...' : tag ? 'Сохранить' : 'Создать'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
