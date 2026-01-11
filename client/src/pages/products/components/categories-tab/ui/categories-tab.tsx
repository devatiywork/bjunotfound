import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as CategoriesAPI from '../../../../../api/services/categories'
import type { CategoryTreeNode } from '../../../../../api/types/categories'
import { ConfirmModal, Input, useToast } from '../../../../../components'
import {
	CategoryModal,
	CategoryTreeItemContainer,
	PhotoModal,
} from '../../index'

interface CategoriesTabProps {
	isAdmin: boolean
}

export const CategoriesTab = ({ isAdmin }: CategoriesTabProps) => {
	const { showToast } = useToast()

	// Состояние категорий
	const [categories, setCategories] = useState<CategoryTreeNode[]>([])
	const [categoriesLoading, setCategoriesLoading] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [onlyActive, setOnlyActive] = useState(false)
	const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
		new Set()
	)

	// Модальные окна
	const [categoryModalOpen, setCategoryModalOpen] = useState(false)
	const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>(
		'create'
	)
	const [selectedCategory, setSelectedCategory] =
		useState<CategoryTreeNode | null>(null)
	const [photoModalOpen, setPhotoModalOpen] = useState(false)
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [deleteMessage, setDeleteMessage] = useState('')
	const [categoryToDelete, setCategoryToDelete] =
		useState<CategoryTreeNode | null>(null)

	useEffect(() => {
		if (isAdmin) {
			loadCategories()
		}
	}, [isAdmin, onlyActive])

	async function loadCategories() {
		setCategoriesLoading(true)
		try {
			if (searchQuery) {
				// Поиск - используем list с фильтром
				const response = await CategoriesAPI.listCategories({
					search: searchQuery,
					onlyActive,
				})
				// Преобразуем в плоский список (не дерево)
				setCategories(response.categories as any)
			} else {
				// Дерево категорий
				const response = await CategoriesAPI.getCategoryTree({
					onlyActive,
				})
				setCategories(response.tree)
			}
		} catch (error: any) {
			showToast('Ошибка при загрузке категорий', 'error')
		} finally {
			setCategoriesLoading(false)
		}
	}

	// Debounce поиска
	useEffect(() => {
		if (!isAdmin) return

		const timeoutId = setTimeout(() => {
			loadCategories()
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [searchQuery])

	const handleCreateCategory = () => {
		setSelectedCategory(null)
		setCategoryModalMode('create')
		setCategoryModalOpen(true)
	}

	const handleEditCategory = (category: CategoryTreeNode) => {
		setSelectedCategory(category)
		setCategoryModalMode('edit')
		setCategoryModalOpen(true)
	}

	const handleDeleteCategory = (category: CategoryTreeNode) => {
		const hasData =
			(category._count?.children || 0) > 0 ||
			(category._count?.productsGlobal || 0) > 0 ||
			(category._count?.productsUser || 0) > 0

		setCategoryToDelete(category)

		if (hasData) {
			setDeleteMessage(
				`У категории "${category.name}" есть связанные данные:\n\n` +
					`• Подкатегорий: ${category._count?.children || 0}\n` +
					`• Глобальных продуктов: ${category._count?.productsGlobal || 0}\n` +
					`• Пользовательских продуктов: ${
						category._count?.productsUser || 0
					}\n\n` +
					`Удаление невозможно. Сначала удалите или переместите связанные данные.`
			)
		} else {
			setDeleteMessage(
				`Вы уверены, что хотите удалить категорию "${category.name}"?\n\nЭто действие необратимо.`
			)
		}

		setConfirmModalOpen(true)
	}

	const confirmDelete = async () => {
		if (!categoryToDelete) return

		const hasData =
			(categoryToDelete._count?.children || 0) > 0 ||
			(categoryToDelete._count?.productsGlobal || 0) > 0 ||
			(categoryToDelete._count?.productsUser || 0) > 0

		if (hasData) {
			// Если есть данные, просто закрываем модалку (это информационное сообщение)
			setConfirmModalOpen(false)
			return
		}

		setDeleteLoading(true)
		try {
			await CategoriesAPI.deleteCategory(categoryToDelete.id)
			showToast('Категория успешно удалена', 'success')
			setConfirmModalOpen(false)
			loadCategories()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при удалении категории'
			showToast(errorMessage, 'error')
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleManagePhotos = (category: CategoryTreeNode) => {
		setSelectedCategory(category)
		setPhotoModalOpen(true)
	}

	const handleModalSuccess = () => {
		loadCategories()
	}

	const handleToggleExpand = (categoryId: string) => {
		setExpandedCategories(prev => {
			const newSet = new Set(prev)
			if (newSet.has(categoryId)) {
				newSet.delete(categoryId)
			} else {
				newSet.add(categoryId)
			}
			return newSet
		})
	}

	// Вспомогательная функция для подсчета всех категорий в дереве
	function countAllCategories(categories: CategoryTreeNode[]): number {
		let count = 0
		categories.forEach(cat => {
			count++
			if (cat.children && cat.children.length > 0) {
				count += countAllCategories(cat.children)
			}
		})
		return count
	}

	return (
		<div>
			{/* Панель действий */}
			<div className='mb-6 flex flex-col sm:flex-row gap-4 justify-between'>
				<div className='flex-1 flex gap-3'>
					{/* Поиск */}
					<div className='relative flex-1 max-w-md'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500' />
						<Input
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							placeholder='Поиск категорий...'
							className='pl-10'
						/>
					</div>

					{/* Фильтр активных */}
					<label className='flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'>
						<input
							type='checkbox'
							checked={onlyActive}
							onChange={e => setOnlyActive(e.target.checked)}
							className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
						/>
						<span className='text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap'>
							Только активные
						</span>
					</label>
				</div>

				{/* Кнопка создания */}
				<button
					onClick={handleCreateCategory}
					className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
				>
					<Plus className='w-5 h-5' />
					<span>Добавить категорию</span>
				</button>
			</div>

			{/* Счетчик */}
			<div className='mb-4'>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					{categoriesLoading
						? 'Загрузка...'
						: `Всего категорий: ${
								searchQuery ? categories.length : countAllCategories(categories)
						  }`}
				</p>
			</div>

			{/* Список/Дерево категорий */}
			{categoriesLoading ? (
				<div className='flex items-center justify-center py-12'>
					<div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
				</div>
			) : categories.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-gray-400 dark:text-gray-500 mb-4'>
						<svg
							className='mx-auto h-12 w-12'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
							/>
						</svg>
					</div>
					<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
						{searchQuery ? 'Категории не найдены' : 'Категории отсутствуют'}
					</h3>
					<p className='text-gray-600 dark:text-gray-400 mb-4'>
						{searchQuery
							? 'Попробуйте изменить запрос поиска'
							: 'Создайте первую категорию для начала работы'}
					</p>
					{!searchQuery && (
						<button
							onClick={handleCreateCategory}
							className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
						>
							<Plus className='w-5 h-5' />
							<span>Создать категорию</span>
						</button>
					)}
				</div>
			) : (
				<div className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
					{categories.map(category => (
						<CategoryTreeItemContainer
							key={category.id}
							category={category}
							level={0}
							onEdit={handleEditCategory}
							onDelete={handleDeleteCategory}
							onManagePhotos={handleManagePhotos}
							expandedCategories={expandedCategories}
							onToggleExpand={handleToggleExpand}
						/>
					))}
				</div>
			)}

			{/* Модальные окна */}
			<CategoryModal
				isOpen={categoryModalOpen}
				onClose={() => setCategoryModalOpen(false)}
				mode={categoryModalMode}
				category={selectedCategory}
				allCategories={categories}
				onSuccess={handleModalSuccess}
			/>
			<PhotoModal
				isOpen={photoModalOpen}
				onClose={() => setPhotoModalOpen(false)}
				category={selectedCategory}
				onSuccess={handleModalSuccess}
			/>
			<ConfirmModal
				isOpen={confirmModalOpen}
				onClose={() => setConfirmModalOpen(false)}
				onConfirm={confirmDelete}
				title={
					categoryToDelete &&
					((categoryToDelete._count?.children || 0) > 0 ||
						(categoryToDelete._count?.productsGlobal || 0) > 0 ||
						(categoryToDelete._count?.productsUser || 0) > 0)
						? 'Невозможно удалить'
						: 'Подтвердите удаление'
				}
				message={deleteMessage}
				confirmText={
					categoryToDelete &&
					((categoryToDelete._count?.children || 0) > 0 ||
						(categoryToDelete._count?.productsGlobal || 0) > 0 ||
						(categoryToDelete._count?.productsUser || 0) > 0)
						? 'Понятно'
						: 'Удалить'
				}
				cancelText='Отмена'
				variant={
					categoryToDelete &&
					((categoryToDelete._count?.children || 0) > 0 ||
						(categoryToDelete._count?.productsGlobal || 0) > 0 ||
						(categoryToDelete._count?.productsUser || 0) > 0)
						? 'warning'
						: 'danger'
				}
				loading={deleteLoading}
			/>
		</div>
	)
}
