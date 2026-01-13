import { useEffect, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import * as CategoriesAPI from '../../../../../api/services/categories'
import * as ProductsAPI from '../../../../../api/services/products'
import type {
	Lang,
	ProductUserResponse,
	UpdateProductUserDto,
} from '../../../../../api/types/products'
import { Modal, useToast } from '../../../../../components'
import {
	BasicInfoSection,
	EditActionsBar,
	GlobalProductSection,
	NutritionSection,
	PackagesSection,
	PhotosSection,
	ServingsSection,
} from '../components'

interface ProductDetailModalProps {
	isOpen: boolean
	onClose: () => void
	productId: string | null
	onUpdate?: () => void
}

export const ProductDetailModal = ({
	isOpen,
	onClose,
	productId,
	onUpdate,
}: ProductDetailModalProps) => {
	const { showToast } = useToast()
	const [product, setProduct] = useState<ProductUserResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [saving, setSaving] = useState(false)

	// Состояния для редактирования
	const [editName, setEditName] = useState('')
	const [editLang, setEditLang] = useState<Lang>('RU')
	const [editBarcode, setEditBarcode] = useState('')
	const [editCategoryId, setEditCategoryId] = useState('')
	const [editBrandId, setEditBrandId] = useState('')
	const [editCalories, setEditCalories] = useState('')
	const [editProteins, setEditProteins] = useState('')
	const [editFats, setEditFats] = useState('')
	const [editCarbs, setEditCarbs] = useState('')
	const [editSugars, setEditSugars] = useState('')
	const [editFiber, setEditFiber] = useState('')
	const [editSalt, setEditSalt] = useState('')

	// Данные для селектов
	const [categories, setCategories] = useState<any[]>([])
	const [brands, setBrands] = useState<any[]>([])
	const [dataLoading, setDataLoading] = useState(false)

	useEffect(() => {
		if (isOpen && productId) {
			loadProduct()
		}
		// Сбрасываем режим редактирования при закрытии
		if (!isOpen) {
			setIsEditing(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, productId])

	async function loadProduct() {
		if (!productId) return

		setLoading(true)
		try {
			const data = await ProductsAPI.getProductUser(productId)
			setProduct(data)
			initEditFields(data)
		} catch (error: any) {
			showToast('Ошибка при загрузке продукта', 'error')
			onClose()
		} finally {
			setLoading(false)
		}
	}

	async function loadFiltersData() {
		setDataLoading(true)
		try {
			const [categoriesRes, brandsRes] = await Promise.all([
				CategoriesAPI.listCategories({ onlyActive: true }),
				BrandsAPI.listBrands(),
			])
			setCategories(categoriesRes.categories)
			setBrands(brandsRes.filter((b: any) => b.isApproved))
		} catch (error: any) {
			showToast('Ошибка при загрузке данных', 'error')
		} finally {
			setDataLoading(false)
		}
	}

	const initEditFields = (data: ProductUserResponse) => {
		setEditName(data.names[0]?.name || '')
		setEditLang((data.names[0]?.lang as Lang) || 'RU')
		setEditBarcode(data.barcode || '')
		setEditCategoryId(data.categoryId || '')
		setEditBrandId(data.brandId || '')
		setEditCalories(data.nutrition.caloriesKcal.toString())
		setEditProteins(data.nutrition.proteinsG.toString())
		setEditFats(data.nutrition.fatsG.toString())
		setEditCarbs(data.nutrition.carbohydratesG.toString())
		setEditSugars(data.nutrition.sugarsG?.toString() || '')
		setEditFiber(data.nutrition.fiberG?.toString() || '')
		setEditSalt(data.nutrition.saltG?.toString() || '')
	}

	const handleStartEdit = async () => {
		await loadFiltersData()
		setIsEditing(true)
	}

	const handleCancelEdit = () => {
		if (product) {
			initEditFields(product)
		}
		setIsEditing(false)
		loadProduct() // Перезагружаем данные для обновления истории покупок
	}

	const handleSave = async () => {
		if (!productId || !product) return

		// Валидация
		if (!editName.trim() || editName.length < 2) {
			showToast('Название должно быть от 2 символов', 'error')
			return
		}

		const calories = parseFloat(editCalories)
		const proteins = parseFloat(editProteins)
		const fats = parseFloat(editFats)
		const carbs = parseFloat(editCarbs)

		if (
			isNaN(calories) ||
			calories < 0 ||
			isNaN(proteins) ||
			proteins < 0 ||
			isNaN(fats) ||
			fats < 0 ||
			isNaN(carbs) ||
			carbs < 0
		) {
			showToast('Проверьте правильность пищевой ценности', 'error')
			return
		}

		const updateData: UpdateProductUserDto = {
			name: editName.trim(),
			lang: editLang,
			barcode: editBarcode.trim() || undefined,
			categoryId: editCategoryId || undefined,
			brandId: editBrandId || undefined,
			nutrition: {
				caloriesKcal: calories,
				proteinsG: proteins,
				fatsG: fats,
				carbohydratesG: carbs,
				...(editSugars && { sugarsG: parseFloat(editSugars) }),
				...(editFiber && { fiberG: parseFloat(editFiber) }),
				...(editSalt && { saltG: parseFloat(editSalt) }),
			},
		}

		setSaving(true)
		try {
			await ProductsAPI.updateProductUser(productId, updateData)
			setIsEditing(false)
			showToast('Продукт успешно обновлен', 'success')
			onUpdate?.()
			loadProduct() // Перезагружаем полные данные для обновления истории покупок
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || 'Ошибка при обновлении продукта'
			showToast(errorMessage, 'error')
		} finally {
			setSaving(false)
		}
	}

	const buildCategoryOptions = (categories: any[]): any[] => {
		const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

		const getPath = (categoryId: string): string[] => {
			const path: string[] = []
			let current = categoryMap.get(categoryId)

			while (current) {
				path.unshift(current.name)
				if (!current.parentId) break
				current = categoryMap.get(current.parentId)
			}

			return path
		}

		return categories.map(cat => {
			const path = getPath(cat.id)
			const displayLabel = path.length === 1 ? path[0] : path.join(' → ')

			return {
				value: cat.id,
				label: displayLabel,
			}
		})
	}

	const getProductName = () => {
		if (!product) return 'Загрузка...'
		return product.names[0]?.name || 'Без названия'
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			maxWidth='6xl'
			title={getProductName()}
		>
			<div className='relative'>
				{loading ? (
					<div className='flex items-center justify-center py-12'>
						<div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
					</div>
				) : !product ? (
					<div className='text-center py-12'>
						<p className='text-gray-600 dark:text-gray-400'>
							Продукт не найден
						</p>
					</div>
				) : (
					<div className='space-y-6'>
						{/* Кнопки управления в правом верхнем углу */}
						<div className='absolute top-0 right-0 z-10'>
							<EditActionsBar
								isEditing={isEditing}
								onStartEdit={handleStartEdit}
								onSave={handleSave}
								onCancel={handleCancelEdit}
								saving={saving}
							/>
						</div>

						{/* Отступ для кнопок */}
						<div className='h-8' />

						{/* Фотографии в самом верху */}
						<PhotosSection
							product={product}
							getProductName={getProductName}
							isEditing={isEditing}
							onPhotoUpdate={loadProduct}
							isOwner={true} // TODO: определять на основе product.userId === currentUserId
						/>

						{/* Основная информация */}
						<BasicInfoSection
							product={product}
							isEditing={isEditing}
							saving={saving}
							dataLoading={dataLoading}
							editName={editName}
							setEditName={setEditName}
							editBarcode={editBarcode}
							setEditBarcode={setEditBarcode}
							editCategoryId={editCategoryId}
							setEditCategoryId={setEditCategoryId}
							editBrandId={editBrandId}
							setEditBrandId={setEditBrandId}
							categories={categories}
							brands={brands}
							flattenCategories={buildCategoryOptions}
							formatDate={formatDate}
						/>

						{/* Пищевая ценность */}
						<NutritionSection
							product={product}
							isEditing={isEditing}
							saving={saving}
							editCalories={editCalories}
							setEditCalories={setEditCalories}
							editProteins={editProteins}
							setEditProteins={setEditProteins}
							editFats={editFats}
							setEditFats={setEditFats}
							editCarbs={editCarbs}
							setEditCarbs={setEditCarbs}
							editSugars={editSugars}
							setEditSugars={setEditSugars}
							editFiber={editFiber}
							setEditFiber={setEditFiber}
							editSalt={editSalt}
							setEditSalt={setEditSalt}
						/>

						{/* История покупок и Порции - горизонтальное размещение */}
						<div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
							{/* История покупок */}
							<PackagesSection
								product={product}
								formatDate={formatDate}
								isEditing={isEditing}
								onPackageUpdate={loadProduct}
								isOwner={true} // TODO: определять на основе product.userId === currentUserId
							/>

							{/* Порции */}
							<ServingsSection
								product={product}
								isEditing={isEditing}
								onServingUpdate={loadProduct}
								isOwner={true} // TODO: определять на основе product.userId === currentUserId
							/>
						</div>

						{/* Глобальный продукт */}
						<GlobalProductSection product={product} />
					</div>
				)}
			</div>
		</Modal>
	)
}
