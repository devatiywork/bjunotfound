import { CheckCircle, Edit, Eye, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../../../../../api'
import { Modal } from '../../../../../components'

interface ProductCardProps {
	product: Product
	onEdit: (product: Product) => void
	onDelete: (id: string) => void
}

export default function ProductCard({
	product,
	onEdit,
	onDelete,
}: ProductCardProps) {
	const [imageLoading, setImageLoading] = useState(true)
	const [imageError, setImageError] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const unitLabels = {
		G: 'г',
		ML: 'мл',
		PIECE: 'шт',
		PORTION: 'порц',
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4'>
			{/* Header with image/icon */}
			<div className='relative mb-3'>
				{product.photo && !imageError ? (
					<div className='relative w-full h-40'>
						{imageLoading && (
							<div className='absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400' />
							</div>
						)}
						<img
							src={product.photo}
							alt={product.name}
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
						<span className='text-4xl text-gray-400 dark:text-gray-500'>
							🍽️
						</span>
					</div>
				)}

				{/* Verified Badge */}
				{product.isVerified && (
					<div className='absolute top-2 right-2 bg-green-500 text-white rounded-full p-1'>
						<CheckCircle className='w-4 h-4' />
					</div>
				)}
			</div>

			{/* Product Info */}
			<div className='space-y-2'>
				<div>
					<h3 className='font-semibold text-gray-900 dark:text-white text-lg line-clamp-1'>
						{product.name}
					</h3>
					{product.brand && (
						<p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-1'>
							{product.brand}
						</p>
					)}
				</div>

				{/* Category */}
				<div className='flex items-center gap-2'>
					<span className='text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded'>
						{product.category.name}
					</span>
					{product.source === 'USER' && (
						<span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded flex items-center gap-1'>
							<User className='w-3 h-3' />
							Мой
						</span>
					)}
				</div>

				{/* Nutrition Info */}
				<div className='grid grid-cols-4 gap-2 py-2 border-t border-b border-gray-200 dark:border-gray-700'>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>ккал</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{product.calories}
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>Б</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{product.proteins}
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>Ж</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{product.fats}
						</p>
					</div>
					<div className='text-center'>
						<p className='text-xs text-gray-500 dark:text-gray-400'>У</p>
						<p className='font-semibold text-gray-900 dark:text-white'>
							{product.carbs}
						</p>
					</div>
				</div>

				{/* Serving Size & Price */}
				<div className='flex items-center justify-between text-sm'>
					{product.servingSize && (
						<span className='text-gray-600 dark:text-gray-400'>
							{product.servingSize} {unitLabels[product.unit]}
						</span>
					)}
					{product.price && (
						<span className='font-semibold text-gray-900 dark:text-white'>
							{product.price.toFixed(2)} ₽
						</span>
					)}
				</div>

				{/* Tags */}
				{product.tags.length > 0 && (
					<div className='flex flex-wrap gap-1'>
						{product.tags.slice(0, 3).map(pt => (
							<span
								key={pt.tag.id}
								className='text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded'
							>
								{pt.tag.name}
							</span>
						))}
						{product.tags.length > 3 && (
							<span className='text-xs text-gray-500 dark:text-gray-400'>
								+{product.tags.length - 3}
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
						onClick={() => onDelete(product.id)}
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
				title={product.name}
			>
				<div className='space-y-4'>
					{/* Image */}
					{product.photo && !imageError ? (
						<img
							src={product.photo}
							alt={product.name}
							className='w-full max-h-64 object-cover rounded-lg'
						/>
					) : (
						<div className='w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
							<span className='text-6xl'>🍽️</span>
						</div>
					)}

					{/* Basic Info */}
					<div className='space-y-2'>
						{product.brand && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Бренд:{' '}
								</span>
								<span className='text-sm font-medium text-gray-900 dark:text-white'>
									{product.brand}
								</span>
							</div>
						)}
						<div>
							<span className='text-sm text-gray-600 dark:text-gray-400'>
								Категория:{' '}
							</span>
							<span className='text-sm font-medium text-gray-900 dark:text-white'>
								{product.category.name}
							</span>
						</div>
						{product.servingSize && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Размер порции:{' '}
								</span>
								<span className='text-sm font-medium text-gray-900 dark:text-white'>
									{product.servingSize} {unitLabels[product.unit]}
								</span>
							</div>
						)}
						{product.price && (
							<div>
								<span className='text-sm text-gray-600 dark:text-gray-400'>
									Цена:{' '}
								</span>
								<span className='text-sm font-medium text-gray-900 dark:text-white'>
									{product.price.toFixed(2)} ₽
								</span>
							</div>
						)}
					</div>

					{/* Nutrition Facts */}
					<div>
						<h4 className='font-semibold text-gray-900 dark:text-white mb-3'>
							Пищевая ценность на 100{unitLabels[product.unit]}
						</h4>
						<div className='grid grid-cols-2 gap-3'>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Калории
								</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{product.calories} ккал
								</p>
							</div>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Белки
								</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{product.proteins} г
								</p>
							</div>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>Жиры</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{product.fats} г
								</p>
							</div>
							<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
								<p className='text-sm text-gray-600 dark:text-gray-400'>
									Углеводы
								</p>
								<p className='text-lg font-bold text-gray-900 dark:text-white'>
									{product.carbs} г
								</p>
							</div>
						</div>
					</div>

					{/* Tags */}
					{product.tags.length > 0 && (
						<div>
							<h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
								Теги
							</h4>
							<div className='flex flex-wrap gap-2'>
								{product.tags.map(pt => (
									<span
										key={pt.tag.id}
										className='text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded'
									>
										{pt.tag.name}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Badges */}
					<div className='flex gap-2 items-center'>
						{product.isVerified && (
							<span className='inline-flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded'>
								<CheckCircle className='w-4 h-4' />
								Проверено
							</span>
						)}
						{product.source === 'USER' && (
							<span className='inline-flex items-center gap-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded'>
								<User className='w-4 h-4' />
								Мой продукт
							</span>
						)}
					</div>

					{/* Actions */}
					<div className='flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<button
							onClick={() => {
								setIsModalOpen(false)
								onEdit(product)
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
