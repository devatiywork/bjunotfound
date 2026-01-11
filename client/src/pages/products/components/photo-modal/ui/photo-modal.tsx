import { Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as CategoriesAPI from '../../../../../api/services/categories'
import type { CategoryTreeNode } from '../../../../../api/types/categories'
import { Modal, useToast } from '../../../../../components'

interface PhotoModalProps {
	isOpen: boolean
	onClose: () => void
	category: CategoryTreeNode | null
	onSuccess: () => void
}

export const PhotoModal = ({
	isOpen,
	onClose,
	category,
	onSuccess,
}: PhotoModalProps) => {
	const { showToast } = useToast()
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [deleting, setDeleting] = useState<string | null>(null)
	const [currentCategory, setCurrentCategory] =
		useState<CategoryTreeNode | null>(category)
	const [loadingCategory, setLoadingCategory] = useState(false)

	// Обновляем локальную категорию при изменении пропса
	useEffect(() => {
		setCurrentCategory(category)
	}, [category])

	// Функция для перезагрузки данных категории
	const reloadCategory = async () => {
		if (!category?.id) return

		setLoadingCategory(true)
		try {
			const updated = await CategoriesAPI.getCategory(category.id)
			setCurrentCategory(updated as CategoryTreeNode)
		} catch (error: any) {
			console.error('Ошибка при перезагрузке категории:', error)
		} finally {
			setLoadingCategory(false)
		}
	}

	if (!currentCategory) return null

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Валидация на клиенте
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

		setUploading(true)
		setUploadProgress(0)

		try {
			// Симуляция прогресса (в реальности нужен axios onUploadProgress)
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => Math.min(prev + 10, 90))
			}, 200)

			await CategoriesAPI.uploadCategoryPhoto(currentCategory.id, file)

			clearInterval(progressInterval)
			setUploadProgress(100)

			showToast('Фото успешно загружено', 'success')

			// Перезагружаем данные категории
			await reloadCategory()

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
			e.target.value = '' // Сброс input
		}
	}

	const handleDeletePhoto = async (photoUrl: string) => {
		if (
			!confirm(
				'Вы уверены, что хотите удалить это фото? Это действие необратимо.'
			)
		) {
			return
		}

		setDeleting(photoUrl)

		try {
			await CategoriesAPI.deleteCategoryPhoto(currentCategory.id, photoUrl)
			showToast('Фото успешно удалено', 'success')

			// Перезагружаем данные категории
			await reloadCategory()

			// Уведомляем родительский компонент об обновлении
			onSuccess()
		} catch (error: any) {
			const message =
				error.response?.data?.message || 'Ошибка при удалении фото'
			showToast(message, 'error')
		} finally {
			setDeleting(null)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Фотографии: ${currentCategory.name}`}
			maxWidth='2xl'
		>
			<div className='space-y-6 relative'>
				{/* Индикатор загрузки категории */}
				{loadingCategory && (
					<div className='absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 rounded-lg'>
						<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
							<div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
							<span className='text-sm font-medium'>Обновление...</span>
						</div>
					</div>
				)}

				{/* Зона загрузки */}
				<div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors'>
					<input
						type='file'
						id='photo-upload'
						accept='image/jpeg,image/png,image/webp'
						onChange={handleFileSelect}
						disabled={uploading}
						className='hidden'
					/>
					<label
						htmlFor='photo-upload'
						className={`flex flex-col items-center cursor-pointer ${
							uploading ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						<Upload className='w-12 h-12 text-gray-400 dark:text-gray-500 mb-3' />
						<p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
							{uploading ? 'Загрузка...' : 'Нажмите для выбора файла'}
						</p>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							JPEG, PNG, WebP • Макс 5MB
						</p>
					</label>

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
				{currentCategory.photos && currentCategory.photos.length > 0 ? (
					<div>
						<h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
							Загруженные фото ({currentCategory.photos.length})
						</h3>
						<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
							{currentCategory.photos.map((photo: string, index: number) => (
								<div
									key={index}
									className='relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square'
								>
									<img
										src={photo}
										alt={`${currentCategory.name} ${index + 1}`}
										className='w-full h-full object-cover'
										loading='lazy'
									/>

									{/* Кнопка удаления */}
									<button
										onClick={() => handleDeletePhoto(photo)}
										disabled={deleting === photo}
										className='absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
										title='Удалить фото'
									>
										{deleting === photo ? (
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
										) : (
											<Trash2 className='w-4 h-4' />
										)}
									</button>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className='text-center py-8'>
						<p className='text-gray-500 dark:text-gray-400 text-sm'>
							Фотографий пока нет
						</p>
					</div>
				)}
			</div>
		</Modal>
	)
}
