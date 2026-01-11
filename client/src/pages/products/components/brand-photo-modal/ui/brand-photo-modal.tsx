import { Image, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import type { Brand } from '../../../../../api/types/brands'
import { ConfirmModal, Modal, useToast } from '../../../../../components'

interface BrandPhotoModalProps {
	isOpen: boolean
	onClose: () => void
	brand: Brand | null
	isAdmin: boolean
	onSuccess: () => void
}

export const BrandPhotoModal = ({
	isOpen,
	onClose,
	brand,
	isAdmin,
	onSuccess,
}: BrandPhotoModalProps) => {
	const { showToast } = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [currentBrand, setCurrentBrand] = useState<Brand | null>(brand)
	const [loadingBrand, setLoadingBrand] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [deleting, setDeleting] = useState<string | null>(null)
	const [confirmModalOpen, setConfirmModalOpen] = useState(false)
	const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)

	// Инициализация при открытии или смене бренда
	useEffect(() => {
		if (isOpen && brand) {
			// Если brand изменился, но ID тот же (обновление от родителя),
			// мы не хотим перезатирать наше текущее состояние, если оно уже загружено
			// Но если это ПЕРВОЕ открытие (currentBrand null) или ID сменился - обновляем
			if (!currentBrand || currentBrand.id !== brand.id) {
				setCurrentBrand(brand)
				// Не вызываем reloadBrand автоматически, доверяем данным от родителя,
				// так как они обновляются после каждой операции
			} else if (currentBrand.id === brand.id && brand !== currentBrand) {
				// Если родитель обновил объект (но ID тот же), синхронизируем,
				// если в родительском объекте больше фото (или они изменились)
				// Это покрывает сценарий, когда загрузили фото -> обновили родителя -> родитель передал новый объект
				const parentPhotos = brand.photos || []
				const currentPhotos = currentBrand.photos || []

				// Простая эвристика: если у родителя фото больше или столько же, но они другие - обновляем
				// (это предотвращает перезапись старым кешом, если мы только что добавили фото локально)
				// Но так как мы уже сделали синхронизацию в родителе, можно просто обновить

				// Если мы только что загрузили фото, currentPhotos уже имеет его.
				// Если родитель имеет его тоже - отлично.
				// Если родитель НЕ имеет его (старый кеш), то обновление ЗАТРЕТ наше фото.

				// Поэтому обновляем ТОЛЬКО если у родителя фото БОЛЬШЕ или количество то же.
				// Если у родителя меньше фото, значит он отстал - игнорируем обновление от родителя.
				if (parentPhotos.length >= currentPhotos.length) {
					setCurrentBrand(brand)
				}
			}
		} else if (!isOpen) {
			// Сброс состояния при закрытии модалки
			setCurrentBrand(null)
			setUploadProgress(0)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, brand]) // Вернул зависимость от brand целиком для синхронизации

	async function reloadBrand() {
		if (!brand) return

		setLoadingBrand(true)
		try {
			const updatedBrand = await BrandsAPI.getBrand(brand.id)
			setCurrentBrand(updatedBrand)
		} catch (error: any) {
			showToast('Ошибка при загрузке бренда', 'error')
		} finally {
			setLoadingBrand(false)
		}
	}

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		// Сбрасываем значение инпута, чтобы можно было выбрать тот же файл повторно
		// (например, если первый раз была ошибка)
		const input = e.target

		if (!brand) {
			showToast('Ошибка: бренд не передан', 'error')
			input.value = ''
			return
		}

		if (!file) {
			input.value = ''
			return
		}

		// Валидация на клиенте
		const validTypes = ['image/jpeg', 'image/png', 'image/webp']
		if (!validTypes.includes(file.type)) {
			showToast('Допустимые форматы: JPEG, PNG, WebP', 'error')
			input.value = ''
			return
		}

		const maxSize = 5 * 1024 * 1024 // 5MB
		if (file.size > maxSize) {
			showToast('Максимальный размер файла: 5MB', 'error')
			input.value = ''
			return
		}

		setUploading(true)
		setUploadProgress(0)

		try {
			// Симуляция прогресса
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => Math.min(prev + 10, 90))
			}, 200)

			const response = await BrandsAPI.uploadBrandPhoto(brand.id, file)

			clearInterval(progressInterval)
			setUploadProgress(100)

			showToast('Фото успешно загружено', 'success')

			// Принудительно обновляем локальное состояние, если сервер вернул URL
			if (response && response.photoUrl) {
				setCurrentBrand(prev => {
					if (!prev) return null
					console.log('Updating photo list with:', response.photoUrl)
					return {
						...prev,
						photos: [...(prev.photos || []), response.photoUrl],
					}
				})
			} else {
				// Если URL не вернулся, пробуем перезагрузить полностью
				await reloadBrand()
			}

			// Уведомляем родительский компонент об обновлении
			onSuccess()

			setTimeout(() => {
				setUploadProgress(0)
			}, 1000)
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка при загрузке фото'
			showToast(message, 'error')
			setUploadProgress(0)
		} finally {
			setUploading(false)
			input.value = '' // Сброс input
		}
	}

	const handleDeletePhoto = (photoUrl: string) => {
		setPhotoToDelete(photoUrl)
		setConfirmModalOpen(true)
	}

	const confirmDeletePhoto = async () => {
		if (!photoToDelete || !currentBrand) return

		setDeleting(photoToDelete)

		try {
			await BrandsAPI.deleteBrandPhoto(currentBrand.id, photoToDelete)
			showToast('Фото успешно удалено', 'success')

			// Обновляем список фото локально
			setCurrentBrand(prev => {
				if (!prev) return null
				return {
					...prev,
					photos: (prev.photos || []).filter(p => p !== photoToDelete),
				}
			})

			// Уведомляем родительский компонент об обновлении
			onSuccess()
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка при удалении фото'
			showToast(message, 'error')
		} finally {
			setDeleting(null)
			setConfirmModalOpen(false)
			setPhotoToDelete(null)
		}
	}

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				title={brand ? `Фотографии: ${brand.name}` : 'Фотографии бренда'}
				maxWidth='2xl'
			>
				<div className='space-y-6 relative'>
					{/* Индикатор загрузки бренда */}
					{loadingBrand && (
						<div className='absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 rounded-lg'>
							<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
								<div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
								<span className='text-sm font-medium'>Обновление...</span>
							</div>
						</div>
					)}

					{/* Зона загрузки */}
					<div
						className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer ${
							uploading ? 'opacity-50 cursor-not-allowed' : ''
						}`}
						onClick={() => !uploading && fileInputRef.current?.click()}
					>
						<input
							ref={fileInputRef}
							type='file'
							accept='image/jpeg,image/png,image/webp'
							onChange={handleFileSelect}
							disabled={uploading}
							className='hidden'
						/>
						<div className='flex flex-col items-center pointer-events-none'>
							<Upload className='w-12 h-12 text-gray-400 dark:text-gray-500 mb-3' />
							<p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
								{uploading ? 'Загрузка...' : 'Нажмите для выбора файла'}
							</p>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								JPEG, PNG, WebP • Макс 5MB
							</p>
						</div>

						{/* Прогресс-бар */}
						{uploadProgress > 0 && (
							<div className='mt-4'>
								<div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
									<div
										className='bg-blue-600 h-2 rounded-full transition-all duration-300'
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
								<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
									{uploadProgress}%
								</p>
							</div>
						)}
					</div>

					{/* Сетка фотографий */}
					{currentBrand &&
					currentBrand.photos &&
					currentBrand.photos.length > 0 ? (
						<div>
							<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
								Загруженные фото ({currentBrand.photos.length})
							</h3>
							<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
								{currentBrand.photos.map((photo: string, index: number) => (
									<div
										key={index}
										className='relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
									>
										<img
											src={photo}
											alt={`${currentBrand.name} - фото ${index + 1}`}
											className='w-full h-full object-contain'
											loading='lazy'
										/>

										{/* Оверлей с кнопкой удаления (только для админов) */}
										{isAdmin && (
											<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100'>
												<button
													onClick={() => handleDeletePhoto(photo)}
													disabled={deleting === photo}
													className='p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50'
													title='Удалить фото'
												>
													{deleting === photo ? (
														<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
													) : (
														<Trash2 className='w-5 h-5' />
													)}
												</button>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					) : (
						<div className='text-center py-12'>
							<Image className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500' />
							<p className='mt-4 text-gray-600 dark:text-gray-400'>
								У бренда пока нет фотографий
							</p>
						</div>
					)}
				</div>
			</Modal>

			<ConfirmModal
				isOpen={confirmModalOpen}
				onClose={() => setConfirmModalOpen(false)}
				onConfirm={confirmDeletePhoto}
				title='Удаление фото'
				message='Вы уверены, что хотите удалить это фото? Это действие необратимо.'
				confirmText='Удалить'
				variant='danger'
				loading={deleting !== null}
			/>
		</>
	)
}
