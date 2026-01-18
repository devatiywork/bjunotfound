import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import * as CategoriesAPI from '../../../../../api/services/categories'
import type {
	CategoryTreeNode,
	CreateCategoryDto,
} from '../../../../../api/types/categories'
import { Input, Modal, Select, useToast } from '../../../../../components'

interface CategoryEntry {
	id: string // Временный ID для списка
	name: string
	slug: string
	isActive: boolean
	photoFile: File | null
	photoPreview: string | null
}

interface MultiCategoryModalProps {
	isOpen: boolean
	onClose: () => void
	allCategories: CategoryTreeNode[]
	onSuccess: () => void
}

export const MultiCategoryModal = ({
	isOpen,
	onClose,
	allCategories,
	onSuccess,
}: MultiCategoryModalProps) => {
	const { showToast } = useToast()
	const [loading, setLoading] = useState(false)
	const [parentId, setParentId] = useState<string | null>(null)
	const [categories, setCategories] = useState<CategoryEntry[]>([
		createEmptyEntry(),
	])
	const [creationProgress, setCreationProgress] = useState<{
		current: number
		total: number
		phase: 'creating' | 'uploading' | null
	}>({ current: 0, total: 0, phase: null })

	// Генерация уникального ID
	function generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
	}

	// Создать пустую запись категории
	function createEmptyEntry(): CategoryEntry {
		return {
			id: generateId(),
			name: '',
			slug: '',
			isActive: true,
			photoFile: null,
			photoPreview: null,
		}
	}

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

	// Получаем список доступных родительских категорий
	const getParentOptions = (): Array<{ value: string; label: string }> => {
		const options: Array<{ value: string; label: string }> = [
			{ value: '', label: 'Без родителя (корневые категории)' },
		]

		// Функция для получения полного пути к категории
		const getCategoryPath = (
			targetId: string,
			cats: CategoryTreeNode[],
			currentPath: string[] = [],
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
				const path = getCategoryPath(cat.id, allCategories)
				const label = path ? path.join(' → ') : cat.name

				options.push({
					value: cat.id,
					label: label,
				})
				if (cat.children && cat.children.length > 0) {
					addCategoryOptions(cat.children)
				}
			})
		}

		addCategoryOptions(allCategories)
		return options
	}

	// Обновить запись категории
	const updateCategory = (id: string, updates: Partial<CategoryEntry>) => {
		setCategories(prev =>
			prev.map(cat => (cat.id === id ? { ...cat, ...updates } : cat)),
		)
	}

	// Изменение названия с автогенерацией slug
	const handleNameChange = (id: string, name: string) => {
		updateCategory(id, {
			name,
			slug: generateSlug(name),
		})
	}

	// Добавить новую категорию
	const addCategory = () => {
		setCategories(prev => [...prev, createEmptyEntry()])
	}

	// Удалить категорию из списка
	const removeCategory = (id: string) => {
		setCategories(prev => {
			// Если остается только одна, просто очищаем её
			if (prev.length === 1) {
				return [createEmptyEntry()]
			}
			return prev.filter(cat => cat.id !== id)
		})
	}

	// Обработка выбора файла фото
	const handlePhotoSelect = (id: string, file: File | null) => {
		if (!file) {
			updateCategory(id, { photoFile: null, photoPreview: null })
			return
		}

		// Валидация
		const validTypes = ['image/jpeg', 'image/png', 'image/webp']
		if (!validTypes.includes(file.type)) {
			showToast('Допустимые форматы: JPEG, PNG, WebP', 'error')
			return
		}

		const maxSize = 5 * 1024 * 1024 // 5MB
		if (file.size > maxSize) {
			showToast('Максимальный размер файла: 5MB', 'error')
			return
		}

		// Создаем preview
		const reader = new FileReader()
		reader.onload = e => {
			updateCategory(id, {
				photoFile: file,
				photoPreview: e.target?.result as string,
			})
		}
		reader.readAsDataURL(file)
	}

	// Удалить фото из категории
	const removePhoto = (id: string) => {
		updateCategory(id, { photoFile: null, photoPreview: null })
	}

	// Валидация перед отправкой
	const validateCategories = (): boolean => {
		const validCategories = categories.filter(cat => cat.name.trim())
		if (validCategories.length === 0) {
			showToast('Добавьте хотя бы одну категорию с названием', 'error')
			return false
		}

		// Проверка на дубликаты названий
		const names = validCategories.map(cat => cat.name.trim().toLowerCase())
		const uniqueNames = new Set(names)
		if (names.length !== uniqueNames.size) {
			showToast('Названия категорий не должны повторяться', 'error')
			return false
		}

		// Проверка на минимальную длину
		for (const cat of validCategories) {
			if (cat.name.trim().length < 2) {
				showToast(
					'Название категории должно содержать минимум 2 символа',
					'error',
				)
				return false
			}
		}

		return true
	}

	// Отправка формы
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateCategories()) return

		const validCategories = categories.filter(cat => cat.name.trim())
		setLoading(true)
		setCreationProgress({
			current: 0,
			total: validCategories.length,
			phase: 'creating',
		})

		const createdCategories: Array<{
			tempId: string
			realId: string
			photoFile: File | null
		}> = []

		try {
			// Фаза 1: Создание категорий
			for (let i = 0; i < validCategories.length; i++) {
				const cat = validCategories[i]
				setCreationProgress(prev => ({ ...prev, current: i + 1 }))

				try {
					const dto: CreateCategoryDto = {
						name: cat.name.trim(),
						slug: cat.slug || undefined,
						parentId: parentId || null,
						isActive: cat.isActive,
					}

					const created = await CategoriesAPI.createCategory(dto)
					createdCategories.push({
						tempId: cat.id,
						realId: created.id,
						photoFile: cat.photoFile,
					})
				} catch (error: any) {
					const message =
						error.response?.data?.message || `Ошибка при создании "${cat.name}"`
					showToast(message, 'error')
				}
			}

			// Фаза 2: Загрузка фотографий
			const categoriesWithPhotos = createdCategories.filter(c => c.photoFile)
			if (categoriesWithPhotos.length > 0) {
				setCreationProgress({
					current: 0,
					total: categoriesWithPhotos.length,
					phase: 'uploading',
				})

				for (let i = 0; i < categoriesWithPhotos.length; i++) {
					const cat = categoriesWithPhotos[i]
					setCreationProgress(prev => ({ ...prev, current: i + 1 }))

					try {
						await CategoriesAPI.uploadCategoryPhoto(cat.realId, cat.photoFile!)
					} catch (error: any) {
						const message =
							error.response?.data?.message || 'Ошибка при загрузке фото'
						showToast(message, 'error')
					}
				}
			}

			// Результат
			const successCount = createdCategories.length
			if (successCount > 0) {
				showToast(
					`Успешно создано категорий: ${successCount}${
						categoriesWithPhotos.length > 0
							? `, загружено фото: ${categoriesWithPhotos.length}`
							: ''
					}`,
					'success',
				)
				onSuccess()
				handleClose()
			}
		} catch (error: any) {
			showToast('Произошла непредвиденная ошибка', 'error')
		} finally {
			setLoading(false)
			setCreationProgress({ current: 0, total: 0, phase: null })
		}
	}

	// Закрытие и сброс
	const handleClose = () => {
		setCategories([createEmptyEntry()])
		setParentId(null)
		setCreationProgress({ current: 0, total: 0, phase: null })
		onClose()
	}

	// Количество валидных категорий
	const validCount = categories.filter(cat => cat.name.trim()).length

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Множественное добавление категорий'
			maxWidth='4xl'
		>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Общая родительская категория */}
				<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Родительская категория для всех
					</label>
					<Select
						value={parentId || ''}
						onChange={(value: string) => setParentId(value || null)}
						options={getParentOptions()}
						searchable={true}
						placeholder='Выберите родительскую категорию'
					/>
					<p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
						Все создаваемые категории будут добавлены в выбранную родительскую
						категорию
					</p>
				</div>

				{/* Прогресс создания */}
				{creationProgress.phase && (
					<div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
						<div className='flex items-center gap-3 mb-2'>
							<div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
							<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								{creationProgress.phase === 'creating'
									? `Создание категорий: ${creationProgress.current} / ${creationProgress.total}`
									: `Загрузка фотографий: ${creationProgress.current} / ${creationProgress.total}`}
							</span>
						</div>
						<div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
							<div
								className='bg-blue-600 h-2 rounded-full transition-all duration-300'
								style={{
									width: `${(creationProgress.current / creationProgress.total) * 100}%`,
								}}
							/>
						</div>
					</div>
				)}

				{/* Список категорий */}
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
							Категории ({validCount} из {categories.length})
						</h3>
						<button
							type='button'
							onClick={addCategory}
							disabled={loading}
							className='flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50'
						>
							<Plus className='w-4 h-4' />
							Добавить ещё
						</button>
					</div>

					<div className='space-y-3 max-h-100 overflow-y-auto pr-2'>
						{categories.map((cat, index) => (
							<div
								key={cat.id}
								className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600'
							>
								<div className='flex items-start gap-4'>
									{/* Фото */}
									<div className='shrink-0'>
										{cat.photoPreview ? (
											<div className='relative group'>
												<img
													src={cat.photoPreview}
													alt='Preview'
													className='w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600'
												/>
												<button
													type='button'
													onClick={() => removePhoto(cat.id)}
													disabled={loading}
													className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50'
												>
													<X className='w-3 h-3' />
												</button>
											</div>
										) : (
											<label
												className={`flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors ${
													loading ? 'opacity-50 cursor-not-allowed' : ''
												}`}
											>
												<ImagePlus className='w-6 h-6 text-gray-400 dark:text-gray-500' />
												<span className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
													Фото
												</span>
												<input
													type='file'
													accept='image/jpeg,image/png,image/webp'
													onChange={e =>
														handlePhotoSelect(
															cat.id,
															e.target.files?.[0] || null,
														)
													}
													disabled={loading}
													className='hidden'
												/>
											</label>
										)}
									</div>

									{/* Поля */}
									<div className='flex-1 space-y-3'>
										<div className='flex gap-3'>
											{/* Номер */}
											<div className='shrink-0 w-8 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300'>
												{index + 1}
											</div>

											{/* Название */}
											<div className='flex-1'>
												<Input
													value={cat.name}
													onChange={e =>
														handleNameChange(cat.id, e.target.value)
													}
													placeholder='Название категории'
													disabled={loading}
													minLength={2}
													maxLength={100}
												/>
											</div>

											{/* Кнопка удаления */}
											<button
												type='button'
												onClick={() => removeCategory(cat.id)}
												disabled={loading}
												className='shrink-0 p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors disabled:opacity-50'
												title='Удалить'
											>
												<Trash2 className='w-5 h-5' />
											</button>
										</div>

										<div className='flex gap-3 items-center'>
											{/* Slug */}
											<div className='flex-1'>
												<Input
													value={cat.slug}
													onChange={e =>
														updateCategory(cat.id, { slug: e.target.value })
													}
													placeholder='slug-kategorii'
													disabled={loading}
													className='text-sm'
												/>
											</div>

											{/* Активность */}
											<label className='flex items-center gap-2 cursor-pointer'>
												<input
													type='checkbox'
													checked={cat.isActive}
													onChange={e =>
														updateCategory(cat.id, {
															isActive: e.target.checked,
														})
													}
													disabled={loading}
													className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
												/>
												<span className='text-sm text-gray-600 dark:text-gray-400'>
													Активна
												</span>
											</label>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Кнопки */}
				<div className='flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700'>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						Будет создано категорий:{' '}
						<span className='font-medium text-gray-700 dark:text-gray-300'>
							{validCount}
						</span>
						{categories.filter(c => c.photoFile).length > 0 && (
							<>
								, с фото:{' '}
								<span className='font-medium text-gray-700 dark:text-gray-300'>
									{categories.filter(c => c.photoFile).length}
								</span>
							</>
						)}
					</p>

					<div className='flex items-center gap-3'>
						<button
							type='button'
							onClick={handleClose}
							disabled={loading}
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50'
						>
							Отмена
						</button>
						<button
							type='submit'
							disabled={loading || validCount === 0}
							className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading
								? 'Создание...'
								: `Создать ${validCount > 1 ? `${validCount} категории` : 'категорию'}`}
						</button>
					</div>
				</div>
			</form>
		</Modal>
	)
}
