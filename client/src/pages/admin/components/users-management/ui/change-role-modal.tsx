import { useEffect, useState } from 'react'
import * as AdminAPI from '../../../../../api/services/admin.ts'
import type {
	AdminUser,
	RoleWithCount,
} from '../../../../../api/types/admin.ts'
import { Modal, Select, useToast } from '../../../../../components/index.ts'

interface ChangeRoleModalProps {
	user: AdminUser
	isOpen: boolean
	onClose: () => void
}

export function ChangeRoleModal({
	user,
	isOpen,
	onClose,
}: ChangeRoleModalProps) {
	const [roles, setRoles] = useState<RoleWithCount[]>([])
	const [selectedRoleId, setSelectedRoleId] = useState(user.roleId)
	const [loading, setLoading] = useState(false)
	const { showToast } = useToast()

	useEffect(() => {
		if (isOpen) {
			loadRoles()
			setSelectedRoleId(user.roleId)
		}
	}, [isOpen, user.roleId])

	async function loadRoles() {
		try {
			const data = await AdminAPI.getRoles()
			setRoles(data)
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось загрузить роли',
				'error'
			)
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (selectedRoleId === user.roleId) {
			showToast('Выберите новую роль', 'warning')
			return
		}

		try {
			setLoading(true)
			await AdminAPI.updateUserRole(user.id, { roleId: selectedRoleId })
			showToast('Роль пользователя успешно изменена', 'success')
			onClose()
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось изменить роль',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	const selectedRole = roles.find(r => r.id === selectedRoleId)
	const isDowngrade = user.roleId === 'admin' && selectedRoleId !== 'admin'

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='Изменить роль пользователя'>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Email пользователя
					</label>
					<input
						type='text'
						value={user.email}
						disabled
						className='
							w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
							bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white
							cursor-not-allowed
						'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Текущая роль
					</label>
					<input
						type='text'
						value={user.role.name}
						disabled
						className='
							w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
							bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white
							cursor-not-allowed
						'
					/>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Новая роль
					</label>
					<Select
						value={selectedRoleId}
						onChange={setSelectedRoleId}
						options={roles.map(role => ({
							value: role.id,
							label: `${role.name} (${role._count.users} пользователей)`,
						}))}
						required
					/>
					{selectedRole?.description && (
						<p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
							{selectedRole.description}
						</p>
					)}
				</div>

				{isDowngrade && (
					<div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3'>
						<p className='text-sm text-yellow-800 dark:text-yellow-300'>
							⚠️ Вы понижаете администратора до обычного пользователя. Это
							действие удалит все административные права.
						</p>
					</div>
				)}

				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={onClose}
						className='
							flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600
							text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700
							rounded-md hover:bg-gray-50 dark:hover:bg-gray-600
							transition-colors
						'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={loading || selectedRoleId === user.roleId}
						className='
							flex-1 px-4 py-2 bg-blue-600 text-white rounded-md
							hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
							transition-colors
						'
					>
						{loading ? 'Сохранение...' : 'Изменить роль'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
