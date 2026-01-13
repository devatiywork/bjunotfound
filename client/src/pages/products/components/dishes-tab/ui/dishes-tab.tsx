import { useCallback, useEffect, useState } from 'react'
import * as DishesAPI from '../../../../../api/services/dishes'
import type {
	CreateDishDto,
	Dish,
	ListDishesResponse,
	UpdateDishDto,
} from '../../../../../api/types'
import { ConfirmModal, useToast } from '../../../../../components'
import {
	DishesFilters,
	DishesList,
	DishFormModal,
	type FilterTab,
} from '../components'

export const DishesTab = () => {
	const { showToast } = useToast()

	const [dishes, setDishes] = useState<Dish[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [activeTab, setActiveTab] = useState<FilterTab>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	// Модальные окна
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [editingDish, setEditingDish] = useState<Dish | null>(null)
	const [expandedDishId, setExpandedDishId] = useState<string | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{
		dishId: string
		dishName: string
	} | null>(null)
	const [archiveConfirm, setArchiveConfirm] = useState<{
		dishId: string
		dishName: string
		isArchived: boolean
	} | null>(null)

	// Состояния операций
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [counts, setCounts] = useState({
		all: 0,
		ready: 0,
		draft: 0,
		archived: 0,
	})

	// Загрузка данных
	const loadDishes = useCallback(async () => {
		try {
			setIsLoading(true)
			const response = await getDishesData(activeTab, search, currentPage)
			setDishes(response.data)
			setTotalPages(response.meta.totalPages)

			// Обновляем счетчики (только при первой загрузке)
			if (currentPage === 1 && !search) {
				try {
					const [allResponse, readyResponse, draftResponse, archivedResponse] =
						await Promise.all([
							DishesAPI.listDishes({ limit: 1 }),
							DishesAPI.listDishes({ status: 'READY', limit: 1 }),
							DishesAPI.listDishes({ status: 'DRAFT', limit: 1 }),
							DishesAPI.listArchivedDishes({ limit: 1 }),
						])

					setCounts({
						all: allResponse.meta.total,
						ready: readyResponse.meta.total,
						draft: draftResponse.meta.total,
						archived: archivedResponse.meta.total,
					})
				} catch (error) {
					console.error('Error updating counts:', error)
				}
			}
		} catch (error) {
			console.error('Error loading dishes:', error)
			showToast('Ошибка при загрузке блюд', 'error')
		} finally {
			setIsLoading(false)
		}
	}, [activeTab, search, currentPage, showToast])

	useEffect(() => {
		loadDishes()
	}, [loadDishes])

	// Обработчики
	const handleCreateDish = async (data: CreateDishDto | UpdateDishDto) => {
		setIsSubmitting(true)
		try {
			const newDish = await DishesAPI.createDish(data as CreateDishDto)
			await loadDishes()
			setIsCreateModalOpen(false)
			setExpandedDishId(newDish.id)
			showToast('Блюдо создано успешно', 'success')
		} catch (error) {
			console.error('Error creating dish:', error)
			showToast('Ошибка при создании блюда', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleEditDish = async (data: CreateDishDto | UpdateDishDto) => {
		if (!editingDish) return

		setIsSubmitting(true)
		try {
			await DishesAPI.updateDish(editingDish.id, data as UpdateDishDto)
			await loadDishes()
			setEditingDish(null)
			showToast('Блюдо обновлено успешно', 'success')
		} catch (error) {
			console.error('Error updating dish:', error)
			showToast('Ошибка при обновлении блюда', 'error')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteDish = async () => {
		if (!deleteConfirm) return

		try {
			await DishesAPI.deleteDish(deleteConfirm.dishId)
			await loadDishes()
			showToast('Блюдо удалено', 'success')
		} catch (error) {
			console.error('Error deleting dish:', error)
			showToast('Ошибка при удалении блюда', 'error')
		} finally {
			setDeleteConfirm(null)
		}
	}

	const handleArchiveDish = async () => {
		if (!archiveConfirm) return

		try {
			if (archiveConfirm.isArchived) {
				await DishesAPI.restoreDish(archiveConfirm.dishId)
			} else {
				await DishesAPI.archiveDish(archiveConfirm.dishId)
			}
			await loadDishes()
			const action = archiveConfirm.isArchived
				? 'восстановлено'
				: 'архивировано'
			showToast(`Блюдо ${action}`, 'success')
		} catch (error) {
			console.error('Error archiving dish:', error)
			const action = archiveConfirm.isArchived
				? 'восстановлении'
				: 'архивировании'
			showToast(`Ошибка при ${action} блюда`, 'error')
		} finally {
			setArchiveConfirm(null)
		}
	}

	const handleTabChange = (tab: FilterTab) => {
		setActiveTab(tab)
		setCurrentPage(1)
	}

	const handleSearchChange = (value: string) => {
		setSearch(value)
		setCurrentPage(1)
	}

	return (
		<div className='space-y-6'>
			{/* Шапка с кнопкой создания */}
			<div className='flex justify-between items-center'>
				<div>
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Список блюд
					</h2>
					<p className='text-sm text-gray-600 dark:text-gray-400'>
						Создавайте и управляйте своими рецептами
					</p>
				</div>
				<button
					onClick={() => setIsCreateModalOpen(true)}
					className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2'
				>
					<svg
						className='w-4 h-4'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 6v6m0 0v6m0-6h6m-6 0H6'
						/>
					</svg>
					<span>Создать блюдо</span>
				</button>
			</div>

			{/* Фильтры */}
			<DishesFilters
				search={search}
				onSearchChange={handleSearchChange}
				activeTab={activeTab}
				onTabChange={handleTabChange}
				counts={counts}
			/>

			{/* Список блюд */}
			<DishesList
				dishes={dishes}
				isLoading={isLoading}
				onEdit={setEditingDish}
				onArchive={dishId => {
					const dish = dishes.find(d => d.id === dishId)
					if (dish) {
						setArchiveConfirm({
							dishId,
							dishName: dish.name,
							isArchived: dish.isArchived,
						})
					}
				}}
				onDelete={dishId => {
					const dish = dishes.find(d => d.id === dishId)
					if (dish) {
						setDeleteConfirm({ dishId, dishName: dish.name })
					}
				}}
				onRefresh={loadDishes}
				expandedDishId={expandedDishId}
				onExpandedDishClose={() => setExpandedDishId(null)}
			/>

			{/* Пагинация */}
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

			{/* Модальные окна */}
			<DishFormModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateDish}
				isLoading={isSubmitting}
			/>

			<DishFormModal
				isOpen={!!editingDish}
				onClose={() => setEditingDish(null)}
				onSubmit={handleEditDish}
				dish={editingDish}
				isLoading={isSubmitting}
			/>

			<ConfirmModal
				isOpen={!!deleteConfirm}
				onClose={() => setDeleteConfirm(null)}
				onConfirm={handleDeleteDish}
				title='Удалить блюдо?'
				message={`Вы уверены, что хотите удалить блюдо "${deleteConfirm?.dishName}"? Это действие нельзя отменить.`}
				confirmText='Удалить'
			/>

			<ConfirmModal
				isOpen={!!archiveConfirm}
				onClose={() => setArchiveConfirm(null)}
				onConfirm={handleArchiveDish}
				title={
					archiveConfirm?.isArchived
						? 'Восстановить блюдо?'
						: 'Архивировать блюдо?'
				}
				message={`${
					archiveConfirm?.isArchived ? 'Восстановить' : 'Архивировать'
				} блюдо "${archiveConfirm?.dishName}"?`}
				confirmText={
					archiveConfirm?.isArchived ? 'Восстановить' : 'Архивировать'
				}
			/>
		</div>
	)
}

// Утилитарные функции
async function getDishesData(
	activeTab: FilterTab,
	search: string,
	page: number
): Promise<ListDishesResponse> {
	const params = {
		page,
		limit: 12,
		...(search && { search }),
	}

	switch (activeTab) {
		case 'ready':
			return DishesAPI.listDishes({ ...params, status: 'READY' })
		case 'draft':
			return DishesAPI.listDishes({ ...params, status: 'DRAFT' })
		case 'archived':
			return DishesAPI.listArchivedDishes(params)
		default:
			return DishesAPI.listDishes(params)
	}
}

// Компонент пагинации
const Pagination = ({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}) => {
	return (
		<div className='flex justify-center items-center space-x-2'>
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage <= 1}
				className='px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
			>
				Назад
			</button>

			<span className='px-3 py-1 text-sm text-gray-600 dark:text-gray-400'>
				{currentPage} из {totalPages}
			</span>

			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages}
				className='px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
			>
				Вперед
			</button>
		</div>
	)
}
