import { useEffect, useState } from 'react'
import * as CategoriesAPI from '../../../../../api/services/categories'
import type {
	CategoryTreeNode,
	CreateCategoryDto,
	UpdateCategoryDto,
} from '../../../../../api/types/categories'
import { Input, Modal, Select, useToast } from '../../../../../components'

interface CategoryModalProps {
	isOpen: boolean
	onClose: () => void
	mode: 'create' | 'edit'
	category?: CategoryTreeNode | null
	allCategories: CategoryTreeNode[]
	onSuccess: () => void
}

export const CategoryModal = ({
	isOpen,
	onClose,
	mode,
	category,
	allCategories,
	onSuccess,
}: CategoryModalProps) => {
	const { showToast } = useToast()
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		slug: '',
		parentId: '' as string | null,
		isActive: true,
	})

	useEffect(() => {
		if (mode === 'edit' && category) {
			setFormData({
				name: category.name,
				slug: category.slug,
				parentId: category.parentId || '',
				isActive: category.isActive,
			})
		} else {
			setFormData({
				name: '',
				slug: '',
				parentId: '',
				isActive: true,
			})
		}
	}, [mode, category, isOpen])

	// Автогенерация slug из названия
	const generateSlug = (name: string) => {
		const translit: Record<string, string> = {
			а: 'a',
			б: 'b',
			в: 'v',
			г: 'g',
			д: 'd',
			е: 'e',
			ё: 'yo',
			ж: 'zh',
			з: 'z',
			и: 'i',
			й: 'y',
			к: 'k',
			л: 'l',
			м: 'm',
			н: 'n',
			о: 'o',
			п: 'p',
			р: 'r',
			с: 's',
			т: 't',
			у: 'u',
			ф: 'f',
			х: 'h',
			ц: 'ts',
			ч: 'ch',
			ш: 'sh',
			щ: 'sch',
			ъ: '',
			ы: 'y',
			ь: '',
			э: 'e',
			ю: 'yu',
			я: 'ya',
		}

		return name
			.toLowerCase()
			.split('')
			.map(char => translit[char] || char)
			.join('')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	const handleNameChange = (value: string) => {
		setFormData(prev => ({
			...prev,
			name: value,
			// Автогенерация slug только при создании
			slug: mode === 'create' ? generateSlug(value) : prev.slug,
		}))
	}

	// Получаем список доступных родительских категорий (исключая самого себя и потомков)
	const getAvailableParentCategories = (): Array<{
		value: string
		label: string
	}> => {
		const options: Array<{ value: string; label: string }> = [
			{ value: '', label: 'Без родителя (корневая)' },
		]

		// Если режим редактирования, нужно исключить саму категорию и ее потомков
		const excludedIds = new Set<string>()
		if (mode === 'edit' && category) {
			excludedIds.add(category.id)
			// Рекурсивно добавляем всех потомков
			const addDescendants = (cat: CategoryTreeNode) => {
				cat.children?.forEach(child => {
					excludedIds.add(child.id)
					addDescendants(child)
				})
			}
			addDescendants(category)
		}

		// Функция для получения полного пути к категории
		const getCategoryPath = (
			targetId: string,
			cats: CategoryTreeNode[],
			currentPath: string[] = []
		): string[] | null => {
			for (const cat of cats) {
				if (cat.id === targetId) {
					return [...currentPath, cat.name]
				}
				if (cat.children && cat.children.length > 0) {
					const path = getCategoryPath(targetId, cat.children, [
						...currentPath,
						cat.name,
					])
					if (path) return path
				}
			}
			return null
		}

		// Рекурсивная функция для добавления категорий с полным путем
		const addCategoryOptions = (cats: CategoryTreeNode[]) => {
			cats.forEach(cat => {
				if (!excludedIds.has(cat.id)) {
					const path = getCategoryPath(cat.id, allCategories)
					const label = path ? path.join(' → ') : cat.name

					options.push({
						value: cat.id,
						label: label,
					})
					if (cat.children && cat.children.length > 0) {
						addCategoryOptions(cat.children)
					}
				}
			})
		}

		addCategoryOptions(allCategories)
		return options
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			if (mode === 'create') {
				const dto: CreateCategoryDto = {
					name: formData.name,
					slug: formData.slug || undefined,
					parentId: formData.parentId || null,
					isActive: formData.isActive,
				}
				await CategoriesAPI.createCategory(dto)
				showToast('Категория успешно создана', 'success')
			} else if (category) {
				const dto: UpdateCategoryDto = {
					name: formData.name,
					slug: formData.slug,
					parentId: formData.parentId || null,
					isActive: formData.isActive,
				}
				await CategoriesAPI.updateCategory(category.id, dto)
				showToast('Категория успешно обновлена', 'success')
			}

			onSuccess()
			onClose()
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Произошла ошибка при сохранении'
			showToast(message, 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				mode === 'create' ? 'Создать категорию' : 'Редактировать категорию'
			}
			maxWidth='2xl'
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* Название */}
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Название <span className='text-red-500'>*</span>
					</label>
					<Input
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleNameChange(e.target.value)
						}
						placeholder='Молочные продукты'
						required
						minLength={2}
						maxLength={100}
					/>
				</div>

				{/* Slug */}
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Slug (URL)
					</label>
					<Input
						value={formData.slug}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFormData({ ...formData, slug: e.target.value })
						}
						placeholder='molochnye-produkty'
					/>
					<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
						Превью: /api/categories/{formData.slug || '...'}
					</p>
				</div>

				{/* Родительская категория */}
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Родительская категория
					</label>
					<Select
						value={formData.parentId || ''}
						onChange={(value: string) =>
							setFormData({ ...formData, parentId: value || null })
						}
						options={getAvailableParentCategories()}
						searchable={true}
						placeholder='Выберите родительскую категорию'
					/>
				</div>

				{/* Статус активности */}
				<div className='flex items-center gap-2'>
					<input
						type='checkbox'
						id='isActive'
						checked={formData.isActive}
						onChange={e =>
							setFormData({ ...formData, isActive: e.target.checked })
						}
						className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
					/>
					<label
						htmlFor='isActive'
						className='text-sm font-medium text-gray-700 dark:text-gray-300'
					>
						Активна
					</label>
				</div>

				{/* Кнопки */}
				<div className='flex items-center justify-end gap-3 pt-4'>
					<button
						type='button'
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading || !formData.name.trim()}
						className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{loading ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
