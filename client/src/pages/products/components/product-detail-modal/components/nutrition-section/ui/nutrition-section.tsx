import type { ProductUserResponse } from '../../../../../../../api/types/products'
import { Input } from '../../../../../../../components'

interface NutritionSectionProps {
	product: ProductUserResponse
	isEditing: boolean
	saving: boolean
	editCalories: string
	setEditCalories: (value: string) => void
	editProteins: string
	setEditProteins: (value: string) => void
	editFats: string
	setEditFats: (value: string) => void
	editCarbs: string
	setEditCarbs: (value: string) => void
	editSugars: string
	setEditSugars: (value: string) => void
	editFiber: string
	setEditFiber: (value: string) => void
	editSalt: string
	setEditSalt: (value: string) => void
}

export const NutritionSection = ({
	product,
	isEditing,
	saving,
	editCalories,
	setEditCalories,
	editProteins,
	setEditProteins,
	editFats,
	setEditFats,
	editCarbs,
	setEditCarbs,
	editSugars,
	setEditSugars,
	editFiber,
	setEditFiber,
	editSalt,
	setEditSalt,
}: NutritionSectionProps) => {
	return (
		<section>
			<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
				Пищевая ценность на 100г
			</h3>

			{isEditing ? (
				<div className='space-y-4'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Калории (ккал)
							</label>
							<Input
								type='number'
								value={editCalories}
								onChange={e => setEditCalories(e.target.value)}
								min='0'
								step='1'
								disabled={saving}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Белки (г)
							</label>
							<Input
								type='number'
								value={editProteins}
								onChange={e => setEditProteins(e.target.value)}
								min='0'
								step='0.01'
								disabled={saving}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Жиры (г)
							</label>
							<Input
								type='number'
								value={editFats}
								onChange={e => setEditFats(e.target.value)}
								min='0'
								step='0.01'
								disabled={saving}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Углеводы (г)
							</label>
							<Input
								type='number'
								value={editCarbs}
								onChange={e => setEditCarbs(e.target.value)}
								min='0'
								step='0.01'
								disabled={saving}
							/>
						</div>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Сахара (г)
							</label>
							<Input
								type='number'
								value={editSugars}
								onChange={e => setEditSugars(e.target.value)}
								min='0'
								step='0.01'
								disabled={saving}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Клетчатка (г)
							</label>
							<Input
								type='number'
								value={editFiber}
								onChange={e => setEditFiber(e.target.value)}
								min='0'
								step='0.01'
								disabled={saving}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Соль (г)
							</label>
							<Input
								type='number'
								value={editSalt}
								onChange={e => setEditSalt(e.target.value)}
								min='0'
								step='0.01'
								disabled={saving}
							/>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div className='bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center'>
							<p className='text-sm text-orange-600 dark:text-orange-400 mb-1'>
								Калории
							</p>
							<p className='text-2xl font-bold text-orange-700 dark:text-orange-300'>
								{product.nutrition.caloriesKcal}
							</p>
							<p className='text-xs text-orange-600 dark:text-orange-400'>
								ккал
							</p>
						</div>

						<div className='bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center'>
							<p className='text-sm text-red-600 dark:text-red-400 mb-1'>
								Белки
							</p>
							<p className='text-2xl font-bold text-red-700 dark:text-red-300'>
								{product.nutrition.proteinsG}
							</p>
							<p className='text-xs text-red-600 dark:text-red-400'>г</p>
						</div>

						<div className='bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center'>
							<p className='text-sm text-yellow-600 dark:text-yellow-400 mb-1'>
								Жиры
							</p>
							<p className='text-2xl font-bold text-yellow-700 dark:text-yellow-300'>
								{product.nutrition.fatsG}
							</p>
							<p className='text-xs text-yellow-600 dark:text-yellow-400'>г</p>
						</div>

						<div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center'>
							<p className='text-sm text-green-600 dark:text-green-400 mb-1'>
								Углеводы
							</p>
							<p className='text-2xl font-bold text-green-700 dark:text-green-300'>
								{product.nutrition.carbohydratesG}
							</p>
							<p className='text-xs text-green-600 dark:text-green-400'>г</p>
						</div>
					</div>

					{/* Дополнительная пищевая ценность */}
					{(product.nutrition.sugarsG !== null ||
						product.nutrition.fiberG !== null ||
						product.nutrition.saltG !== null) && (
						<div className='grid grid-cols-3 gap-4 mt-4'>
							{product.nutrition.sugarsG !== null && (
								<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center shadow-sm'>
									<p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
										Сахара
									</p>
									<p className='text-lg font-semibold text-gray-800 dark:text-white'>
										{product.nutrition.sugarsG}г
									</p>
								</div>
							)}

							{product.nutrition.fiberG !== null && (
								<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center shadow-sm'>
									<p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
										Клетчатка
									</p>
									<p className='text-lg font-semibold text-gray-800 dark:text-white'>
										{product.nutrition.fiberG}г
									</p>
								</div>
							)}

							{product.nutrition.saltG !== null && (
								<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center shadow-sm'>
									<p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
										Соль
									</p>
									<p className='text-lg font-semibold text-gray-800 dark:text-white'>
										{product.nutrition.saltG}г
									</p>
								</div>
							)}
						</div>
					)}
				</>
			)}
		</section>
	)
}
