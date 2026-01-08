import { Eye, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { AdminUser } from '../../../../../api/types/admin.ts'
import { ChangeRoleModal } from './change-role-modal.tsx'
import { DeleteUserModal } from './delete-user-modal.tsx'
import { UserDetailModal } from './user-detail-modal.tsx'

interface UsersTableProps {
	users: AdminUser[]
	onUserUpdate: () => void
}

export function UsersTable({ users, onUserUpdate }: UsersTableProps) {
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [roleModalOpen, setRoleModalOpen] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)

	function handleViewDetails(user: AdminUser) {
		setSelectedUser(user)
		setDetailModalOpen(true)
	}

	function handleChangeRole(user: AdminUser) {
		setSelectedUser(user)
		setRoleModalOpen(true)
	}

	function handleDelete(user: AdminUser) {
		setSelectedUser(user)
		setDeleteModalOpen(true)
	}

	function handleModalClose() {
		setSelectedUser(null)
		setDetailModalOpen(false)
		setRoleModalOpen(false)
		setDeleteModalOpen(false)
		onUserUpdate()
	}

	return (
		<>
			<div className='overflow-x-auto -mx-3 sm:mx-0'>
				<div className='inline-block min-w-full align-middle'>
					<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
						<thead className='bg-gray-50 dark:bg-gray-700'>
							<tr>
								<th className='px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
									Email
								</th>
								<th className='px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
									Роль
								</th>
								<th className='hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
									Дата регистрации
								</th>
								<th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
									Записей веса
								</th>
								<th className='hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
									Целей
								</th>
								<th className='px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
									Действия
								</th>
							</tr>
						</thead>
						<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
							{users.map(user => (
								<tr
									key={user.id}
									className='hover:bg-gray-50 dark:hover:bg-gray-700'
								>
									<td className='px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-900 dark:text-white break-all'>
										{user.email}
									</td>
									<td className='px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm'>
										<span
											className={`
												px-2 py-1 rounded-full text-xs font-medium
												${
													user.roleId === 'admin'
														? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
														: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
												}
											`}
										>
											{user.role.name}
										</span>
									</td>
									<td className='hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
										{new Date(user.createdAt).toLocaleDateString('ru-RU')}
									</td>
									<td className='hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
										{user._count.weights}
									</td>
									<td className='hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
										{user._count.goals}
									</td>
									<td className='px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium'>
										<div className='flex justify-end gap-1 sm:gap-2'>
											<button
												onClick={() => handleViewDetails(user)}
												className='text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1'
												title='Просмотр'
											>
												<Eye className='w-4 h-4 sm:w-5 sm:h-5' />
											</button>
											<button
												onClick={() => handleChangeRole(user)}
												className='text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-1'
												title='Изменить роль'
											>
												<ShieldCheck className='w-4 h-4 sm:w-5 sm:h-5' />
											</button>
											<button
												onClick={() => handleDelete(user)}
												className='text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1'
												title='Удалить'
											>
												<Trash2 className='w-4 h-4 sm:w-5 sm:h-5' />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{users.length === 0 && (
						<div className='text-center py-12 text-gray-500 dark:text-gray-400'>
							Пользователи не найдены
						</div>
					)}
				</div>
			</div>

			{/* Модальные окна */}
			{selectedUser && (
				<>
					<UserDetailModal
						userId={selectedUser.id}
						isOpen={detailModalOpen}
						onClose={handleModalClose}
					/>
					<ChangeRoleModal
						user={selectedUser}
						isOpen={roleModalOpen}
						onClose={handleModalClose}
					/>
					<DeleteUserModal
						user={selectedUser}
						isOpen={deleteModalOpen}
						onClose={handleModalClose}
					/>
				</>
			)}
		</>
	)
}
