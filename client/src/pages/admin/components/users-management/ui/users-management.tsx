import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AdminUser, Pagination } from '../../../../../api/index.ts'
import * as AdminAPI from '../../../../../api/services/admin.ts'
import { useToast } from '../../../../../components/index.ts'
import { UserStatsCards } from './user-stats-cards.tsx'
import { UsersTable } from './users-table.tsx'

export function UsersManagement() {
	const [users, setUsers] = useState<AdminUser[]>([])
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0,
	})
	const [loading, setLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const { showToast } = useToast()

	useEffect(() => {
		loadUsers()
	}, [pagination.page])

	async function loadUsers() {
		try {
			setLoading(true)
			const response = await AdminAPI.getUsers(
				pagination.page,
				pagination.limit
			)
			setUsers(response.users)
			setPagination(response.pagination)
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось загрузить пользователей',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	const filteredUsers = users.filter(user =>
		user.email.toLowerCase().includes(searchQuery.toLowerCase())
	)

	function handlePageChange(newPage: number) {
		setPagination((prev: Pagination) => ({ ...prev, page: newPage }))
	}

	return (
		<div className='space-y-4 sm:space-y-6'>
			{/* Статистика */}
			<UserStatsCards />

			{/* Поиск */}
			<div className='relative'>
				<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
					<Search className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
				</div>
				<input
					type='text'
					placeholder='Поиск по email...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className='
						block w-full pl-9 sm:pl-10 pr-3 py-2 text-sm sm:text-base
						border border-gray-300 dark:border-gray-600
						rounded-md leading-5 bg-white dark:bg-gray-700
						text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
						focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
					'
				/>
			</div>

			{/* Таблица пользователей */}
			{loading ? (
				<div className='flex justify-center items-center py-12'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
				</div>
			) : (
				<>
					<UsersTable users={filteredUsers} onUserUpdate={loadUsers} />

					{/* Пагинация */}
					{pagination.totalPages > 1 && (
						<div className='flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0'>
							<div className='text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left'>
								Показано {(pagination.page - 1) * pagination.limit + 1} -{' '}
								{Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
								из {pagination.total}
							</div>
							<div className='flex gap-2'>
								<button
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={pagination.page === 1}
									className='
										px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
										bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
										disabled:opacity-50 disabled:cursor-not-allowed
										hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
									'
								>
									<ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5' />
								</button>
								<button
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={pagination.page === pagination.totalPages}
									className='
										px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
										bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
										disabled:opacity-50 disabled:cursor-not-allowed
										hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
									'
								>
									<ChevronRight className='w-4 h-4 sm:w-5 sm:h-5' />
								</button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)
}
