import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	deleteDishPhoto,
	getDishWithCalculations,
	updateDish,
	updateDishStatus,
	uploadDishPhoto,
	type Dish,
	type DishWithCalculations,
	type UpdateDishDto,
} from '../../../../../../../api'
import { Modal, useToast } from '../../../../../../../components'
import {
	DescriptionBlock,
	DescriptionEditor,
	DishImagePreview,
	DishStatusBadge,
	EditableFields,
	IngredientsManager,
	LoadingState,
	NutritionSection,
	PhotosSection,
	PriceSection,
	TechnicalSection,
} from '../components'

interface DishCardProps {
	dish: Dish
	onEdit: (dish: Dish) => void
	onDelete: (dishId: string) => void
	onArchive: (dishId: string) => void
	onRefresh: () => void | Promise<void>
	autoExpand?: boolean
	onAutoExpandClose?: () => void
}

export const DishCard = ({
	dish,
	onDelete,
	onArchive,
	autoExpand,
	onAutoExpandClose,
}: DishCardProps) => {
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement | null>(null)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [details, setDetails] = useState<DishWithCalculations | null>(null)
	const [loading, setLoading] = useState(false)
	const { showToast } = useToast()
	const coverPhoto = details?.dish?.photos?.[0] || dish.photos?.[0] || null
	const [editMode, setEditMode] = useState(false)
	const [saving, setSaving] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState<number | null>(null)
	const [showAllPhotos, setShowAllPhotos] = useState(false)
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
	const [formValues, setFormValues] = useState({
		name: dish.name,
		description: dish.description ?? '',
		portions: dish.portions ?? 1,
	})
	const [showReadyConfirm, setShowReadyConfirm] = useState(false)
	const [settingReady, setSettingReady] = useState(false)

	const loadDishDetails = useCallback(async () => {
		setLoading(true)
		try {
			const data = await getDishWithCalculations(dish.id)
			setDetails(data)
		} catch (error) {
			console.error('Error loading dish details:', error)
			showToast('Ошибка при загрузке деталей блюда', 'error')
		} finally {
			setLoading(false)
		}
	}, [dish.id, showToast])

	// Автоматическое раскрытие блюда после создания
	useEffect(() => {
		if (autoExpand) {
			setDetailModalOpen(true)
		}
	}, [autoExpand])

	useEffect(() => {
		if (detailModalOpen) {
			loadDishDetails()
		}
	}, [detailModalOpen, loadDishDetails])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const baseDish = useMemo(() => details?.dish ?? dish, [details?.dish, dish])
	const ingredients = details?.items ?? []
	const calculations = details?.computed
	const ingredientsCount = ingredients.length || dish._count?.items || 0
	const photos = useMemo(
		() => details?.dish?.photos ?? dish.photos ?? [],
		[details?.dish?.photos, dish.photos]
	)

	useEffect(() => {
		if (editMode) return
		setFormValues({
			name: baseDish.name,
			description: baseDish.description ?? '',
			portions: baseDish.portions ?? 1,
		})
	}, [baseDish.name, baseDish.description, baseDish.portions, editMode])

	const handleFieldChange = (
		key: 'name' | 'description' | 'portions',
		value: string
	) => {
		setFormValues(prev => ({
			...prev,
			[key]: key === 'portions' ? Number(value) || 0 : value,
		}))
	}

	const handleStartEdit = () => {
		if (!details) {
			loadDishDetails()
		}
		setEditMode(true)
	}

	const handleCancelEdit = () => {
		setEditMode(false)
		setFormValues({
			name: baseDish.name,
			description: baseDish.description ?? '',
			portions: baseDish.portions ?? 1,
		})
	}

	const handleSave = async () => {
		setSaving(true)
		try {
			const payload: UpdateDishDto = {
				name: formValues.name?.trim() || baseDish.name,
				description: formValues.description,
				portions: Math.max(1, Number(formValues.portions) || 1),
			}

			await updateDish(dish.id, payload)
			await loadDishDetails()
			showToast('Блюдо обновлено', 'success')
			setEditMode(false)
		} catch (error: any) {
			console.error('Error saving dish:', error)
			showToast('Не удалось сохранить изменения', 'error')
		} finally {
			setSaving(false)
		}
	}

	// Обработчик перевода блюда в статус "Готово"
	const handleSetReady = async () => {
		if (ingredients.length === 0) {
			showToast(
				'Добавьте хотя бы один ингредиент, чтобы перевести блюдо в статус "Готово"',
				'warning'
			)
			return
		}
		setShowReadyConfirm(true)
	}

	const confirmSetReady = async () => {
		setSettingReady(true)
		try {
			await updateDishStatus(dish.id, 'READY')
			await loadDishDetails()
			showToast('Блюдо переведено в статус "Готово"', 'success')
			setShowReadyConfirm(false)
		} catch (error: any) {
			console.error('Error setting dish ready:', error)
			showToast('Не удалось изменить статус блюда', 'error')
		} finally {
			setSettingReady(false)
		}
	}

	const handleUploadClick = () => {
		if (uploading) return
		fileInputRef.current?.click()
	}

	const handlePhotoUpload = async (file?: File | null) => {
		const targetFile = file ?? fileInputRef.current?.files?.[0]
		if (!targetFile) return
		setUploading(true)
		setUploadProgress(0)
		try {
			await uploadDishPhoto(dish.id, targetFile, progress =>
				setUploadProgress(progress)
			)
			showToast('Фото загружено', 'success')
			await loadDishDetails()
		} catch (error) {
			console.error('Error uploading photo:', error)
			showToast('Не удалось загрузить фото', 'error')
		} finally {
			setUploading(false)
			setUploadProgress(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleDeletePhoto = async (url: string) => {
		if (!editMode) return
		setUploading(true)
		try {
			await deleteDishPhoto(dish.id, url)
			showToast('Фото удалено', 'success')
			await loadDishDetails()
		} catch (error) {
			console.error('Error deleting photo:', error)
			showToast('Не удалось удалить фото', 'error')
		} finally {
			setUploading(false)
		}
	}

	return (
		<>
			<div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors'>
				<DishImagePreview src={coverPhoto} name={dish.name} />
				<div className='flex justify-between items-start mb-3'>
					<div className='flex-1'>
						<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
							{dish.isArchived ? `${dish.name} (Архив)` : dish.name}
						</h3>
						<DishStatusBadge status={dish.status} />
					</div>
					<div className='relative ml-2' ref={dropdownRef}>
						<button
							onClick={() => setDropdownOpen(open => !open)}
							className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded'
						>
							<MoreHorizontal size={20} />
						</button>
						{dropdownOpen && (
							<div className='absolute right-0 z-10 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-35'>
								<button
									onClick={() => {
										onArchive(dish.id)
										setDropdownOpen(false)
									}}
									className='flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
								>
									<MoreHorizontal size={16} className='mr-2 rotate-90' />
									{dish.isArchived ? 'Восстановить' : 'Архивировать'}
								</button>
								<button
									onClick={() => {
										onDelete(dish.id)
										setDropdownOpen(false)
									}}
									className='flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700'
								>
									<Trash2 size={16} className='mr-2' />
									Удалить
								</button>
							</div>
						)}
					</div>
				</div>

				{dish.description && (
					<p className='text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2'>
						{dish.description}
					</p>
				)}

				{/* КБЖУ на порцию */}
				{dish.perPortion && (
					<div className='mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
						<div className='text-xs text-gray-500 dark:text-gray-400 mb-1.5'>
							На 1 порцию:
						</div>
						<div className='grid grid-cols-4 gap-2 text-center'>
							<div>
								<div className='text-sm font-semibold text-orange-600 dark:text-orange-400'>
									{Math.round(dish.perPortion.nutrition.kcal)}
								</div>
								<div className='text-xs text-gray-500 dark:text-gray-400'>
									ккал
								</div>
							</div>
							<div>
								<div className='text-sm font-semibold text-red-600 dark:text-red-400'>
									{Math.round(dish.perPortion.nutrition.proteins * 10) / 10}
								</div>
								<div className='text-xs text-gray-500 dark:text-gray-400'>
									Б
								</div>
							</div>
							<div>
								<div className='text-sm font-semibold text-yellow-600 dark:text-yellow-400'>
									{Math.round(dish.perPortion.nutrition.fats * 10) / 10}
								</div>
								<div className='text-xs text-gray-500 dark:text-gray-400'>
									Ж
								</div>
							</div>
							<div>
								<div className='text-sm font-semibold text-green-600 dark:text-green-400'>
									{Math.round(dish.perPortion.nutrition.carbs * 10) / 10}
								</div>
								<div className='text-xs text-gray-500 dark:text-gray-400'>
									У
								</div>
							</div>
						</div>
						{dish.perPortion.price !== undefined &&
							dish.perPortion.price > 0 && (
								<div className='mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 text-center'>
									<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										{Math.round(dish.perPortion.price * 100) / 100}{' '}
										{dish.perPortion.currency || 'RUB'}
									</span>
								</div>
							)}
					</div>
				)}

				<div className='grid grid-cols-2 gap-3 text-sm'>
					<div>
						<span className='text-gray-500 dark:text-gray-400'>Порций:</span>
						<p className='text-gray-900 dark:text-white font-medium'>
							{dish.portions}
						</p>
					</div>
					{ingredientsCount > 0 && (
						<div>
							<span className='text-gray-500 dark:text-gray-400'>
								Ингредиентов:
							</span>
							<p className='text-gray-900 dark:text-white font-medium'>
								{ingredientsCount}
							</p>
						</div>
					)}
					<div>
						<span className='text-gray-500 dark:text-gray-400'>Архив:</span>
						<p className='text-gray-900 dark:text-white font-medium'>
							{dish.isArchived ? 'Да' : 'Нет'}
						</p>
					</div>
				</div>

				<div className='mt-4 pt-3 border-t border-gray-100 dark:border-gray-700'>
					<button
						onClick={() => setDetailModalOpen(true)}
						className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'
					>
						<Eye size={16} className='mr-2' />
						Подробнее
					</button>
				</div>
			</div>

			<Modal
				isOpen={detailModalOpen}
				onClose={() => {
					setDetailModalOpen(false)
					onAutoExpandClose?.()
				}}
				title={dish.isArchived ? `${dish.name} (Архив)` : dish.name}
				maxWidth='4xl'
			>
				{loading ? (
					<LoadingState />
				) : (
					<div className='space-y-6'>
						<div className='flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Статус: {baseDish.status === 'READY' ? 'Готово' : 'Черновик'}
								</p>
								{/* Кнопка "Готово" только для черновиков */}
								{baseDish.status === 'DRAFT' && !editMode && (
									<button
										onClick={handleSetReady}
										disabled={settingReady}
										className='px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors'
									>
										{settingReady ? 'Сохранение...' : 'Готово'}
									</button>
								)}
							</div>
							{editMode ? (
								<div className='flex gap-2'>
									<button
										onClick={handleCancelEdit}
										disabled={saving || uploading}
										className='px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm'
									>
										Отменить
									</button>
									<button
										onClick={handleSave}
										disabled={saving || uploading}
										className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm'
									>
										{saving ? 'Сохранение...' : 'Сохранить'}
									</button>
								</div>
							) : (
								<button
									onClick={handleStartEdit}
									className='px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm'
								>
									Редактировать
								</button>
							)}
						</div>

						<PhotosSection
							photos={photos}
							editMode={editMode}
							uploading={uploading}
							uploadProgress={uploadProgress}
							onUploadClick={handleUploadClick}
							onPhotoUpload={handlePhotoUpload}
							onPhotoDelete={setPhotoToDelete}
							fileInputRef={fileInputRef}
							showAll={showAllPhotos}
							onToggleShowAll={() => setShowAllPhotos(!showAllPhotos)}
						/>

						{editMode && (
							<EditableFields
								values={formValues}
								onChange={handleFieldChange}
							/>
						)}

						{editMode ? (
							<DescriptionEditor
								value={formValues.description}
								onChange={value => handleFieldChange('description', value)}
							/>
						) : (
							baseDish.description && (
								<DescriptionBlock description={baseDish.description} />
							)
						)}

						<IngredientsManager
							dishId={dish.id}
							items={ingredients}
							editMode={editMode}
							onRefresh={loadDishDetails}
						/>

						{calculations && <NutritionSection calculations={calculations} />}
						{calculations && <PriceSection calculations={calculations} />}
						<TechnicalSection dish={baseDish} />
					</div>
				)}
			</Modal>

			{/* Модалка подтверждения перевода в статус "Готово" */}
			<Modal
				isOpen={showReadyConfirm}
				onClose={() => setShowReadyConfirm(false)}
				title='Подтверждение'
				maxWidth='sm'
			>
				<div className='space-y-4'>
					<p className='text-gray-700 dark:text-gray-300'>
						Вы уверены, что хотите перевести блюдо в статус «Готово»?
					</p>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						После этого вернуть блюдо в статус черновика будет невозможно.
					</p>
					<div className='flex gap-3 pt-2'>
						<button
							onClick={() => setShowReadyConfirm(false)}
							disabled={settingReady}
							className='flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50'
						>
							Отмена
						</button>
						<button
							onClick={confirmSetReady}
							disabled={settingReady}
							className='flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2'
						>
							{settingReady ? (
								<>
									<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
									<span>Сохранение...</span>
								</>
							) : (
								'Подтвердить'
							)}
						</button>
					</div>
				</div>
			</Modal>

			{/* Модалка подтверждения удаления фото */}
			{photoToDelete && (
				<Modal
					isOpen={!!photoToDelete}
					onClose={() => setPhotoToDelete(null)}
					title='Удалить фото?'
					maxWidth='sm'
				>
					<div className='space-y-4'>
						<p className='text-gray-700 dark:text-gray-300'>
							Вы уверены, что хотите удалить это фото?
						</p>
						<div className='flex gap-3 pt-2'>
							<button
								onClick={() => setPhotoToDelete(null)}
								disabled={uploading}
								className='flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50'
							>
								Отмена
							</button>
							<button
								onClick={async () => {
									await handleDeletePhoto(photoToDelete)
									setPhotoToDelete(null)
								}}
								disabled={uploading}
								className='flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50'
							>
								{uploading ? 'Удаление...' : 'Удалить'}
							</button>
						</div>
					</div>
				</Modal>
			)}
		</>
	)
}
