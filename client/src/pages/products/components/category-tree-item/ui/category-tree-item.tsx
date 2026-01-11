import { ChevronDown, ChevronRight, Image, Pencil, Trash2 } from 'lucide-react'
import React from 'react'
import type { CategoryTreeNode } from '../../../../../api/types/categories'

interface CategoryTreeItemProps {
	category: CategoryTreeNode
	level: number
	isExpanded: boolean
	onToggle: () => void
	onEdit: (category: CategoryTreeNode) => void
	onDelete: (category: CategoryTreeNode) => void
	onManagePhotos: (category: CategoryTreeNode) => void
	expandedCategories?: Set<string>
	onToggleExpand?: (categoryId: string) => void
}

export const CategoryTreeItem = ({
	category,
	level,
	isExpanded,
	onToggle,
	onEdit,
	onDelete,
	onManagePhotos,
	expandedCategories,
	onToggleExpand,
}: CategoryTreeItemProps) => {
	const hasChildren = category.children && category.children.length > 0
	const indent = level * 24

	return (
		<div>
			{/* Сама категория */}
			<div
				className='flex items-center gap-3 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50'
				style={{ paddingLeft: `${indent + 16}px` }}
			>
				{/* Кнопка раскрытия */}
				<button
					onClick={onToggle}
					className='shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
					disabled={!hasChildren}
				>
					{hasChildren ? (
						isExpanded ? (
							<ChevronDown className='w-4 h-4' />
						) : (
							<ChevronRight className='w-4 h-4' />
						)
					) : (
						<span className='w-4 h-4' />
					)}
				</button>

				{/* Миниатюра фото */}
				<div className='shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700'>
					{category.photos && category.photos.length > 0 ? (
						<img
							src={category.photos[0]}
							alt={category.name}
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center'>
							<Image className='w-6 h-6 text-gray-400 dark:text-gray-500' />
						</div>
					)}
				</div>

				{/* Информация о категории */}
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 mb-1'>
						<h3 className='font-medium text-gray-900 dark:text-white truncate'>
							{category.name}
						</h3>
						<span
							className={`text-xs px-2 py-0.5 rounded ${
								category.isActive
									? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
									: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
							}`}
						>
							{category.isActive ? 'Активна' : 'Неактивна'}
						</span>
					</div>
					<div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
						<span className='truncate'>/{category.slug}</span>
						{category._count && (
							<>
								{category._count.children > 0 && (
									<span className='flex items-center gap-1'>
										👶 {category._count.children}
									</span>
								)}
								{category._count.productsGlobal > 0 && (
									<span className='flex items-center gap-1'>
										🌍 {category._count.productsGlobal}
									</span>
								)}
								{category._count.productsUser > 0 && (
									<span className='flex items-center gap-1'>
										👤 {category._count.productsUser}
									</span>
								)}
							</>
						)}
					</div>
				</div>

				{/* Действия */}
				<div className='flex items-center gap-1 shrink-0'>
					<button
						onClick={() => onManagePhotos(category)}
						className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
						title='Управление фото'
					>
						<Image className='w-4 h-4' />
					</button>
					<button
						onClick={() => onEdit(category)}
						className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
						title='Редактировать'
					>
						<Pencil className='w-4 h-4' />
					</button>
					<button
						onClick={() => onDelete(category)}
						className='p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
						title='Удалить'
					>
						<Trash2 className='w-4 h-4' />
					</button>
				</div>
			</div>

			{/* Дочерние категории */}
			{hasChildren && isExpanded && (
				<div>
					{category.children.map((child: CategoryTreeNode) => (
						<CategoryTreeItemContainer
							key={child.id}
							category={child}
							level={level + 1}
							onEdit={onEdit}
							onDelete={onDelete}
							onManagePhotos={onManagePhotos}
							expandedCategories={expandedCategories}
							onToggleExpand={onToggleExpand}
						/>
					))}
				</div>
			)}
		</div>
	)
}

// Контейнер с состоянием для рекурсии
interface CategoryTreeItemContainerProps {
	category: CategoryTreeNode
	level: number
	onEdit: (category: CategoryTreeNode) => void
	onDelete: (category: CategoryTreeNode) => void
	onManagePhotos: (category: CategoryTreeNode) => void
	expandedCategories?: Set<string>
	onToggleExpand?: (categoryId: string) => void
}

export const CategoryTreeItemContainer = ({
	category,
	level,
	onEdit,
	onDelete,
	onManagePhotos,
	expandedCategories,
	onToggleExpand,
}: CategoryTreeItemContainerProps) => {
	const [isExpanded, setIsExpanded] = React.useState(false)

	const handleToggle = () => {
		if (onToggleExpand) {
			onToggleExpand(category.id)
		} else {
			setIsExpanded(!isExpanded)
		}
	}

	const expanded = expandedCategories
		? expandedCategories.has(category.id)
		: isExpanded

	return (
		<CategoryTreeItem
			category={category}
			level={level}
			isExpanded={expanded}
			onToggle={handleToggle}
			onEdit={onEdit}
			onDelete={onDelete}
			onManagePhotos={onManagePhotos}
		/>
	)
}
