import { Shield, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as AdminAPI from '../../../api/services/admin'
import { Header, Tabs, type Tab } from '../../../components/index.ts'
import { AdminPage } from '../../admin/index.ts'
import {
	ProfileEditSection,
	WeightHistorySection,
} from '../components/index.ts'

export const ProfilePage = () => {
	const [isAdmin, setIsAdmin] = useState(false)
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState('profile')

	useEffect(() => {
		document.title = 'Профиль | BjuNotFound'
	}, [])

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

	// Для обычных пользователей - старый интерфейс без табов
	if (!loading && !isAdmin) {
		return (
			<div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
				<Header />

				<main className='container mx-auto flex-1 px-4 py-8'>
					{/* Page Title */}
					<div className='mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
							Профиль
						</h1>
						<p className='mt-2 text-gray-600 dark:text-gray-400'>
							Управляйте своими данными и отслеживайте прогресс
						</p>
					</div>

					{/* Widgets - колонка на мобильных, ряд на десктопе */}
					<div className='flex flex-col gap-6 lg:flex-row'>
						{/* Левая колонка - редактирование профиля */}
						<div className='flex-1'>
							<ProfileEditSection />
						</div>

						{/* Правая колонка - история веса */}
						<div className='flex-1'>
							<WeightHistorySection />
						</div>
					</div>
				</main>
			</div>
		)
	}

	// Для админов - интерфейс с табами
	const tabs: Tab[] = [
		{
			id: 'profile',
			label: 'Профиль',
			icon: <User />,
			content: (
				<div className='flex flex-col gap-6 lg:flex-row mt-6'>
					<div className='flex-1'>
						<ProfileEditSection />
					</div>
					<div className='flex-1'>
						<WeightHistorySection />
					</div>
				</div>
			),
		},
		{
			id: 'admin',
			label: 'Администрирование',
			icon: <Shield />,
			content: <AdminPage />,
		},
	]

	return (
		<div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
			<Header />

			<main className='container mx-auto flex-1 px-4 py-8'>
				{loading ? (
					<div className='flex justify-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
					</div>
				) : (
					<>
						<div className='mb-8'>
							<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
								Профиль
							</h1>
							<p className='mt-2 text-gray-600 dark:text-gray-400'>
								Управляйте своими данными и администрируйте систему
							</p>
						</div>

						<Tabs
							tabs={tabs}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
					</>
				)}
			</main>
		</div>
	)
}
