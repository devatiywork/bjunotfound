import { Activity, Calendar, Target, TrendingUp, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as AdminAPI from '../../../../../api/services/admin.ts'
import type { AdminUserDetail } from '../../../../../api/types/admin.ts'
import { Modal, useToast } from '../../../../../components/index.ts'

interface UserDetailModalProps {
	userId: string
	isOpen: boolean
	onClose: () => void
}

export function UserDetailModal({
	userId,
	isOpen,
	onClose,
}: UserDetailModalProps) {
	const [user, setUser] = useState<AdminUserDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const { showToast } = useToast()

	useEffect(() => {
		if (isOpen && userId) {
			loadUserDetail()
		}
	}, [isOpen, userId])

	async function loadUserDetail() {
		try {
			setLoading(true)
			const data = await AdminAPI.getUserDetail(userId)
			setUser(data)
		} catch (error: any) {
			showToast(
				error.response?.data?.message ||
					'Не удалось загрузить данные пользователя',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title='Детальная информация о пользователе'
		>
			{loading || !user ? (
				<div className='flex justify-center py-8'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
				</div>
			) : (
				<div className='space-y-6'>
					{/* Основная информация */}
					<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3'>
						<h3 className='font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
							<User className='w-5 h-5' />
							Основная информация
						</h3>
						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>Email:</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{user.email}
								</p>
							</div>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>Роль:</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{user.role.name}
								</p>
							</div>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>Пол:</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{user.gender === 'MALE' ? 'Мужской' : 'Женский'}
								</p>
							</div>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>Рост:</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{user.height} см
								</p>
							</div>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>
									Дата рождения:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{new Date(user.birthDate).toLocaleDateString('ru-RU')}
								</p>
							</div>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>
									Регистрация:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{new Date(user.createdAt).toLocaleDateString('ru-RU')}
								</p>
							</div>
						</div>
					</div>

					{/* Настройки калорийности */}
					<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3'>
						<h3 className='font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
							<Activity className='w-5 h-5' />
							Настройки калорийности
						</h3>
						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>
									Формула:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{user.formulaType === 'MIFFLIN_ST_JEOR'
										? 'Миффлина-Сан Жеора'
										: 'Харриса-Бенедикта'}
								</p>
							</div>
							<div>
								<span className='text-gray-600 dark:text-gray-400'>
									Активность:
								</span>
								<p className='font-medium text-gray-900 dark:text-white'>
									{user.activityLevel.name}
								</p>
							</div>
						</div>
					</div>

					{/* Статистика */}
					<div className='grid grid-cols-3 gap-4'>
						<StatCard
							icon={<TrendingUp className='w-5 h-5' />}
							label='Записей веса'
							value={user._count.weights}
						/>
						<StatCard
							icon={<Target className='w-5 h-5' />}
							label='Целей'
							value={user._count.goals}
						/>
						<StatCard
							icon={<Calendar className='w-5 h-5' />}
							label='Планов питания'
							value={user._count.mealPlans}
						/>
					</div>

					{/* История веса (последние 5 записей) */}
					{user.weights.length > 0 && (
						<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3'>
							<h3 className='font-semibold text-gray-900 dark:text-white'>
								Последние записи веса
							</h3>
							<div className='space-y-2'>
								{user.weights.slice(0, 5).map(weight => (
									<div
										key={weight.id}
										className='flex justify-between text-sm bg-white dark:bg-gray-800 p-2 rounded'
									>
										<span className='text-gray-600 dark:text-gray-400'>
											{new Date(weight.date).toLocaleDateString('ru-RU')}
										</span>
										<span className='font-medium text-gray-900 dark:text-white'>
											{weight.weight} кг
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Активные цели */}
					{user.goals.filter(g => g.isActive).length > 0 && (
						<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3'>
							<h3 className='font-semibold text-gray-900 dark:text-white'>
								Активные цели
							</h3>
							<div className='space-y-2'>
								{user.goals
									.filter(g => g.isActive)
									.map(goal => (
										<div
											key={goal.id}
											className='bg-white dark:bg-gray-800 p-3 rounded space-y-1'
										>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600 dark:text-gray-400'>
													Целевой вес:
												</span>
												<span className='font-medium text-gray-900 dark:text-white'>
													{goal.targetWeight} кг
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600 dark:text-gray-400'>
													Целевые калории:
												</span>
												<span className='font-medium text-gray-900 dark:text-white'>
													{goal.targetCalories} ккал
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-600 dark:text-gray-400'>
													Период:
												</span>
												<span className='font-medium text-gray-900 dark:text-white'>
													{new Date(goal.startDate).toLocaleDateString('ru-RU')}{' '}
													- {new Date(goal.endDate).toLocaleDateString('ru-RU')}
												</span>
											</div>
										</div>
									))}
							</div>
						</div>
					)}
				</div>
			)}
		</Modal>
	)
}

interface StatCardProps {
	icon: React.ReactNode
	label: string
	value: number
}

function StatCard({ icon, label, value }: StatCardProps) {
	return (
		<div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center'>
			<div className='flex justify-center text-blue-600 dark:text-blue-400 mb-1'>
				{icon}
			</div>
			<p className='text-2xl font-bold text-gray-900 dark:text-white'>
				{value}
			</p>
			<p className='text-xs text-gray-600 dark:text-gray-400'>{label}</p>
		</div>
	)
}
