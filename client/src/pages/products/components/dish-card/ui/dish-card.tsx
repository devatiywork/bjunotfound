import {
	CheckCircle,
	ChefHat,
	Clock,
	Edit,
	Eye,
	Star,
	Trash2,
	User,
} from 'lucide-react'
import { useState } from 'react'
import type { Dish } from '../../../../../api'
import {
	CUISINE_TYPE_NAMES,
	DIFFICULTY_LEVEL_NAMES,
	MEAL_TYPE_NAMES,
} from '../../../../../api/types/dishes.ts'
import { Modal } from '../../../../../components'

interface DishCardProps {
	dish: Dish
	onEdit: (dish: Dish) => void
	onDelete: (id: string) => void
}

export default function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
	const [imageLoading, setImageLoading] = useState(true)
	const [imageError, setImageError] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4'>
			{/* Header with image/icon */}
			<div className='relative mb-3'>
				{dish.photo && !imageError ? (
					<div className='relative w-full h-40'>
						{imageLoading && (
							<div className='absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400' />
							</div>
						)}
						<img
							src={dish.photo}
							alt={dish.name}
							className={`w-full h-40 object-cover rounded-lg transition-opacity duration-300 ${
								imageLoading ? 'opacity-0' : 'opacity-100'
							}`}
							loading='lazy'
							onLoad={() => setImageLoading(false)}
							onError={() => {
								setImageLoading(false)
								setImageError(true)
							}}
						/>
					</div>
				) : (
					<div className='w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
						<ChefHat className='w-12 h-12 text-gray-400 dark:text-gray-500' />
					</div>
				)}

				{/* Verified Badge */}
				{dish.isVerified && (
					<div className='absolute top-2 right-2 bg-green-500 text-white rounded-full p-1'>
						<CheckCircle className='w-4 h-4' />
					</div>
				)}
			</div>

			{/* Dish Info */}
			<div className='space-y-2'>
				<div>
					<h3 className='font-semibold text-gray-900 dark:text-white text-lg line-clamp-1'>
						{dish.name}
					</h3>
					{dish.description && (
						<p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
							{dish.description}
						</p>
					)}
				</div>

				{/* Badges */}
				<div className='flex items-center gap-2 flex-wrap'>
					{dish.mealType && (
						<span className='text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded'>
							{MEAL_TYPE_NAMES[dish.mealType]}
						</span>
					)}
					{dish.cuisineType && (
						<span className='text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded'>
							{CUISINE_TYPE_NAMES[dish.cuisineType]}
						</span>
					)}
					{dish.source === 'USER' && (
						<span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded flex items-center gap-1'>
							<User className='w-3 h-3' />
							Мой
						</span>
					)}
				</div>

				{/* Metadata */}
				<div className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400'>
					{dish.difficulty && (
						<span className='flex items-center gap-1'>
							<Star className='w-4 h-4' />
							{DIFFICULTY_LEVEL_NAMES[dish.difficulty]}
						</span>
					)}
					{dish.cookingTimeMinutes && (
						<span className='flex items-center gap-1'>
							<Clock className='w-4 h-4' />
							{dish.cookingTimeMinutes} мин
						</span>
					)}
				</div>

				{/* Nutrition Info per serving */}
				<div className='grid grid-cols-4 gap-2 py-2 border-t border-b border-gray-200 dark:border-gray-700'>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>ккал</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{dish.caloriesPerServing.toFixed(0)}
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>Б</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{dish.proteinsPerServing.toFixed(1)}
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>Ж</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{dish.fatsPerServing.toFixed(1)}
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>У</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{dish.carbsPerServing.toFixed(1)}
						</p>
					</div>
				</div>

				{/* Servings & Price */}
				<div className='space-y-1'>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-gray-600 dark:text-gray-400'>
							Порций: {dish.servings}
						</span>
						{dish.pricePerServing !== null && (
							<span className='font-semibold text-green-600 dark:text-green-400'>
								{dish.pricePerServing.toFixed(2)} ₽/порц
							</span>
						)}
					</div>
					{dish.totalPrice !== null && (
						<div className='text-xs text-gray-500 dark:text-gray-400 text-right'>
							Общая стоимость: {dish.totalPrice.toFixed(2)} ₽
						</div>
					)}
				</div>

				{/* Tags */}
				{dish.tags.length > 0 && (
					<div className='flex flex-wrap gap-1'>
						{dish.tags.slice(0, 3).map(dt => (
							<span
								key={dt.tag.id}
								className='text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded'
							>
								{dt.tag.name}
							</span>
						))}
						{dish.tags.length > 3 && (
							<span className='text-xs text-gray-500 dark:text-gray-400'>
								+{dish.tags.length - 3}
							</span>
						)}
					</div>
				)}

				{/* Actions */}
				<div className='flex gap-2 pt-2'>
					<button
						onClick={() => setIsModalOpen(true)}
						className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm'
					>
						<Eye className='w-4 h-4' />
						<span>Смотреть</span>
					</button>
					<button
						onClick={() => onDelete(dish.id)}
						className='flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm'
						title='Удалить'
					>
						<Trash2 className='w-4 h-4' />
					</button>
				</div>
			</div>

			{/* Detail Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={dish.name}
			>
				<div className='space-y-4'>
					{/* Image */}
					{dish.photo && !imageError ? (
						<img
							src={dish.photo}
							alt={dish.name}
							className='w-full max-h-64 object-cover rounded-lg'
						/>
					) : (
						<div className='w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
							<ChefHat className='w-16 h-16 text-gray-400 dark:text-gray-500' />
						</div>
					)}

					{/* Description */}
					{dish.description && (
						<div>
							<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
								Описание
							</h4>
							<p className='text-gray-700 dark:text-gray-300'>
								{dish.description}
							</p>
						</div>
					)}

					{/* Basic Info */}
					<div className='grid grid-cols-2 gap-3'>
						{dish.mealType && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Тип приема пищи
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{MEAL_TYPE_NAMES[dish.mealType]}
								</p>
							</div>
						)}
						{dish.cuisineType && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Кухня
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{CUISINE_TYPE_NAMES[dish.cuisineType]}
								</p>
							</div>
						)}
						{dish.difficulty && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Сложность
								</span>
								<p className='font-medium text-gray-900 dark:text-white flex items-center gap-1'>
									<Star className='w-4 h-4' />
									{DIFFICULTY_LEVEL_NAMES[dish.difficulty]}
								</p>
							</div>
						)}
						{dish.cookingTimeMinutes && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Время приготовления
								</span>
								<p className='font-medium text-gray-900 dark:text-white flex items-center gap-1'>
									<Clock className='w-4 h-4' />
									{dish.cookingTimeMinutes} мин
								</p>
							</div>
						)}
						<div>
							<span className='text-sm text-gray-600 dark:text-gray-400'>
								Порций
							</span>
							<p className='font-medium text-gray-900 dark:text-white'>
								{dish.servings}
							</p>
						</div>
						{dish.pricePerServing !== null && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Цена за порцию
								</span>
								<p className='font-medium text-green-600 dark:text-green-400'>
									{dish.pricePerServing.toFixed(2)} ₽
								</p>
							</div>
						)}
						{dish.totalPrice !== null && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Общая стоимость
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{dish.totalPrice.toFixed(2)} ₽
								</p>
							</div>
						)}
					</div>

					{/* Nutrition Facts per serving */}
					<div>
						<h4 className='font-semibold text-gray-900 dark:text-white mb-3'>
							Пищевая ценность на порцию
						</h4>
						<div className='grid grid-cols-2 gap-3'>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Калории
								</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{dish.caloriesPerServing.toFixed(0)} ккал
								</p>
							</div>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Белки
								</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{dish.proteinsPerServing.toFixed(1)} г
								</p>
							</div>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>Жиры</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{dish.fatsPerServing.toFixed(1)} г
								</p>
							</div>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Углеводы
								</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{dish.carbsPerServing.toFixed(1)} г
								</p>
							</div>
						</div>
					</div>

					{/* Ingredients */}
					{dish.ingredients && dish.ingredients.length > 0 && (
						<div>
							<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
								Ингредиенты
							</h4>
							<ul className='space-y-1'>
								{dish.ingredients.map((ing, index) => (
									<li
										key={index}
										className='text-sm text-gray-700 dark:text-gray-300'
									>
										• {ing.product.name} - {ing.amount}г
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Recipe */}
					{dish.recipe && (
						<div>
							<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
								Рецепт приготовления
							</h4>
							<p className='text-gray-700 dark:text-gray-300 whitespace-pre-wrap'>
								{dish.recipe}
							</p>
						</div>
					)}

					{/* Tags */}
					{dish.tags.length > 0 && (
						<div>
							<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
								Теги
							</h4>
							<div className='flex flex-wrap gap-2'>
								{dish.tags.map(dt => (
									<span
										key={dt.tag.id}
										className='text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded'
									>
										{dt.tag.name}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Badges */}
					<div className='flex gap-2 items-center flex-wrap'>
						{dish.isVerified && (
							<span className='inline-flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded'>
								<CheckCircle className='w-4 h-4' />
								Проверено
							</span>
						)}
						{dish.source === 'USER' && (
							<span className='inline-flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded'>
								<User className='w-4 h-4' />
								Мое блюдо
							</span>
						)}
					</div>

					{/* Actions */}
					<div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<button
							onClick={() => {
								setIsModalOpen(false)
								onEdit(dish)
							}}
							className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
						>
							<Edit className='w-4 h-4' />
							<span>Изменить</span>
						</button>
						<button
							onClick={() => setIsModalOpen(false)}
							className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
						>
							Закрыть
						</button>
					</div>
				</div>
			</Modal>
		</div>
	)
}
