import { useEffect, useState } from 'react'
import * as AdminAPI from '../../../api/services/admin'
import { Header } from '../../../components'
import {
	BrandsManagement,
	CategoriesTab,
	DishesTab,
	ProductsTab,
} from '../components'

export const ProductsPage = () => {
	const [activeTab, setActiveTab] = useState<
		'products' | 'dishes' | 'categories' | 'brands'
	>('products')
	const [isAdmin, setIsAdmin] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		checkUserRole()
	}, [])

	async function checkUserRole() {
		try {
			const response = await AdminAPI.checkRole()
			setIsAdmin(response.roleId === 'admin')
		} catch (error: any) {
			// Пользователь не админ или не авторизован
			console.log('Not an admin or auth error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<Header />

			<main className='container mx-auto px-4 py-6 sm:py-8'>
				<div className='max-w-7xl mx-auto'>
					{/* Заголовок страницы */}
					<div className='mb-6'>
						<h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
							База продуктов и блюд
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>
							Управление продуктами и готовыми блюдами с расчетом КБЖУ
						</p>
					</div>

					{/* Переключатель продукты/блюда/категории/бренды */}
					<div className='mb-6 overflow-x-auto'>
						<div className='inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 shadow-sm border border-gray-200 dark:border-gray-700 min-w-min'>
							<button
								onClick={() => setActiveTab('products')}
								className={`px-3 sm:px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
									activeTab === 'products'
										? 'bg-blue-600 text-white'
										: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
								}`}
							>
								Продукты
							</button>
							<button
								onClick={() => setActiveTab('dishes')}
								className={`px-3 sm:px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
									activeTab === 'dishes'
										? 'bg-blue-600 text-white'
										: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
								}`}
							>
								Блюда
							</button>
							{!loading && isAdmin && (
								<>
									<button
										onClick={() => setActiveTab('categories')}
										className={`px-3 sm:px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
											activeTab === 'categories'
												? 'bg-blue-600 text-white'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
									>
										Категории
									</button>
									<button
										onClick={() => setActiveTab('brands')}
										className={`px-3 sm:px-6 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
											activeTab === 'brands'
												? 'bg-blue-600 text-white'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										}`}
									>
										Бренды
									</button>
								</>
							)}
						</div>
					</div>

					{/* Контент */}
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
						{activeTab === 'products' ? (
							<ProductsTab />
						) : activeTab === 'dishes' ? (
							<DishesTab />
						) : activeTab === 'brands' ? (
							<BrandsManagement isAdmin={isAdmin} />
						) : (
							<CategoriesTab isAdmin={isAdmin} />
						)}
					</div>
				</div>
			</main>
		</div>
	)
}
