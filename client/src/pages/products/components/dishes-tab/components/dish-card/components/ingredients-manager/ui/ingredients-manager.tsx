import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import {
	addDishItem,
	deleteDishItem,
	reorderDishItems,
	updateDishItem,
	type CreateDishItemDto,
	type DishItem,
	type UpdateDishItemDto,
} from '../../../../../../../../../api'
import { ConfirmModal, useToast } from '../../../../../../../../../components'
import { IngredientItem, IngredientModal } from '../../ingredients-section'

interface IngredientsManagerProps {
	dishId: string
	items: DishItem[]
	editMode: boolean
	onRefresh: () => Promise<void>
}

export const IngredientsManager = ({
	dishId,
	items,
	editMode,
	onRefresh,
}: IngredientsManagerProps) => {
	const { showToast } = useToast()

	// Модальное окно добавления/редактирования
	const [modalOpen, setModalOpen] = useState(false)
	const [editingItem, setEditingItem] = useState<DishItem | null>(null)

	// Модальное окно подтверждения удаления
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [itemToDelete, setItemToDelete] = useState<DishItem | null>(null)

	// Состояние загрузки
	const [saving, setSaving] = useState(false)

	// Открыть модалку для добавления
	const handleAddClick = () => {
		setEditingItem(null)
		setModalOpen(true)
	}

	// Открыть модалку для редактирования
	const handleEditItem = (item: DishItem) => {
		setEditingItem(item)
		setModalOpen(true)
	}

	// Сохранение ингредиента (добавление или обновление)
	const handleSaveItem = useCallback(
		async (data: CreateDishItemDto | UpdateDishItemDto) => {
			setSaving(true)
			try {
				if (editingItem) {
					// Обновление существующего
					await updateDishItem(
						dishId,
						editingItem.id,
						data as UpdateDishItemDto
					)
					showToast('Ингредиент обновлен', 'success')
				} else {
					// Добавление нового
					await addDishItem(dishId, data as CreateDishItemDto)
					showToast('Ингредиент добавлен', 'success')
				}
				await onRefresh()
				setModalOpen(false)
				setEditingItem(null)
			} catch (error) {
				console.error('Error saving ingredient:', error)
				showToast('Ошибка при сохранении ингредиента', 'error')
				throw error
			} finally {
				setSaving(false)
			}
		},
		[dishId, editingItem, onRefresh, showToast]
	)

	// Запрос на удаление
	const handleDeleteRequest = (item: DishItem) => {
		setItemToDelete(item)
		setDeleteConfirmOpen(true)
	}

	// Подтверждение удаления
	const handleConfirmDelete = async () => {
		if (!itemToDelete) return

		setSaving(true)
		try {
			await deleteDishItem(dishId, itemToDelete.id)
			showToast('Ингредиент удален', 'success')
			await onRefresh()
		} catch (error) {
			console.error('Error deleting ingredient:', error)
			showToast('Ошибка при удалении ингредиента', 'error')
		} finally {
			setSaving(false)
			setDeleteConfirmOpen(false)
			setItemToDelete(null)
		}
	}

	// Перемещение вверх
	const handleMoveUp = async (item: DishItem) => {
		const index = items.findIndex(i => i.id === item.id)
		if (index <= 0) return

		const newItems = [...items]
		;[newItems[index - 1], newItems[index]] = [
			newItems[index],
			newItems[index - 1],
		]

		const reorderData = newItems.map((i, idx) => ({
			id: i.id,
			sortOrder: idx,
		}))

		setSaving(true)
		try {
			await reorderDishItems(dishId, { items: reorderData })
			await onRefresh()
		} catch (error) {
			console.error('Error reordering:', error)
			showToast('Ошибка при перемещении', 'error')
		} finally {
			setSaving(false)
		}
	}

	// Перемещение вниз
	const handleMoveDown = async (item: DishItem) => {
		const index = items.findIndex(i => i.id === item.id)
		if (index < 0 || index >= items.length - 1) return

		const newItems = [...items]
		;[newItems[index], newItems[index + 1]] = [
			newItems[index + 1],
			newItems[index],
		]

		const reorderData = newItems.map((i, idx) => ({
			id: i.id,
			sortOrder: idx,
		}))

		setSaving(true)
		try {
			await reorderDishItems(dishId, { items: reorderData })
			await onRefresh()
		} catch (error) {
			console.error('Error reordering:', error)
			showToast('Ошибка при перемещении', 'error')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div>
			{/* Заголовок с кнопкой добавления */}
			<div className='flex items-center justify-between gap-3 mb-4'>
				<h3 className='text-lg font-bold text-gray-900 dark:text-white'>
					Состав блюда {items.length > 0 && `(${items.length})`}
				</h3>
				<button
					onClick={handleAddClick}
					disabled={saving}
					className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50'
				>
					<Plus size={16} />
					Добавить
				</button>
			</div>

			{/* Список ингредиентов */}
			{items.length === 0 ? (
				<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center'>
					<p className='text-gray-500 dark:text-gray-400 text-sm'>
						Нажмите "Добавить" чтобы добавить первый ингредиент
					</p>
				</div>
			) : (
				<div className='space-y-2'>
					{items.map((item, index) => (
						<IngredientItem
							key={item.id}
							item={item}
							isFirst={index === 0}
							isLast={index === items.length - 1}
							editMode={editMode}
							onEdit={handleEditItem}
							onDelete={handleDeleteRequest}
							onMoveUp={handleMoveUp}
							onMoveDown={handleMoveDown}
						/>
					))}
				</div>
			)}

			{/* Модалка добавления/редактирования */}
			<IngredientModal
				isOpen={modalOpen}
				onClose={() => {
					setModalOpen(false)
					setEditingItem(null)
				}}
				onSave={handleSaveItem}
				initialData={editingItem}
			/>

			{/* Подтверждение удаления */}
			<ConfirmModal
				isOpen={deleteConfirmOpen}
				onClose={() => {
					setDeleteConfirmOpen(false)
					setItemToDelete(null)
				}}
				onConfirm={handleConfirmDelete}
				title='Удалить ингредиент'
				message={`Вы уверены, что хотите удалить "${
					itemToDelete?.productUser?.names?.[0]?.name || 'ингредиент'
				}" из блюда?`}
			/>
		</div>
	)
}
