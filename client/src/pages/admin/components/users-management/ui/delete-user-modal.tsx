import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import * as AdminAPI from '../../../../../api/services/admin.ts'
import type { AdminUser } from '../../../../../api/types/admin.ts'
import { Input, Modal, useToast } from '../../../../../components/index.ts'

interface DeleteUserModalProps {
	user: AdminUser
	isOpen: boolean
	onClose: () => void
}

export function DeleteUserModal({
	user,
	isOpen,
	onClose,
}: DeleteUserModalProps) {
	const [confirmEmail, setConfirmEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const { showToast } = useToast()

	async function handleDelete(e: React.FormEvent) {
		e.preventDefault()

		if (confirmEmail !== user.email) {
			showToast('Email не совпадает', 'error')
			return
		}

		try {
			setLoading(true)
			await AdminAPI.deleteUser(user.id)
			showToast('Пользователь успешно удален', 'success')
			onClose()
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось удалить пользователя',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	function handleClose() {
		setConfirmEmail('')
		onClose()
	}

	const isEmailMatch = confirmEmail === user.email

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title='Удалить пользователя'>
			<form onSubmit={handleDelete} className='space-y-4'>
				<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4'>
					<div className='flex items-start gap-3'>
						<AlertTriangle className='w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
						<div className='space-y-2'>
							<p className='font-semibold text-red-900 dark:text-red-100'>
								Внимание! Это действие необратимо
							</p>
							<p className='text-sm text-red-800 dark:text-red-200'>
								Будут удалены все данные пользователя:
							</p>
							<ul className='text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1'>
								<li>Все записи веса ({user._count.weights})</li>
								<li>Все цели ({user._count.goals})</li>
								<li>Планы питания и другие данные</li>
							</ul>
						</div>
					</div>
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Email пользователя для удаления
					</label>
					<input
						type='text'
						value={user.email}
						disabled
						className='
							w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
							bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white
							cursor-not-allowed mb-3
						'
					/>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Для подтверждения введите email пользователя
					</label>
					<Input
						type='email'
						value={confirmEmail}
						onChange={e => setConfirmEmail(e.target.value)}
						placeholder='Введите email для подтверждения'
						required
					/>
				</div>

				<div className='flex gap-3 pt-4'>
					<button
						type='button'
						onClick={handleClose}
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
						disabled={loading || !isEmailMatch}
						className='
							flex-1 px-4 py-2 bg-red-600 text-white rounded-md
							hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
							transition-colors font-semibold
						'
					>
						{loading ? 'Удаление...' : 'Удалить пользователя'}
					</button>
				</div>
			</form>
		</Modal>
	)
}
