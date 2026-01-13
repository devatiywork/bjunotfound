import { useEffect, useState } from 'react'
import * as BrandsAPI from '../../../../../api/services/brands'
import * as CategoriesAPI from '../../../../../api/services/categories'
import * as ProductsAPI from '../../../../../api/services/products'
import type {
	CreateProductUserDto,
	Lang,
} from '../../../../../api/types/products'
import { Input, Modal, Select, useToast } from '../../../../../components'

interface ProductModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: (productId?: string) => void
	productId?: string | null
}

const LANGUAGES: { value: Lang; label: string }[] = [
	{ value: 'RU', label: 'Русский' },
	{ value: 'EN', label: 'English' },
	{ value: 'UK', label: 'Українська' },
	{ value: 'ES', label: 'Español' },
	{ value: 'FR', label: 'Français' },
	{ value: 'DE', label: 'Deutsch' },
]

export const ProductModal = ({
	isOpen,
	onClose,
	onSuccess,
	productId,
}: ProductModalProps) => {
	const { showToast } = useToast()

	// Основные поля
	const [name, setName] = useState('')
	const [lang, setLang] = useState<Lang>('RU')
	const [barcode, setBarcode] = useState('')
	const [categoryId, setCategoryId] = useState<string>('')
	const [brandId, setBrandId] = useState<string>('')

	// Пищевая ценность (обязательные поля)
	const [caloriesKcal, setCaloriesKcal] = useState('')
	const [proteinsG, setProteinsG] = useState('')
	const [fatsG, setFatsG] = useState('')
	const [carbohydratesG, setCarbohydratesG] = useState('')

	// Пищевая ценность (опциональные поля)
	const [sugarsG, setSugarsG] = useState('')
	const [fiberG, setFiberG] = useState('')
	const [saltG, setSaltG] = useState('')

	// Данные для селектов
	const [categories, setCategories] = useState<any[]>([])
	const [brands, setBrands] = useState<any[]>([])

	// Состояние загрузки
	const [loading, setLoading] = useState(false)
	const [dataLoading, setDataLoading] = useState(false)

	// Загрузка данных для селектов и продукта
	useEffect(() => {
		if (isOpen) {
			loadData()
			if (productId) {
				loadProduct()
			}
		}
	}, [isOpen, productId])

	async function loadData() {
		setDataLoading(true)
		try {
			const [categoriesRes, brandsRes] = await Promise.all([
				CategoriesAPI.listCategories({ onlyActive: true }),
				BrandsAPI.listBrands(),
			])
			setCategories(categoriesRes.categories)
			// Фильтруем только approved бренды на клиенте
			setBrands(brandsRes.filter(b => b.isApproved))
		} catch (error: any) {
			showToast('Ошибка при загрузке данных', 'error')
		} finally {
			setDataLoading(false)
		}
	}

	async function loadProduct() {
		if (!productId) return

		setLoading(true)
		try {
			const product = await ProductsAPI.getProductUser(productId)
			// Заполняем форму данными продукта
			setName(product.names[0]?.name || '')
			setLang((product.names[0]?.lang as Lang) || 'RU')
			setBarcode(product.barcode || '')
			setCategoryId(product.categoryId || '')
			setBrandId(product.brandId || '')
			setCaloriesKcal(product.nutrition.caloriesKcal.toString())
			setProteinsG(product.nutrition.proteinsG.toString())
			setFatsG(product.nutrition.fatsG.toString())
			setCarbohydratesG(product.nutrition.carbohydratesG.toString())
			setSugarsG(product.nutrition.sugarsG?.toString() || '')
			setFiberG(product.nutrition.fiberG?.toString() || '')
			setSaltG(product.nutrition.saltG?.toString() || '')
		} catch (error: any) {
			showToast('Ошибка при загрузке продукта', 'error')
			onClose()
		} finally {
			setLoading(false)
		}
	}

	const resetForm = () => {
		setName('')
		setLang('RU')
		setBarcode('')
		setCategoryId('')
		setBrandId('')
		setCaloriesKcal('')
		setProteinsG('')
		setFatsG('')
		setCarbohydratesG('')
		setSugarsG('')
		setFiberG('')
		setSaltG('')
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const validateForm = (): string | null => {
		// Проверка обязательных полей
		if (!name.trim() || name.length < 2 || name.length > 200) {
			return 'Название должно быть от 2 до 200 символов'
		}

		// Проверка баркода
		if (barcode && !/^\d{8,13}$/.test(barcode)) {
			return 'Баркод должен содержать от 8 до 13 цифр'
		}

		// Проверка обязательных полей пищевой ценности
		const calories = parseFloat(caloriesKcal)
		const proteins = parseFloat(proteinsG)
		const fats = parseFloat(fatsG)
		const carbs = parseFloat(carbohydratesG)

		if (
			isNaN(calories) ||
			calories < 0 ||
			calories > 9999 ||
			isNaN(proteins) ||
			proteins < 0 ||
			proteins > 999.99 ||
			isNaN(fats) ||
			fats < 0 ||
			fats > 999.99 ||
			isNaN(carbs) ||
			carbs < 0 ||
			carbs > 999.99
		) {
			return 'Проверьте правильность заполнения пищевой ценности'
		}

		// Проверка опциональных полей
		if (sugarsG && (isNaN(parseFloat(sugarsG)) || parseFloat(sugarsG) < 0)) {
			return 'Сахара должны быть неотрицательным числом'
		}
		if (fiberG && (isNaN(parseFloat(fiberG)) || parseFloat(fiberG) < 0)) {
			return 'Клетчатка должна быть неотрицательным числом'
		}
		if (saltG && (isNaN(parseFloat(saltG)) || parseFloat(saltG) < 0)) {
			return 'Соль должна быть неотрицательным числом'
		}

		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const validationError = validateForm()
		if (validationError) {
			showToast(validationError, 'error')
			return
		}

		const data: CreateProductUserDto = {
			name: name.trim(),
			lang,
			nutrition: {
				caloriesKcal: parseFloat(caloriesKcal),
				proteinsG: parseFloat(proteinsG),
				fatsG: parseFloat(fatsG),
				carbohydratesG: parseFloat(carbohydratesG),
				...(sugarsG && { sugarsG: parseFloat(sugarsG) }),
				...(fiberG && { fiberG: parseFloat(fiberG) }),
				...(saltG && { saltG: parseFloat(saltG) }),
			},
		}

		// Добавляем опциональные поля только если они заполнены
		if (barcode.trim()) data.barcode = barcode.trim()
		if (categoryId) data.categoryId = categoryId
		if (brandId) data.brandId = brandId

		setLoading(true)
		try {
			if (productId) {
				// Режим редактирования
				await ProductsAPI.updateProductUser(productId, data)
				showToast('Продукт успешно обновлен', 'success')
				handleClose()
				onSuccess(productId)
			} else {
				// Режим создания
				const response = await ProductsAPI.createProductUser(data)
				showToast('Продукт успешно создан', 'success')
				handleClose()
				onSuccess(response.id)
			}

			// TODO: В будущем здесь будет возможность сразу добавлять фотографии,
			// порции и историю покупок. Для этого модалка не будет закрываться
			// автоматически, а перейдет на следующий шаг.
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message ||
				(productId
					? 'Ошибка при обновлении продукта'
					: 'Ошибка при создании продукта')
			showToast(errorMessage, 'error')
		} finally {
			setLoading(false)
		}
	}

	// Построение опций для селекта с полным путем родителей
	const buildCategoryOptions = (categories: any[]): any[] => {
		const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

		// Функция для получения полного пути категории
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

		// Создаем опции с полными путями
		return categories.map(cat => {
			const path = getPath(cat.id)
			const displayLabel = path.length === 1 ? path[0] : path.join(' → ')

			return {
				value: cat.id,
				label: displayLabel,
			}
		})
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={productId ? 'Редактировать продукт' : 'Добавить продукт'}
			maxWidth='3xl'
		>
			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Основная информация */}
				<div className='space-y-4'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Основная информация
					</h3>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* Название продукта */}
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Название продукта <span className='text-red-500'>*</span>
							</label>
							<Input
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder='Например: Молоко 3.2%'
								maxLength={200}
								required
								disabled={loading}
							/>
							<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
								От 2 до 200 символов
							</p>
						</div>

						{/* Язык и Баркод */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Язык названия
							</label>
							<Select
								value={lang}
								onChange={value => setLang(value as Lang)}
								options={LANGUAGES}
								disabled={loading}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Баркод
							</label>
							<Input
								value={barcode}
								onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
								placeholder='1234567890123'
								maxLength={13}
								disabled={loading}
							/>
							<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
								От 8 до 13 цифр (опционально)
							</p>
						</div>

						{/* Категория и Бренд */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Категория
							</label>
							{dataLoading ? (
								<div className='text-sm text-gray-500 dark:text-gray-400'>
									Загрузка категорий...
								</div>
							) : (
								<Select
									value={categoryId}
									onChange={setCategoryId}
									options={[
										{ value: '', label: 'Не выбрана' },
										...buildCategoryOptions(categories),
									]}
									disabled={loading}
									searchable={true}
									placeholder='Выберите категорию'
								/>
							)}
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Бренд
							</label>
							{dataLoading ? (
								<div className='text-sm text-gray-500 dark:text-gray-400'>
									Загрузка брендов...
								</div>
							) : (
								<Select
									value={brandId}
									onChange={setBrandId}
									options={[
										{ value: '', label: 'Не выбран' },
										...brands.map(b => ({ value: b.id, label: b.name })),
									]}
									disabled={loading}
									searchable={true}
									placeholder='Выберите бренд'
								/>
							)}
						</div>
					</div>
				</div>

				{/* Пищевая ценность */}
				<div className='space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
						Пищевая ценность{' '}
						<span className='text-sm font-normal text-gray-500 dark:text-gray-400'>
							(на 100 г/мл)
						</span>
					</h3>

					{/* Обязательные поля КБЖУ */}
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Калории (ккал) <span className='text-red-500'>*</span>
							</label>
							<Input
								type='number'
								value={caloriesKcal}
								onChange={e => setCaloriesKcal(e.target.value)}
								placeholder='0'
								min='0'
								max='9999'
								step='1'
								required
								disabled={loading}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Белки (г) <span className='text-red-500'>*</span>
							</label>
							<Input
								type='number'
								value={proteinsG}
								onChange={e => setProteinsG(e.target.value)}
								placeholder='0'
								min='0'
								max='999.99'
								step='0.01'
								required
								disabled={loading}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Жиры (г) <span className='text-red-500'>*</span>
							</label>
							<Input
								type='number'
								value={fatsG}
								onChange={e => setFatsG(e.target.value)}
								placeholder='0'
								min='0'
								max='999.99'
								step='0.01'
								required
								disabled={loading}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Углеводы (г) <span className='text-red-500'>*</span>
							</label>
							<Input
								type='number'
								value={carbohydratesG}
								onChange={e => setCarbohydratesG(e.target.value)}
								placeholder='0'
								min='0'
								max='999.99'
								step='0.01'
								required
								disabled={loading}
							/>
						</div>
					</div>

					{/* Опциональные поля */}
					<div className='grid grid-cols-3 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Сахара (г)
							</label>
							<Input
								type='number'
								value={sugarsG}
								onChange={e => setSugarsG(e.target.value)}
								placeholder='0'
								min='0'
								max='999.99'
								step='0.01'
								disabled={loading}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Клетчатка (г)
							</label>
							<Input
								type='number'
								value={fiberG}
								onChange={e => setFiberG(e.target.value)}
								placeholder='0'
								min='0'
								max='999.99'
								step='0.01'
								disabled={loading}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Соль (г)
							</label>
							<Input
								type='number'
								value={saltG}
								onChange={e => setSaltG(e.target.value)}
								placeholder='0'
								min='0'
								max='999.99'
								step='0.01'
								disabled={loading}
							/>
						</div>
					</div>
				</div>

				{/* Кнопки */}
				<div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
					<button
						type='button'
						onClick={handleClose}
						disabled={loading}
						className='flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading || dataLoading}
						className='flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
					>
						{loading ? (
							<>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								<span>{productId ? 'Сохранение...' : 'Создание...'}</span>
							</>
						) : productId ? (
							'Сохранить изменения'
						) : (
							'Создать продукт'
						)}
					</button>
				</div>
			</form>
		</Modal>
	)
}
