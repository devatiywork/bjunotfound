import { Building2, Check, Image, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import type { Brand } from '../../../../../api/types/brands'
import { ConfirmModal, useToast } from '../../../../../components'
import { BrandModal } from '../../brand-modal'
import { BrandPhotoModal } from '../../brand-photo-modal'

interface BrandsManagementProps {
	isAdmin: boolean
}

export const BrandsManagement = ({ isAdmin }: BrandsManagementProps) => {
	const { showToast } = useToast()
	const [brands, setBrands] = useState<Brand[]>([])
	const [loading, setLoading] = useState(true)
	const [activeView, setActiveView] = useState<'all' | 'pending' | 'my'>(
		isAdmin ? 'all' : 'my'
	)

	// Модальные окна
	const [brandModalOpen, setBrandModalOpen] = useState(false)
	const [brandModalMode, setBrandModalMode] = useState<'create' | 'edit'>(
		'create'
	)
	const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
	const [photoModalOpen, setPhotoModalOpen] = useState(false)
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [deleteMessage, setDeleteMessage] = useState('')
	const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)

	// Модальное окно одобрения/отклонения
	const [rejectModalOpen, setRejectModalOpen] = useState(false)
	const [rejectReason, setRejectReason] = useState('')
	const [brandToModerate, setBrandToModerate] = useState<Brand | null>(null)
	const [moderateLoading, setModerateLoading] = useState(false)

	useEffect(() => {
		loadBrands()
	}, [activeView])

	// Синхронизация выбранного бренда с списком
	useEffect(() => {
		if (selectedBrand) {
			const updated = brands.find(b => b.id === selectedBrand.id)
			if (updated && updated !== selectedBrand) {
				setSelectedBrand(updated)
			}
		}
	}, [brands])

	async function loadBrands() {
		setLoading(true)
		try {
			let data: Brand[]
			if (activeView === 'all') {
				data = await BrandsAPI.listBrands()
			} else if (activeView === 'pending') {
				data = await BrandsAPI.listPendingBrands()
			} else {
				data = await BrandsAPI.listMyBrands()
			}
			setBrands(data)
		} catch (error: any) {
			showToast('Ошибка при загрузке брендов', 'error')
		} finally {
			setLoading(false)
		}
	}

	const handleCreateBrand = () => {
		setSelectedBrand(null)
		setBrandModalMode('create')
		setBrandModalOpen(true)
	}

	const handleEditBrand = (brand: Brand) => {
		setSelectedBrand(brand)
		setBrandModalMode('edit')
		setBrandModalOpen(true)
	}

	const handleDeleteBrand = (brand: Brand) => {
		const productsCount =
			(brand._count?.productsGlobal || 0) + (brand._count?.productsUser || 0)

		setBrandToDelete(brand)

		if (productsCount > 0) {
			setDeleteMessage(
				`Невозможно удалить бренд "${brand.name}".\n\nБренд используется в ${productsCount} продуктах.\n\nСначала удалите или измените все продукты, использующие этот бренд.`
			)
		} else {
			setDeleteMessage(
				`Вы уверены, что хотите удалить бренд "${brand.name}"?\n\nЭто действие необратимо.`
			)
		}

		setConfirmModalOpen(true)
	}

	const confirmDelete = async () => {
		if (!brandToDelete) return

		const productsCount =
			(brandToDelete._count?.productsGlobal || 0) +
			(brandToDelete._count?.productsUser || 0)

		if (productsCount > 0) {
			setConfirmModalOpen(false)
			return
		}

		setDeleteLoading(true)
		try {
			await BrandsAPI.deleteBrand(brandToDelete.id)
			showToast('Бренд успешно удален', 'success')
			setConfirmModalOpen(false)
			loadBrands()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при удалении бренда'
			showToast(errorMessage, 'error')
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleManagePhotos = (brand: Brand) => {
		setPhotoModalOpen(true)
		setSelectedBrand(brand)
	}

	const handleApproveBrand = async (brand: Brand) => {
		setModerateLoading(true)
		try {
			await BrandsAPI.approveBrand(brand.id)
			showToast('Бренд одобрен', 'success')
			loadBrands()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при одобрении бренда'
			showToast(errorMessage, 'error')
		} finally {
			setModerateLoading(false)
		}
	}

	const handleRejectBrand = (brand: Brand) => {
		setBrandToModerate(brand)
		setRejectReason('')
		setRejectModalOpen(true)
	}

	const confirmReject = async () => {
		if (!brandToModerate || !rejectReason.trim()) return

		setModerateLoading(true)
		try {
			await BrandsAPI.rejectBrand(brandToModerate.id, {
				reason: rejectReason,
			})
			showToast('Бренд отклонен', 'success')
			setRejectModalOpen(false)
			loadBrands()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при отклонении бренда'
			showToast(errorMessage, 'error')
		} finally {
			setModerateLoading(false)
		}
	}

	const getStatusBadge = (brand: Brand) => {
		if (brand.isApproved) {
			return (
				<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'>
					<Check className='w-3 h-3' />
					Одобрен
				</span>
			)
		}
		if (brand.rejectedAt) {
			return (
				<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'>
					<X className='w-3 h-3' />
					Отклонен
				</span>
			)
		}
		return (
			<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'>
				На модерации
			</span>
		)
	}

	return (
		<div>
			{/* Панель действий */}
			<div className='flex flex-col sm:flex-row gap-4 mb-6'>
				{/* Переключатель видов */}
				<div className='flex-1'>
					<div className='inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1'>
						{isAdmin && (
							<>
								<button
									onClick={() => setActiveView('all')}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										activeView === 'all'
											? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-700 dark:text-gray-300'
									}`}
								>
									Все бренды
								</button>
								<button
									onClick={() => setActiveView('pending')}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										activeView === 'pending'
											? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
											: 'text-gray-700 dark:text-gray-300'
									}`}
								>
									На модерации
								</button>
							</>
						)}
						<button
							onClick={() => setActiveView('my')}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeView === 'my'
									? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
									: 'text-gray-700 dark:text-gray-300'
							}`}
						>
							Мои бренды
						</button>
					</div>
				</div>

				{/* Кнопка создания */}
				<button
					onClick={handleCreateBrand}
					className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
				>
					<Plus className='w-5 h-5' />
					Создать бренд
				</button>
			</div>

			{/* Список брендов */}
			{loading ? (
				<div className='text-center py-12'>
					<div className='inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600'></div>
					<p className='mt-4 text-gray-600 dark:text-gray-400'>
						Загрузка брендов...
					</p>
				</div>
			) : !brands || brands.length === 0 ? (
				<div className='text-center py-12'>
					<Building2 className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500' />
					<h3 className='mt-4 text-lg font-medium text-gray-900 dark:text-white'>
						Бренды не найдены
					</h3>
					<p className='mt-2 text-gray-600 dark:text-gray-400'>
						{activeView === 'pending'
							? 'Нет брендов на модерации'
							: activeView === 'my'
							? 'Вы еще не создали ни одного бренда'
							: 'В системе пока нет брендов'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{brands.map(brand => (
						<div
							key={brand.id}
							className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow'
						>
							{/* Фото бренда */}
							{brand.photos && brand.photos.length > 0 ? (
								<div className='mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video'>
									<img
										src={brand.photos[0]}
										alt={brand.name}
										className='w-full h-full object-contain'
										loading='lazy'
									/>
								</div>
							) : (
								<div className='mb-3 rounded-lg bg-gray-100 dark:bg-gray-700 aspect-video flex items-center justify-center'>
									<Building2 className='w-12 h-12 text-gray-400 dark:text-gray-500' />
								</div>
							)}

							{/* Информация */}
							<div className='mb-3'>
								<div className='flex items-start justify-between gap-2 mb-2'>
									<h3 className='font-semibold text-gray-900 dark:text-white'>
										{brand.name}
									</h3>
									{getStatusBadge(brand)}
								</div>
								{brand.country && (
									<p className='text-sm text-gray-600 dark:text-gray-400'>
										{brand.country}
									</p>
								)}
								{brand.rejectionReason && (
									<div className='mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-400'>
										<strong>Причина отклонения:</strong> {brand.rejectionReason}
									</div>
								)}
							</div>

							{/* Действия */}
							<div className='flex flex-wrap gap-2'>
								{isAdmin && (
									<>
										<button
											onClick={() => handleEditBrand(brand)}
											className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors'
											title='Редактировать'
										>
											<Pencil className='w-4 h-4' />
										</button>
										<button
											onClick={() => handleManagePhotos(brand)}
											className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors'
											title='Управление фото'
										>
											<Image className='w-4 h-4' />
										</button>
										<button
											onClick={() => handleDeleteBrand(brand)}
											className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded transition-colors'
											title='Удалить'
										>
											<Trash2 className='w-4 h-4' />
										</button>
									</>
								)}

								{/* Модерация для админов */}
								{isAdmin && !brand.isApproved && !brand.rejectedAt && (
									<>
										<button
											onClick={() => handleApproveBrand(brand)}
											disabled={moderateLoading}
											className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded transition-colors disabled:opacity-50'
										>
											<Check className='w-4 h-4' />
											Одобрить
										</button>
										<button
											onClick={() => handleRejectBrand(brand)}
											disabled={moderateLoading}
											className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded transition-colors disabled:opacity-50'
										>
											<X className='w-4 h-4' />
											Отклонить
										</button>
									</>
								)}

								{/* Для обычного пользователя - только управление фото своих брендов */}
								{!isAdmin && (
									<button
										onClick={() => handleManagePhotos(brand)}
										className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors'
									>
										<Image className='w-4 h-4' />
										Фото
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Модальные окна */}
			<BrandModal
				isOpen={brandModalOpen}
				onClose={() => setBrandModalOpen(false)}
				mode={brandModalMode}
				brand={selectedBrand}
				onSuccess={loadBrands}
			/>

			<BrandPhotoModal
				isOpen={photoModalOpen}
				onClose={() => {
					setPhotoModalOpen(false)
					setSelectedBrand(null)
				}}
				brand={selectedBrand}
				isAdmin={isAdmin}
				onSuccess={loadBrands}
			/>

			<ConfirmModal
				isOpen={confirmModalOpen}
				onClose={() => setConfirmModalOpen(false)}
				onConfirm={confirmDelete}
				title='Удаление бренда'
				message={deleteMessage}
				confirmText={
					brandToDelete &&
					(brandToDelete._count?.productsGlobal || 0) +
						(brandToDelete._count?.productsUser || 0) >
						0
						? 'Понятно'
						: 'Удалить'
				}
				variant={
					brandToDelete &&
					(brandToDelete._count?.productsGlobal || 0) +
						(brandToDelete._count?.productsUser || 0) >
						0
						? 'warning'
						: 'danger'
				}
				loading={deleteLoading}
			/>

			{/* Модальное окно отклонения */}
			{rejectModalOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6'>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
							Отклонение бренда
						</h3>
						<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
							Укажите причину отклонения бренда "{brandToModerate?.name}"
						</p>
						<textarea
							value={rejectReason}
							onChange={e => setRejectReason(e.target.value)}
							placeholder='Причина отклонения (10-500 символов)'
							rows={4}
							className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							minLength={10}
							maxLength={500}
						/>
						<div className='flex gap-3 mt-4'>
							<button
								onClick={() => setRejectModalOpen(false)}
								disabled={moderateLoading}
								className='flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50'
							>
								Отмена
							</button>
							<button
								onClick={confirmReject}
								disabled={
									moderateLoading ||
									rejectReason.trim().length < 10 ||
									rejectReason.trim().length > 500
								}
								className='flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50'
							>
								{moderateLoading ? 'Отклонение...' : 'Отклонить'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
