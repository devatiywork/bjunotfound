import { ChevronDown, ChevronUp, Edit2, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import * as ProductsAPI from '../../../../../../../api/services/products'
import type {
	CreateServingDto,
	ProductServing,
	ProductUserResponse,
	UpdateServingDto,
} from '../../../../../../../api/types/products'
import { ConfirmModal, useToast } from '../../../../../../../components'
import { ServingModal } from '../../serving-modal'

interface ServingsSectionProps {
	product: ProductUserResponse
	isEditing: boolean
	onServingUpdate: () => void
	isOwner: boolean
}

export const ServingsSection: React.FC<ServingsSectionProps> = ({
	product,
	isEditing,
	onServingUpdate,
	isOwner,
}) => {
	const { showToast } = useToast()
	const [servingModalOpen, setServingModalOpen] = useState(false)
	const [editingServing, setEditingServing] = useState<ProductServing | null>(
		null
	)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [servingToDelete, setServingToDelete] = useState<ProductServing | null>(
		null
	)
	const [deleting, setDeleting] = useState(false)
	const [showAllServings, setShowAllServings] = useState(false)

	const handleSaveServing = async (
		data: CreateServingDto | UpdateServingDto
	) => {
		try {
			if (editingServing) {
				// Редактирование
				await ProductsAPI.updateServing(
					product.id,
					editingServing.id,
					data as UpdateServingDto
				)
				showToast('Порция обновлена', 'success')
			} else {
				// Создание
				await ProductsAPI.createServing(product.id, data as CreateServingDto)
				showToast('Порция добавлена', 'success')
			}
			onServingUpdate()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при сохранении'
			showToast(errorMessage, 'error')
			throw error
		}
	}

	const handleOpenCreateModal = () => {
		setEditingServing(null)
		setServingModalOpen(true)
	}

	const handleOpenEditModal = (serving: ProductServing) => {
		setEditingServing(serving)
		setServingModalOpen(true)
	}

	const handleCloseModal = () => {
		setServingModalOpen(false)
		setEditingServing(null)
	}

	const handleOpenDeleteModal = (serving: ProductServing) => {
		setServingToDelete(serving)
		setDeleteModalOpen(true)
	}

	const handleCloseDeleteModal = () => {
		setDeleteModalOpen(false)
		setServingToDelete(null)
	}

	const handleDelete = async () => {
		if (!servingToDelete) return

		setDeleting(true)
		try {
			await ProductsAPI.deleteServing(product.id, servingToDelete.id)
			showToast('Порция удалена', 'success')
			onServingUpdate()
			setDeleteModalOpen(false)
			setServingToDelete(null)
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при удалении'
			showToast(errorMessage, 'error')
		} finally {
			setDeleting(false)
		}
	}

	const formatServing = (serving: ProductServing): string => {
		const parts = []
		if (serving.weightG) parts.push(`${serving.weightG}г`)
		if (serving.volumeMl) parts.push(`${serving.volumeMl}мл`)
		return parts.join(' • ')
	}

	const servingsList = product.servings || []
	const displayServings = showAllServings
		? servingsList
		: servingsList.slice(0, 5)
	const hasMoreServings = servingsList.length > 5

	if (servingsList.length === 0) {
		return (
			<section>
				<div className='flex items-center justify-between mb-3'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Порции (0)
					</h3>
					{isEditing && isOwner && (
						<button
							onClick={handleOpenCreateModal}
							className='flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
							title='Добавить порцию'
						>
							<Plus className='w-4 h-4' />
							Добавить
						</button>
					)}
				</div>

				<div className='text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600'>
					<p className='text-gray-600 dark:text-gray-400 mb-2'>
						Нет добавленных порций
					</p>
					{isEditing && isOwner && (
						<button
							onClick={handleOpenCreateModal}
							className='text-blue-600 dark:text-blue-400 hover:underline text-sm'
						>
							Добавить первую порцию
						</button>
					)}
				</div>

				{/* Модальное окно для создания/редактирования */}
				<ServingModal
					isOpen={servingModalOpen}
					onClose={handleCloseModal}
					onSave={handleSaveServing}
					serving={editingServing || undefined}
				/>
			</section>
		)
	}

	return (
		<section>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
					Порции ({servingsList.length})
				</h3>
				{isEditing && isOwner && (
					<button
						onClick={handleOpenCreateModal}
						className='flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
						title='Добавить порцию'
					>
						<Plus className='w-4 h-4' />
						Добавить
					</button>
				)}
			</div>

			<div className='space-y-3'>
				{displayServings.map((serving: ProductServing, index: number) => (
					<div
						key={serving.id}
						className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group shadow-sm'
					>
						{/* Номер порции */}
						<div className='flex items-center gap-2 mb-3'>
							<span className='bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium'>
								Порция #{index + 1}
							</span>
							{serving.isDefault && (
								<span className='bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium'>
									По умолчанию
								</span>
							)}
							<div className='h-px bg-gray-200 dark:bg-gray-600 flex-1' />
						</div>

						{/* Кнопки действий */}
						{isEditing && isOwner && (
							<div className='absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
								<button
									onClick={() => handleOpenEditModal(serving)}
									className='p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
									title='Редактировать'
								>
									<Edit2 className='w-3.5 h-3.5' />
								</button>
								<button
									onClick={() => handleOpenDeleteModal(serving)}
									className='p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
									title='Удалить'
								>
									<Trash2 className='w-3.5 h-3.5' />
								</button>
							</div>
						)}

						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 pr-20'>
							<div>
								<p className='text-xs text-gray-600 dark:text-gray-400'>
									Название
								</p>
								<p className='text-sm font-medium text-gray-800 dark:text-white wrap-break-word'>
									{serving.name}
								</p>
							</div>

							<div>
								<p className='text-xs text-gray-600 dark:text-gray-400'>
									Вес/Объем
								</p>
								<p className='text-sm font-medium text-gray-800 dark:text-white'>
									{formatServing(serving) || 'Не указано'}
								</p>
							</div>

							<div>
								<p className='text-xs text-gray-600 dark:text-gray-400'>
									Количество
								</p>
								<p className='text-sm font-medium text-gray-800 dark:text-white'>
									{serving.amountUnits} шт
								</p>
							</div>
						</div>
					</div>
				))}

				{/* Кнопка показать все/скрыть */}
				{hasMoreServings && (
					<button
						onClick={() => setShowAllServings(!showAllServings)}
						className='w-full flex items-center justify-center gap-2 py-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800'
					>
						{showAllServings ? (
							<>
								<ChevronUp className='w-4 h-4' />
								Скрыть ({servingsList.length - 5} из {servingsList.length})
							</>
						) : (
							<>
								<ChevronDown className='w-4 h-4' />
								Показать все ({servingsList.length})
							</>
						)}
					</button>
				)}
			</div>

			{/* Модальные окна */}
			<ServingModal
				isOpen={servingModalOpen}
				onClose={handleCloseModal}
				onSave={handleSaveServing}
				serving={editingServing || undefined}
			/>

			<ConfirmModal
				isOpen={deleteModalOpen}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDelete}
				title='Удалить порцию'
				message={`Вы уверены, что хотите удалить порцию "${servingToDelete?.name}"? Это действие нельзя отменить.`}
				confirmText='Удалить'
				variant='danger'
				loading={deleting}
			/>
		</section>
	)
}
