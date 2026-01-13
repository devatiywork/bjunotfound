import { Image as ImageIcon, Trash2 } from 'lucide-react'
import { type RefObject, useState } from 'react'
import { ConfirmModal } from '../../../../../../../../../components'

interface PhotosSectionProps {
	photos: string[]
	editMode: boolean
	uploading: boolean
	uploadProgress: number | null
	onUploadClick: () => void
	onPhotoUpload: (file?: File | null) => void
	onPhotoDelete: (url: string) => void
	fileInputRef: RefObject<HTMLInputElement | null>
	showAll: boolean
	onToggleShowAll: () => void
}

export const PhotosSection = ({
	photos,
	editMode,
	uploading,
	uploadProgress,
	onUploadClick,
	onPhotoUpload,
	onPhotoDelete,
	fileInputRef,
	showAll,
	onToggleShowAll,
}: PhotosSectionProps) => {
	const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
	const visiblePhotos = showAll ? photos : photos.slice(0, 3)
	const hasMore = photos.length > 3

	const handleConfirmDelete = () => {
		if (photoToDelete) {
			onPhotoDelete(photoToDelete)
			setPhotoToDelete(null)
		}
	}

	return (
		<div>
			<div className='flex items-center justify-between gap-3 mb-3'>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
					Фото блюда {photos.length > 0 && `(${photos.length})`}
				</h3>
				<div className='flex items-center gap-3'>
					{uploadProgress !== null && (
						<div className='w-28 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
							<div
								className='h-full bg-blue-600 dark:bg-blue-400 transition-all'
								style={{ width: `${uploadProgress}%` }}
							></div>
						</div>
					)}
					<button
						onClick={onUploadClick}
						disabled={uploading}
						className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm'
					>
						{uploading ? 'Загрузка...' : 'Загрузить фото'}
					</button>
					<input
						type='file'
						accept='image/jpeg,image/png,image/webp'
						className='hidden'
						ref={fileInputRef}
						onChange={e => onPhotoUpload(e.target.files?.[0] ?? null)}
					/>
				</div>
			</div>

			{photos.length === 0 ? (
				<div className='bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center'>
					<ImageIcon className='h-10 w-10 mb-2' />
					<span className='text-sm'>
						Фотографии блюда будут отображаться здесь
					</span>
				</div>
			) : (
				<div className='space-y-3'>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
						{visiblePhotos.map(url => (
							<div
								key={url}
								className='relative group h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
							>
								<img
									src={url}
									alt='Фото блюда'
									className='h-full w-full object-cover'
									loading='lazy'
								/>
								{editMode && (
									<button
										onClick={() => setPhotoToDelete(url)}
										disabled={uploading}
										className='absolute top-1 right-1 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-600/80 transition-colors'
										aria-label='Удалить фотографию'
									>
										<Trash2 className='h-4 w-4' />
									</button>
								)}
							</div>
						))}
					</div>
					{hasMore && (
						<button
							onClick={onToggleShowAll}
							className='w-full py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
						>
							{showAll ? '▲ Скрыть' : `▼ Показать все (${photos.length})`}
						</button>
					)}
				</div>
			)}
			<ConfirmModal
				isOpen={!!photoToDelete}
				onClose={() => setPhotoToDelete(null)}
				onConfirm={handleConfirmDelete}
				title='Подтвердите удаление'
				message='Вы уверены, что хотите удалить эту фотографию? Это действие нельзя будет отменить.'
			/>
		</div>
	)
}
