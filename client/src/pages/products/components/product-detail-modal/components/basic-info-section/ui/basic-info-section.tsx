import type { ProductUserResponse } from '../../../../../../../api/types/products'
import { Input, Select } from '../../../../../../../components'

interface BasicInfoSectionProps {
	product: ProductUserResponse
	isEditing: boolean
	saving: boolean
	dataLoading: boolean
	editName: string
	setEditName: (value: string) => void
	editBarcode: string
	setEditBarcode: (value: string) => void
	editCategoryId: string
	setEditCategoryId: (value: string) => void
	editBrandId: string
	setEditBrandId: (value: string) => void
	categories: any[]
	brands: any[]
	flattenCategories: (cats: any[]) => any[]
	formatDate: (date: string) => string
}

export const BasicInfoSection = ({
	product,
	isEditing,
	saving,
	dataLoading,
	editName,
	setEditName,
	editBarcode,
	setEditBarcode,
	editCategoryId,
	setEditCategoryId,
	editBrandId,
	setEditBrandId,
	categories,
	brands,
	flattenCategories,
	formatDate,
}: BasicInfoSectionProps) => {
	return (
		<>
			{/* Основная информация */}
			<section>
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
					Основная информация
				</h3>

				{isEditing ? (
					<div className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Название продукта
							</label>
							<Input
								value={editName}
								onChange={e => setEditName(e.target.value)}
								disabled={saving}
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Баркод
								</label>
								<Input
									value={editBarcode}
									onChange={e =>
										setEditBarcode(e.target.value.replace(/\D/g, ''))
									}
									maxLength={13}
									disabled={saving}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Категория
								</label>
								{dataLoading ? (
									<div className='text-sm text-gray-500 dark:text-gray-400'>
										Загрузка...
									</div>
								) : (
									<Select
										value={editCategoryId}
										onChange={setEditCategoryId}
										options={[
											{ value: '', label: 'Не выбрана' },
											...flattenCategories(categories),
										]}
										disabled={saving}
										searchable={true}
									/>
								)}
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Бренд
								</label>
								{dataLoading ? (
									<div className='text-sm text-gray-500 dark:text-gray-400'>
										Загрузка...
									</div>
								) : (
									<Select
										value={editBrandId}
										onChange={setEditBrandId}
										options={[
											{ value: '', label: 'Не выбран' },
											...brands.map((b: any) => ({
												value: b.id,
												label: b.name,
											})),
										]}
										disabled={saving}
										searchable={true}
									/>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
						<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm'>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
								Штрих-код
							</p>
							<p className='text-base font-medium text-gray-800 dark:text-white wrap-break-word'>
								{product.barcode || 'Не указан'}
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm'>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
								Категория
							</p>
							<p className='text-base font-medium text-gray-800 dark:text-white wrap-break-word'>
								{product.category?.name || 'Не указана'}
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm'>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
								Бренд
							</p>
							<p className='text-base font-medium text-gray-800 dark:text-white wrap-break-word'>
								{product.brand?.name || 'Не указан'}
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm'>
							<p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
								Создан
							</p>
							<p className='text-base font-medium text-gray-800 dark:text-white wrap-break-word'>
								{formatDate(product.createdAt)}
							</p>
						</div>
					</div>
				)}
			</section>

			{/* Названия на разных языках */}
			{product.names.length > 0 && (
				<section>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
						Названия на разных языках
					</h3>
					<div className='space-y-2'>
						{product.names.map((nameObj, index) => (
							<div
								key={index}
								className='flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3'
							>
								<span className='text-gray-900 dark:text-white font-medium wrap-break-word flex-1'>
									{nameObj.name}
								</span>
								<span className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded whitespace-nowrap'>
									{nameObj.lang}
								</span>
							</div>
						))}
					</div>
				</section>
			)}
		</>
	)
}
