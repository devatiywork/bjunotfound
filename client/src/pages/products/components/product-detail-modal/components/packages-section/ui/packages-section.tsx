import { ChevronDown, ChevronUp, Edit2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import * as ProductsAPI from '../../../../../../../api/services/products'
import type {
	CreatePackageDto,
	ProductPackage,
	ProductUserResponse,
	UpdatePackageDto,
} from '../../../../../../../api/types/products'
import { ConfirmModal, useToast } from '../../../../../../../components'
import { PackageModal } from '../../package-modal'

interface PackagesSectionProps {
	product: ProductUserResponse
	formatDate: (date: string) => string
	isEditing: boolean
	onPackageUpdate: () => void
	isOwner: boolean
}

export const PackagesSection = ({
	product,
	formatDate,
	isEditing,
	onPackageUpdate,
	isOwner,
}: PackagesSectionProps) => {
	const { showToast } = useToast()
	const [modalOpen, setModalOpen] = useState(false)
	const [editingPackage, setEditingPackage] = useState<ProductPackage | null>(
		null
	)
	const [saving, setSaving] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [packageToDelete, setPackageToDelete] = useState<ProductPackage | null>(
		null
	)
	const [deleting, setDeleting] = useState(false)
	const [showAllPackages, setShowAllPackages] = useState(false)

	const handleOpenCreateModal = () => {
		setEditingPackage(null)
		setModalOpen(true)
	}

	const handleOpenEditModal = (pkg: ProductPackage) => {
		setEditingPackage(pkg)
		setModalOpen(true)
	}

	const handleCloseModal = () => {
		setModalOpen(false)
		setEditingPackage(null)
	}

	const handleSave = async (data: CreatePackageDto | UpdatePackageDto) => {
		setSaving(true)
		try {
			if (editingPackage) {
				// Редактирование
				await ProductsAPI.updatePackage(
					product.id,
					editingPackage.id,
					data as UpdatePackageDto
				)
				showToast('Покупка обновлена', 'success')
			} else {
				// Создание
				await ProductsAPI.createPackage(product.id, data as CreatePackageDto)
				showToast('Покупка добавлена', 'success')
			}
			onPackageUpdate()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при сохранении'
			showToast(errorMessage, 'error')
			throw error
		} finally {
			setSaving(false)
		}
	}

	const handleOpenDeleteModal = (pkg: ProductPackage) => {
		setPackageToDelete(pkg)
		setDeleteModalOpen(true)
	}

	const handleCloseDeleteModal = () => {
		setDeleteModalOpen(false)
		setPackageToDelete(null)
	}

	const handleDelete = async () => {
		if (!packageToDelete) return

		setDeleting(true)
		try {
			await ProductsAPI.deletePackage(product.id, packageToDelete.id)
			showToast('Покупка удалена', 'success')
			onPackageUpdate()
			setDeleteModalOpen(false)
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при удалении'
			showToast(errorMessage, 'error')
		} finally {
			setDeleting(false)
		}
	}

	const formatWeight = (pkg: ProductPackage) => {
		const parts = []
		if (pkg.totalWeightG) parts.push(`${pkg.totalWeightG}г`)
		if (pkg.totalVolumeMl) parts.push(`${pkg.totalVolumeMl}мл`)
		return parts.join(' / ') || 'Не указано'
	}

	const hasPackages = product.packages && product.packages.length > 0
	const packagesList = product.packages || []
	const displayPackages = showAllPackages
		? packagesList
		: packagesList.slice(0, 5)
	const hasMorePackages = packagesList.length > 5

	return (
		<section>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
					История покупок ({product.packages?.length || 0})
				</h3>
				{isEditing && isOwner && (
					<button
						onClick={handleOpenCreateModal}
						className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
					>
						<Plus className='w-4 h-4' />
						Добавить
					</button>
				)}
			</div>

			{!hasPackages ? (
				<div className='text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600'>
					<p className='text-gray-600 dark:text-gray-400 mb-2'>
						История покупок пуста
					</p>
					{isEditing && isOwner && (
						<button
							onClick={handleOpenCreateModal}
							className='text-blue-600 dark:text-blue-400 hover:underline text-sm'
						>
							Добавить первую покупку
						</button>
					)}
				</div>
			) : (
				<div className='space-y-3'>
					{displayPackages.map((pkg: ProductPackage, index: number) => (
						<div
							key={pkg.id}
							className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group shadow-sm'
						>
							{/* Номер покупки */}
							<div className='flex items-center gap-2 mb-3'>
								<span className='bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium'>
									Покупка #{index + 1}
								</span>
								<div className='h-px bg-gray-200 dark:bg-gray-600 flex-1' />
							</div>
							{/* Кнопки действий */}
							{isEditing && isOwner && (
								<div className='absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
									<button
										onClick={() => handleOpenEditModal(pkg)}
										className='p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
										title='Редактировать'
									>
										<Edit2 className='w-3.5 h-3.5' />
									</button>
									<button
										onClick={() => handleOpenDeleteModal(pkg)}
										className='p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
										title='Удалить'
									>
										<Trash2 className='w-3.5 h-3.5' />
									</button>
								</div>
							)}

							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 pr-20'>
								<div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										Вес/Объем
									</p>
									<p className='text-sm font-medium text-gray-800 dark:text-white'>
										{formatWeight(pkg)}
									</p>
								</div>

								<div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										Цена
									</p>
									<p className='text-sm font-medium text-gray-800 dark:text-white'>
										{pkg.priceTotal} {pkg.currency}
									</p>
								</div>

								<div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										Магазин
									</p>
									<p className='text-sm font-medium text-gray-800 dark:text-white overflow-wrap-break-word'>
										{pkg.store || 'Не указан'}
									</p>
								</div>

								<div>
									<p className='text-xs text-gray-600 dark:text-gray-400'>
										Дата покупки
									</p>
									<p className='text-sm font-medium text-gray-800 dark:text-white'>
										{formatDate(pkg.purchasedAt)}
									</p>
								</div>
							</div>

							{/* Заметка */}
							{pkg.note && (
								<div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-600'>
									<p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
										Заметка
									</p>
									<p className='text-sm text-gray-800 dark:text-gray-200'>
										{pkg.note}
									</p>
								</div>
							)}
						</div>
					))}

					{/* Кнопка показать все/скрыть */}
					{hasMorePackages && (
						<button
							onClick={() => setShowAllPackages(!showAllPackages)}
							className='w-full flex items-center justify-center gap-2 py-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800'
						>
							{showAllPackages ? (
								<>
									<ChevronUp className='w-4 h-4' />
									Скрыть ({packagesList.length - 5} из {packagesList.length})
								</>
							) : (
								<>
									<ChevronDown className='w-4 h-4' />
									Показать все ({packagesList.length})
								</>
							)}
						</button>
					)}
				</div>
			)}

			{/* Модалка создания/редактирования */}
			<PackageModal
				isOpen={modalOpen}
				onClose={handleCloseModal}
				onSave={handleSave}
				package={editingPackage || undefined}
				title={editingPackage ? 'Редактировать покупку' : 'Добавить покупку'}
				saving={saving}
			/>

			{/* Модалка подтверждения удаления */}
			<ConfirmModal
				isOpen={deleteModalOpen}
				onClose={handleCloseDeleteModal}
				onConfirm={handleDelete}
				title='Удалить покупку'
				message={`Вы уверены, что хотите удалить покупку${
					packageToDelete
						? ` от ${formatDate(packageToDelete.purchasedAt)} на сумму ${
								packageToDelete.priceTotal
						  } ${packageToDelete.currency}`
						: ''
				}?\n\nЭто действие необратимо.`}
				confirmText='Удалить'
				cancelText='Отмена'
				variant='danger'
				loading={deleting}
			/>
		</section>
	)
}
