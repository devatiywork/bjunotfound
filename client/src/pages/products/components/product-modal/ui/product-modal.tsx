import { Image, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Category, Product, ProductUnit, Tag } from '../../../../../api'
import {
	createProduct,
	updateProduct,
	uploadProductPhoto,
} from '../../../../../api/services'
import { useToast } from '../../../../../components'
import { Input } from '../../../../../components/input'
import { Modal } from '../../../../../components/modal'
import { Select } from '../../../../../components/select'

interface ProductModalProps {
	product?: Product
	categories: Category[]
	tags: Tag[]
	onClose: () => void
	onSuccess: () => void
}

export default function ProductModal({
	product,
	categories,
	tags,
	onClose,
	onSuccess,
}: ProductModalProps) {
	const toast = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [loading, setLoading] = useState(false)
	const [uploadingPhoto, setUploadingPhoto] = useState(false)
	const [photoPreview, setPhotoPreview] = useState(product?.photo || '')
	const [isDragging, setIsDragging] = useState(false)
	const [formData, setFormData] = useState({
		name: product?.name || '',
		description: product?.description || '',
		calories: product?.calories || 0,
		proteins: product?.proteins || 0,
		fats: product?.fats || 0,
		carbs: product?.carbs || 0,
		fiber: product?.fiber || 0,
		sugar: product?.sugar || 0,
		saturatedFat: product?.saturatedFat || 0,
		sodium: product?.sodium || 0,
		servingSize: product?.servingSize || 100,
		unit: product?.unit || 'G',
		brand: product?.brand || '',
		barcode: product?.barcode || '',
		photo: product?.photo || '',
		price: product?.price || 0,
		isPublic: product?.isPublic ?? true,
		categoryId: product?.categoryId || '',
		tagIds: product?.tags.map(pt => pt.tag.id) || [],
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			toast.showToast('Введите название продукта', 'error')
			return
		}

		if (!formData.categoryId) {
			toast.showToast('Выберите категорию', 'error')
			return
		}

		try {
			setLoading(true)
			if (product) {
				await updateProduct(product.id, formData)
				toast.showToast('Продукт успешно обновлен', 'success')
			} else {
				await createProduct(formData)
				toast.showToast('Продукт успешно создан', 'success')
			}
			onSuccess()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message ||
					`Ошибка ${product ? 'обновления' : 'создания'} продукта`,
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	const processFile = async (file: File) => {
		// Проверка формата
		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			toast.showToast('Поддерживаются только JPEG, PNG и WebP форматы', 'error')
			return
		}

		// Проверка размера (5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.showToast('Размер файла не должен превышать 5MB', 'error')
			return
		}

		try {
			setUploadingPhoto(true)
			const { url } = await uploadProductPhoto(file)
			setFormData({ ...formData, photo: url })
			setPhotoPreview(url)
			toast.showToast('Фото успешно загружено', 'success')
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message || 'Ошибка загрузки фото',
				'error'
			)
		} finally {
			setUploadingPhoto(false)
		}
	}

	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) await processFile(file)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		setIsDragging(false)

		const file = e.dataTransfer.files[0]
		if (file) await processFile(file)
	}

	const handleRemovePhoto = () => {
		setFormData({ ...formData, photo: '' })
		setPhotoPreview('')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleTagToggle = (tagId: string) => {
		setFormData(prev => ({
			...prev,
			tagIds: prev.tagIds.includes(tagId)
				? prev.tagIds.filter(id => id !== tagId)
				: [...prev.tagIds, tagId],
		}))
	}

	const categoryOptions = [
		{ value: '', label: 'Выберите категорию' },
		...categories.map(cat => ({ value: cat.id, label: cat.name })),
	]

	const unitOptions = [
		{ value: 'G', label: 'Граммы' },
		{ value: 'ML', label: 'Миллилитры' },
		{ value: 'PIECE', label: 'Штуки' },
		{ value: 'PORTION', label: 'Порции' },
	]

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={product ? 'Редактировать продукт' : 'Создать продукт'}
			maxWidth='4xl'
		>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Basic Info */}
				<div className='space-y-4'>
					<h3 className='font-semibold text-gray-900 dark:text-white'>
						Основная информация
					</h3>

					<Input
						label='Название продукта'
						type='text'
						value={formData.name}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFormData({ ...formData, name: e.target.value })
						}
						required
						placeholder='Например: Куриная грудка'
					/>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Input
							label='Бренд'
							type='text'
							value={formData.brand}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, brand: e.target.value })
							}
							placeholder='Например: Мираторг'
						/>

						<Input
							label='Штрих-код'
							type='text'
							value={formData.barcode}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, barcode: e.target.value })
							}
							placeholder='8-14 цифр'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Описание
						</label>
						<textarea
							value={formData.description}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
							className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
							placeholder='Описание продукта'
						/>
					</div>

					{/* Photo Upload */}
					<div className='space-y-2'>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Фото продукта
						</label>
						{photoPreview ? (
							<div className='relative inline-block'>
								<img
									src={photoPreview}
									alt='Preview'
									className='w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600'
								/>
								<button
									type='button'
									onClick={handleRemovePhoto}
									className='absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'
								>
									<X className='w-4 h-4' />
								</button>
							</div>
						) : (
							<div
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
								className={`flex flex-col items-center justify-center gap-2 w-32 h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
									uploadingPhoto
										? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600'
										: isDragging
										? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
										: 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
								}`}
							>
								{uploadingPhoto ? (
									<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
								) : (
									<>
										<Image className='w-8 h-8 text-gray-400' />
										<span className='text-xs text-gray-500 dark:text-gray-400 text-center'>
											{isDragging ? 'Отпустите' : 'Перетащите или нажмите'}
										</span>
									</>
								)}
							</div>
						)}
						<input
							ref={fileInputRef}
							type='file'
							accept='image/jpeg,image/png,image/webp'
							onChange={handlePhotoUpload}
							className='hidden'
						/>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							Форматы: JPEG, PNG, WebP. Макс. размер: 5MB
						</p>
					</div>

					<Select
						label='Категория'
						value={formData.categoryId}
						onChange={value => setFormData({ ...formData, categoryId: value })}
						required
						options={categoryOptions}
					/>
				</div>

				{/* Nutrition Info */}
				<div className='space-y-4'>
					<h3 className='font-semibold text-gray-900 dark:text-white'>
						КБЖУ (на 100г/мл)
					</h3>

					<div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
						<Input
							label='Калории'
							type='number'
							value={formData.calories}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, calories: Number(e.target.value) })
							}
							required
							min={0}
							max={1000}
						/>

						<Input
							label='Белки (г)'
							type='number'
							value={formData.proteins}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, proteins: Number(e.target.value) })
							}
							required
							min={0}
							max={100}
							step={0.1}
						/>

						<Input
							label='Жиры (г)'
							type='number'
							value={formData.fats}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, fats: Number(e.target.value) })
							}
							required
							min={0}
							max={100}
							step={0.1}
						/>

						<Input
							label='Углеводы (г)'
							type='number'
							value={formData.carbs}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, carbs: Number(e.target.value) })
							}
							required
							min={0}
							max={100}
							step={0.1}
						/>
					</div>

					<div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
						<Input
							label='Клетчатка (г)'
							type='number'
							value={formData.fiber}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, fiber: Number(e.target.value) })
							}
							min={0}
							max={100}
							step={0.1}
						/>

						<Input
							label='Сахар (г)'
							type='number'
							value={formData.sugar}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, sugar: Number(e.target.value) })
							}
							min={0}
							max={100}
							step={0.1}
						/>

						<Input
							label='Нас. жиры (г)'
							type='number'
							value={formData.saturatedFat}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({
									...formData,
									saturatedFat: Number(e.target.value),
								})
							}
							min={0}
							max={100}
							step={0.1}
						/>

						<Input
							label='Натрий (мг)'
							type='number'
							value={formData.sodium}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, sodium: Number(e.target.value) })
							}
							min={0}
							max={10000}
						/>
					</div>
				</div>

				{/* Serving & Price */}
				<div className='space-y-4'>
					<h3 className='font-semibold text-gray-900 dark:text-white'>
						Порция и цена
					</h3>

					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
						<Input
							label='Размер порции'
							type='number'
							value={formData.servingSize}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({
									...formData,
									servingSize: Number(e.target.value),
								})
							}
							min={0}
							max={10000}
						/>

						<Select
							label='Единица измерения'
							value={formData.unit}
							onChange={value =>
								setFormData({ ...formData, unit: value as ProductUnit })
							}
							required
							options={unitOptions}
						/>

						<Input
							label='Цена (₽)'
							type='number'
							value={formData.price}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setFormData({ ...formData, price: Number(e.target.value) })
							}
							min={0}
							max={1000000}
							step={0.01}
						/>
					</div>
				</div>

				{/* Tags */}
				<div className='space-y-4'>
					<h3 className='font-semibold text-gray-900 dark:text-white'>Теги</h3>
					<div className='flex flex-wrap gap-2 max-h-40 overflow-y-auto'>
						{tags.map(tag => (
							<button
								key={tag.id}
								type='button'
								onClick={() => handleTagToggle(tag.id)}
								className={`px-3 py-1 rounded-full text-sm transition-colors ${
									formData.tagIds.includes(tag.id)
										? 'bg-purple-600 text-white'
										: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
								}`}
							>
								{tag.name}
							</button>
						))}
					</div>
				</div>

				{/* Privacy */}
				<div className='flex items-center gap-3'>
					<input
						type='checkbox'
						id='isPublic'
						checked={formData.isPublic}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFormData({ ...formData, isPublic: e.target.checked })
						}
						className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
					/>
					<label
						htmlFor='isPublic'
						className='text-sm text-gray-700 dark:text-gray-300'
					>
						Сделать продукт публичным (доступен всем пользователям)
					</label>
				</div>

				{/* Actions */}
				<div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
					<button
						type='button'
						onClick={onClose}
						className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading}
						className='flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{loading ? 'Сохранение...' : product ? 'Сохранить' : 'Создать'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
