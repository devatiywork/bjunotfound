import { Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	createDishTag,
	deleteDishTag,
	getDishTags,
	updateDishTag,
} from '../../../../../api/services'
import type { DishTag } from '../../../../../api/types'
import type { TagCategory } from '../../../../../api/types/dishes.ts'
import { TAG_CATEGORY_NAMES } from '../../../../../api/types/dishes.ts'
import { useToast } from '../../../../../components'
import { Input } from '../../../../../components/input'
import { Modal } from '../../../../../components/modal'
import { Select } from '../../../../../components/select'

interface DishTagModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
}

export default function DishTagModal({
	isOpen,
	onClose,
	onSuccess,
}: DishTagModalProps) {
	const toast = useToast()
	const [loading, setLoading] = useState(false)
	const [tags, setTags] = useState<DishTag[]>([])
	const [editingTag, setEditingTag] = useState<DishTag | null>(null)
	const [formData, setFormData] = useState({
		name: '',
		category: 'DIETARY' as TagCategory,
	})

	useEffect(() => {
		if (isOpen) {
			loadTags()
		}
	}, [isOpen])

	const loadTags = async () => {
		try {
			const data = await getDishTags()
			setTags(data)
		} catch (error: any) {
			toast.showToast('Ошибка загрузки тегов', 'error')
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			toast.showToast('Введите название тега', 'error')
			return
		}

		try {
			setLoading(true)
			if (editingTag) {
				await updateDishTag(editingTag.id, formData)
				toast.showToast('Тег успешно обновлен', 'success')
			} else {
				await createDishTag(formData)
				toast.showToast('Тег успешно создан', 'success')
			}
			setFormData({ name: '', category: 'DIETARY' as TagCategory })
			setEditingTag(null)
			loadTags()
			onSuccess()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message ||
					`Ошибка ${editingTag ? 'обновления' : 'создания'} тега`,
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (tag: DishTag) => {
		setEditingTag(tag)
		setFormData({
			name: tag.name,
			category: tag.category,
		})
	}

	const handleDelete = async (tag: DishTag) => {
		if (!confirm(`Удалить тег "${tag.name}"?`)) return

		try {
			await deleteDishTag(tag.id)
			toast.showToast('Тег успешно удален', 'success')
			loadTags()
			onSuccess()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message || 'Ошибка удаления тега',
				'error'
			)
		}
	}

	const cancelEdit = () => {
		setEditingTag(null)
		setFormData({ name: '', category: 'DIETARY' as TagCategory })
	}

	// Группировка тегов по категориям
	const groupedTags = tags.reduce((acc, tag) => {
		if (!acc[tag.category]) {
			acc[tag.category] = []
		}
		acc[tag.category].push(tag)
		return acc
	}, {} as Record<TagCategory, DishTag[]>)

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Управление тегами блюд'
			maxWidth='2xl'
		>
			<div className='space-y-6'>
				{/* Form */}
				<form
					onSubmit={handleSubmit}
					className='space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg'
				>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Input
							label='Название'
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							placeholder='Например: Вегетарианское'
							required
						/>
						<Select
							label='Категория'
							value={formData.category}
							onChange={value =>
								setFormData({
									...formData,
									category: value as TagCategory,
								})
							}
							options={Object.entries(TAG_CATEGORY_NAMES).map(
								([value, label]) => ({
									value,
									label,
								})
							)}
							required
						/>
					</div>

					<div className='flex gap-3'>
						{editingTag && (
							<button
								type='button'
								onClick={cancelEdit}
								className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors'
							>
								Отмена
							</button>
						)}
						<button
							type='submit'
							disabled={loading}
							className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50'
						>
							{loading
								? 'Сохранение...'
								: editingTag
								? 'Обновить тег'
								: 'Создать тег'}
						</button>
					</div>
				</form>

				{/* Tags List */}
				<div className='space-y-4 max-h-96 overflow-y-auto'>
					{Object.entries(groupedTags).map(([category, categoryTags]) => (
						<div key={category} className='space-y-2'>
							<h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
								{TAG_CATEGORY_NAMES[category as TagCategory]} (
								{categoryTags.length})
							</h3>
							<div className='grid grid-cols-1 gap-2'>
								{categoryTags.map(tag => (
									<div
										key={tag.id}
										className='flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
									>
										<div>
											<span className='text-gray-900 dark:text-white font-medium'>
												{tag.name}
											</span>
											{tag._count && (
												<span className='ml-2 text-xs text-gray-500 dark:text-gray-400'>
													({tag._count.dishes} блюд)
												</span>
											)}
										</div>
										<div className='flex gap-2'>
											<button
												onClick={() => handleEdit(tag)}
												className='p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors'
												title='Редактировать'
											>
												<Edit className='w-4 h-4' />
											</button>
											<button
												onClick={() => handleDelete(tag)}
												className='p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors'
												title='Удалить'
											>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					))}

					{tags.length === 0 && (
						<p className='text-center text-gray-500 dark:text-gray-400 py-8'>
							Пока нет тегов
						</p>
					)}
				</div>

				{/* Footer */}
				<div className='flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700'>
					<button
						type='button'
						onClick={onClose}
						className='px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
					>
						Закрыть
					</button>
				</div>
			</div>
		</Modal>
	)
}
