import { ChefHat, Upload, X } from 'lucide-react'
import { useState } from 'react'
import type { Dish, DishTag, Product } from '../../../../../api'
import {
	createDish,
	updateDish,
	uploadDishPhoto,
} from '../../../../../api/services'
import type {
	CuisineType,
	DifficultyLevel,
	MealType,
	UnitType,
} from '../../../../../api/types/dishes.ts'
import { useToast } from '../../../../../components'
import { Input } from '../../../../../components/input'
import { Modal } from '../../../../../components/modal'
import { Select } from '../../../../../components/select'

interface DishModalProps {
	dish?: Dish
	products: Product[]
	tags: DishTag[]
	onClose: () => void
	onSuccess: () => void
}

export default function DishModal({
	dish,
	products,
	tags,
	onClose,
	onSuccess,
}: DishModalProps) {
	const toast = useToast()
	const [loading, setLoading] = useState(false)
	const [uploadingPhoto, setUploadingPhoto] = useState(false)
	const [photoPreview, setPhotoPreview] = useState(dish?.photo || '')
	const [isDragging, setIsDragging] = useState(false)

	const [formData, setFormData] = useState({
		name: dish?.name || '',
		description: dish?.description || '',
		servings: dish?.servings || 1,
		servingSize: dish?.servingSize || null,
		cookingTimeMinutes: dish?.cookingTimeMinutes || null,
		difficulty: dish?.difficulty || ('MEDIUM' as DifficultyLevel),
		mealType: dish?.mealType || undefined,
		cuisineType: dish?.cuisineType || undefined,
		dishCategory: dish?.dishCategory || undefined,
		isPublic: dish?.isPublic ?? true,
		photo: dish?.photo || '',
		ingredients: dish?.ingredients.map(ing => ({
			productId: ing.productId,
			amount: ing.amount,
			unit: ing.unit,
		})) || [{ productId: '', amount: 0, unit: 'G' as UnitType }],
		tagIds: dish?.tags.map(dt => dt.tag.id) || [],
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.name.trim()) {
			toast.showToast('Введите название блюда', 'error')
			return
		}

		if (formData.ingredients.length === 0) {
			toast.showToast('Добавьте хотя бы один ингредиент', 'error')
			return
		}

		try {
			setLoading(true)
			const payload = {
				...formData,
				servingSize: formData.servingSize || undefined,
				cookingTimeMinutes: formData.cookingTimeMinutes || undefined,
			}

			if (dish) {
				await updateDish(dish.id, payload)
				toast.showToast('Блюдо успешно обновлено', 'success')
			} else {
				await createDish(payload)
				toast.showToast('Блюдо успешно создано', 'success')
			}
			onSuccess()
		} catch (error: any) {
			toast.showToast(
				error.response?.data?.message ||
					`Ошибка ${dish ? 'обновления' : 'создания'} блюда`,
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	const addIngredient = () => {
		setFormData(prev => ({
			...prev,
			ingredients: [
				...prev.ingredients,
				{ productId: '', amount: 0, unit: 'G' as UnitType },
			],
		}))
	}

	const removeIngredient = (index: number) => {
		setFormData(prev => ({
			...prev,
			ingredients: prev.ingredients.filter((_, i) => i !== index),
		}))
	}

	const updateIngredient = (
		index: number,
		field: string,
		value: string | number
	) => {
		setFormData(prev => ({
			...prev,
			ingredients: prev.ingredients.map((ing, i) =>
				i === index ? { ...ing, [field]: value } : ing
			),
		}))
	}

	const processFile = async (file: File) => {
		// Проверка типа файла
		if (!file.type.startsWith('image/')) {
			toast.showToast('Пожалуйста, выберите изображение', 'error')
			return
		}

		// Проверка размера файла (макс 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.showToast('Размер файла не должен превышать 5MB', 'error')
			return
		}

		try {
			setUploadingPhoto(true)
			const { url } = await uploadDishPhoto(file)
			setPhotoPreview(url)
			setFormData(prev => ({ ...prev, photo: url }))
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

	const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
		e.preventDefault()
		setIsDragging(false)

		const file = e.dataTransfer.files[0]
		if (file) await processFile(file)
	}

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={dish ? 'Редактировать блюдо' : 'Создать блюдо'}
			maxWidth='3xl'
		>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Photo Upload */}
				<div className='space-y-2'>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
						Фото блюда
					</label>
					{photoPreview ? (
						<div className='relative'>
							<img
								src={photoPreview}
								alt='Preview'
								className='w-full h-48 object-cover rounded-lg'
							/>
							<button
								type='button'
								onClick={() => {
									setPhotoPreview('')
									setFormData(prev => ({ ...prev, photo: '' }))
								}}
								className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors'
							>
								<X className='w-4 h-4' />
							</button>
						</div>
					) : (
						<label
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
								uploadingPhoto
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: isDragging
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800'
							}`}
						>
							<div className='flex flex-col items-center justify-center pt-5 pb-6'>
								<Upload
									className={`w-10 h-10 mb-3 ${
										uploadingPhoto
											? 'text-blue-500'
											: 'text-gray-400 dark:text-gray-500'
									}`}
								/>
								<p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
									<span className='font-semibold'>
										{uploadingPhoto
											? 'Загрузка...'
											: isDragging
											? 'Отпустите файл'
											: 'Нажмите или перетащите файл'}
									</span>
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									PNG, JPG, WEBP (макс. 5MB)
								</p>
							</div>
							<input
								type='file'
								className='hidden'
								accept='image/*'
								onChange={handlePhotoUpload}
								disabled={uploadingPhoto}
							/>
						</label>
					)}
				</div>

				{/* Basic Info */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						label='Название *'
						value={formData.name}
						onChange={e =>
							setFormData(prev => ({ ...prev, name: e.target.value }))
						}
						required
					/>
					<Input
						label='Количество порций *'
						type='number'
						min={1}
						max={100}
						value={formData.servings}
						onChange={e =>
							setFormData(prev => ({
								...prev,
								servings: Number(e.target.value),
							}))
						}
						required
					/>
				</div>

				<div className='col-span-2'>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Описание
					</label>
					<textarea
						value={formData.description}
						onChange={e =>
							setFormData(prev => ({ ...prev, description: e.target.value }))
						}
						rows={3}
						className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500'
					/>
				</div>

				{/* Ingredients */}
				<div className='space-y-3'>
					<div className='flex items-center justify-between'>
						<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Ингредиенты *
						</label>
						<button
							type='button'
							onClick={addIngredient}
							className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
						>
							+ Добавить ингредиент
						</button>
					</div>
					{formData.ingredients.map((ingredient, index) => (
						<div
							key={index}
							className='grid grid-cols-1 md:grid-cols-12 gap-2 items-end'
						>
							<div className='md:col-span-6'>
								<Select
									value={ingredient.productId}
									onChange={value =>
										updateIngredient(index, 'productId', value)
									}
									options={[
										{ value: '', label: 'Выберите продукт' },
										...products.map(p => ({ value: p.id, label: p.name })),
									]}
								/>
							</div>
							<div className='md:col-span-3'>
								<Input
									type='number'
									min={0.1}
									step={0.1}
									value={ingredient.amount}
									onChange={e =>
										updateIngredient(index, 'amount', Number(e.target.value))
									}
									placeholder='Количество'
								/>
							</div>
							<div className='md:col-span-2'>
								<Select
									value={ingredient.unit}
									onChange={value => updateIngredient(index, 'unit', value)}
									options={[
										{ value: 'G', label: 'г' },
										{ value: 'ML', label: 'мл' },
										{ value: 'PIECE', label: 'шт' },
										{ value: 'PORTION', label: 'порц' },
									]}
								/>
							</div>
							<div className='md:col-span-1'>
								<button
									type='button'
									onClick={() => removeIngredient(index)}
									className='w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg'
								>
									<X className='w-4 h-4 mx-auto' />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Ingredients Info (only for existing dish) */}
				{dish && dish.ingredients.length > 0 && (
					<div className='bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3'>
						<h4 className='font-medium text-gray-900 dark:text-white text-sm'>
							Информация об ингредиентах:
						</h4>
						<div className='space-y-2'>
							{dish.ingredients.map(ing => (
								<div
									key={ing.id}
									className='flex items-center justify-between text-sm bg-white dark:bg-gray-800 rounded p-2'
								>
									<div className='flex-1'>
										<p className='font-medium text-gray-900 dark:text-white'>
											{ing.product.name}
										</p>
										<p className='text-xs text-gray-500 dark:text-gray-400'>
											{ing.amount}
											{ing.unit === 'G'
												? 'г'
												: ing.unit === 'ML'
												? 'мл'
												: ing.unit === 'PIECE'
												? 'шт'
												: 'порц'}{' '}
											• КБЖУ: {ing.product.calories?.toFixed(0) ?? 0} /{' '}
											{ing.product.proteins?.toFixed(1) ?? 0} /{' '}
											{ing.product.fats?.toFixed(1) ?? 0} /{' '}
											{ing.product.carbs?.toFixed(1) ?? 0}
										</p>
									</div>
									<div className='text-right'>
										{ing.calculatedPrice !== null &&
										ing.calculatedPrice !== undefined ? (
											<p className='font-semibold text-gray-900 dark:text-white'>
												{ing.calculatedPrice.toFixed(2)} ₽
											</p>
										) : (
											<p className='text-xs text-gray-400 dark:text-gray-500'>
												Нет цены
											</p>
										)}
										{ing.product.price !== null &&
											ing.product.price !== undefined && (
												<p className='text-xs text-gray-500 dark:text-gray-400'>
													{ing.product.price.toFixed(2)} ₽/
													{ing.product.servingSize}
													{ing.product.unit === 'G' ? 'г' : 'мл'}
												</p>
											)}
									</div>
								</div>
							))}
						</div>
						{/* Total Price */}
						{dish.totalPrice !== null && dish.totalPrice !== undefined && (
							<div className='pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between'>
								<span className='font-medium text-gray-900 dark:text-white'>
									Общая стоимость:
								</span>
								<div className='text-right'>
									<p className='font-bold text-gray-900 dark:text-white'>
										{dish.totalPrice.toFixed(2)} ₽
									</p>
									{dish.pricePerServing !== null &&
										dish.pricePerServing !== undefined && (
											<p className='text-sm text-gray-500 dark:text-gray-400'>
												{dish.pricePerServing.toFixed(2)} ₽/порция
											</p>
										)}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Metadata */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<Select
						label='Тип приёма пищи'
						value={formData.mealType || ''}
						onChange={value =>
							setFormData(prev => ({
								...prev,
								mealType: value as MealType | undefined,
							}))
						}
						options={[
							{ value: '', label: 'Не указано' },
							{ value: 'BREAKFAST', label: 'Завтрак' },
							{ value: 'LUNCH', label: 'Обед' },
							{ value: 'DINNER', label: 'Ужин' },
							{ value: 'SNACK', label: 'Перекус' },
							{ value: 'DESSERT', label: 'Десерт' },
						]}
					/>

					<Select
						label='Кухня'
						value={formData.cuisineType || ''}
						onChange={value =>
							setFormData(prev => ({
								...prev,
								cuisineType: value as CuisineType | undefined,
							}))
						}
						options={[
							{ value: '', label: 'Не указано' },
							{ value: 'RUSSIAN', label: 'Русская' },
							{ value: 'ITALIAN', label: 'Итальянская' },
							{ value: 'ASIAN', label: 'Азиатская' },
							{ value: 'MEXICAN', label: 'Мексиканская' },
							{ value: 'FRENCH', label: 'Французская' },
							{ value: 'JAPANESE', label: 'Японская' },
							{ value: 'AMERICAN', label: 'Американская' },
						]}
					/>

					<Select
						label='Сложность'
						value={formData.difficulty}
						onChange={value =>
							setFormData(prev => ({
								...prev,
								difficulty: value as DifficultyLevel,
							}))
						}
						options={[
							{ value: 'EASY', label: 'Простое' },
							{ value: 'MEDIUM', label: 'Среднее' },
							{ value: 'HARD', label: 'Сложное' },
						]}
					/>
				</div>

				{/* Tags */}
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
						Теги
					</label>
					<div className='flex flex-wrap gap-2'>
						{tags.map(tag => (
							<button
								key={tag.id}
								type='button'
								onClick={() => {
									setFormData(prev => ({
										...prev,
										tagIds: prev.tagIds.includes(tag.id)
											? prev.tagIds.filter(id => id !== tag.id)
											: [...prev.tagIds, tag.id],
									}))
								}}
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

				{/* Actions */}
				<div className='flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700'>
					<button
						type='button'
						onClick={onClose}
						disabled={loading}
						className='px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading}
						className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2'
					>
						{loading ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
								Сохранение...
							</>
						) : (
							<>
								<ChefHat className='w-4 h-4' />
								{dish ? 'Обновить' : 'Создать'}
							</>
						)}
					</button>
				</div>
			</form>
		</Modal>
	)
}
