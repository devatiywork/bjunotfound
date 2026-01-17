import { Package, Settings as SettingsIcon, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Tabs, type Tab } from '../../../components'
import { ProductsManagement } from '../components/products-management'
import { SystemSettings } from '../components/system-settings'
import { UsersManagement } from '../components/users-management'

export function AdminPage() {
	const [activeTab, setActiveTab] = useState('users')

	useEffect(() => {
		document.title = 'Админ-панель | TimeNoFat'
	}, [])

	const tabs: Tab[] = [
		{
			id: 'users',
			label: 'Управление пользователями',
			icon: <Users />,
			content: <UsersManagement />,
		},
		{
			id: 'products',
			label: 'Управление продуктами',
			icon: <Package />,
			content: <ProductsManagement />,
		},
		{
			id: 'settings',
			label: 'Настройки системы',
			icon: <SettingsIcon />,
			content: <SystemSettings />,
		},
	]

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8'>
			<div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-8'>
				<div className='mb-4 sm:mb-8'>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
						Административная панель
					</h1>
					<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
						Управление пользователями, ролями и настройками системы
					</p>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6'>
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
				</div>
			</div>
		</div>
	)
}
