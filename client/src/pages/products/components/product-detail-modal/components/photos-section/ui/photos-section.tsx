import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import * as ProductsAPI from '../../../../../../../api/services/products'
import type { ProductUserResponse } from '../../../../../../../api/types/products'
import { useToast } from '../../../../../../../components'

interface PhotosSectionProps {
	product: ProductUserResponse
	getProductName: () => string
	isEditing: boolean
	onPhotoUpdate: () => void
	isOwner: boolean
}

export const PhotosSection = ({
	product,
	getProductName,
	isEditing,
	onPhotoUpdate,
	isOwner,
}: PhotosSectionProps) => {
	const { showToast } = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)
	const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null)
	const [showAllPhotos, setShowAllPhotos] = useState(false)

	const handleFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Валидация типа файла
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(file.type)) {
			showToast('Поддерживаются только JPEG, PNG и WebP форматы', 'error')
			return
		}

		// Валидация размера (5MB)
		const maxSize = 5 * 1024 * 1024
		if (file.size > maxSize) {
			showToast('Размер файла не должен превышать 5 МБ', 'error')
			return
		}

		setUploading(true)
		try {
			await ProductsAPI.uploadProductPhoto(product.id, file)
			showToast('Фотография успешно загружена', 'success')
			onPhotoUpdate()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при загрузке фотографии'
			showToast(errorMessage, 'error')
		} finally {
			setUploading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleDeletePhoto = async (photoUrl: string) => {
		setDeletingPhoto(photoUrl)
		try {
			await ProductsAPI.deleteProductPhoto(product.id, photoUrl)
			showToast('Фотография успешно удалена', 'success')
			onPhotoUpdate()
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при удалении фотографии'
			showToast(errorMessage, 'error')
		} finally {
			setDeletingPhoto(null)
		}
	}

	const hasPhotos = product.photos && product.photos.length > 0
	const totalPhotos = product.photos?.length || 0
	const maxPhotosToShow = 5
	const hasMorePhotos = totalPhotos > maxPhotosToShow
	const photosToDisplay = showAllPhotos
		? product.photos
		: product.photos?.slice(0, maxPhotosToShow)

	return (
		<section>
			<div className='flex items-center justify-between mb-3'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
					Фотографии
				</h3>
				{isOwner && (
					<button
						onClick={() => fileInputRef.current?.click()}
						disabled={uploading}
						className='flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
					>
						{uploading ? (
							<>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								Загрузка...
							</>
						) : (
							<>
								<Plus className='w-4 h-4' />
								Добавить фото
							</>
						)}
					</button>
				)}
			</div>

			<input
				ref={fileInputRef}
				type='file'
				accept='image/jpeg,image/png,image/webp'
				onChange={handleFileSelect}
				className='hidden'
			/>

			{!hasPhotos ? (
				<div className='text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600'>
					<Upload className='w-12 h-12 mx-auto text-gray-400 mb-3' />
					<p className='text-gray-600 dark:text-gray-400 mb-2'>
						Нет загруженных фотографий
					</p>
					{isOwner && (
						<button
							onClick={() => fileInputRef.current?.click()}
							className='text-blue-600 dark:text-blue-400 hover:underline'
						>
							Загрузить первую фотографию
						</button>
					)}
				</div>
			) : (
				<>
					<div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
						{photosToDisplay?.map((photo: any, index: number) => {
							const photoUrl = typeof photo === 'string' ? photo : photo.url
							const isDeleting = deletingPhoto === photoUrl

							return (
								<div
									key={index}
									className='relative aspect-4/3 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 group'
								>
									<img
										src={photoUrl}
										alt={`${getProductName()} - фото ${index + 1}`}
										className='w-full h-full object-cover'
										onError={e => {
											console.error('Ошибка загрузки фото:', photoUrl)
											e.currentTarget.src =
												'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EФото недоступно%3C/text%3E%3C/svg%3E'
										}}
										loading='lazy'
									/>
									{isEditing && (
										<div className='absolute inset-0 group-hover:backdrop-blur-sm group-hover:bg-white/30 dark:group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center'>
											<button
												onClick={() => handleDeletePhoto(photoUrl)}
												disabled={isDeleting}
												className='opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-2 rounded-full disabled:opacity-50'
												title='Удалить фото'
											>
												{isDeleting ? (
													<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
												) : (
													<Trash2 className='w-5 h-5' />
												)}
											</button>
										</div>
									)}
								</div>
							)
						})}
					</div>

					{hasMorePhotos && (
						<button
							onClick={() => setShowAllPhotos(!showAllPhotos)}
							className='mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
						>
							{showAllPhotos ? (
								<>
									<ChevronUp className='w-4 h-4' />
									Свернуть ({totalPhotos - maxPhotosToShow} фото)
								</>
							) : (
								<>
									<ChevronDown className='w-4 h-4' />
									Показать все ({totalPhotos} фото)
								</>
							)}
						</button>
					)}
				</>
			)}
		</section>
	)
}
