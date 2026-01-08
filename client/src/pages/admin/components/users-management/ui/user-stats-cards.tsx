import { Shield, User, Users as UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as AdminAPI from '../../../../../api/services/admin.ts'
import type { UserStatsResponse } from '../../../../../api/types/admin.ts'

export function UserStatsCards() {
	const [stats, setStats] = useState<UserStatsResponse | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadStats()
	}, [])

	async function loadStats() {
		try {
			const data = await AdminAPI.getUserStats()
			setStats(data)
		} catch (error) {
			console.error('Failed to load stats:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading || !stats) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{[1, 2, 3].map(i => (
					<div
						key={i}
						className='bg-gray-100 dark:bg-gray-700 rounded-lg h-24 animate-pulse'
					/>
				))}
			</div>
		)
	}

	const adminCount =
		stats.usersByRole.find(r => r.roleId === 'admin')?._count || 0
	const userCount =
		stats.usersByRole.find(r => r.roleId === 'user')?._count || 0

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
			<StatCard
				icon={<UsersIcon className='w-5 h-5 sm:w-6 sm:h-6' />}
				label='Всего пользователей'
				value={stats.totalUsers}
				color='blue'
			/>
			<StatCard
				icon={<Shield className='w-5 h-5 sm:w-6 sm:h-6' />}
				label='Администраторов'
				value={adminCount}
				color='purple'
			/>
			<StatCard
				icon={<User className='w-5 h-5 sm:w-6 sm:h-6' />}
				label='Обычных пользователей'
				value={userCount}
				color='green'
			/>
		</div>
	)
}

interface StatCardProps {
	icon: React.ReactNode
	label: string
	value: number
	color: 'blue' | 'purple' | 'green'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
	const colors = {
		blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
		purple:
			'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
		green:
			'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700'>
			<div className='flex items-center gap-3 sm:gap-4'>
				<div className={`p-2 sm:p-3 rounded-lg ${colors[color]}`}>{icon}</div>
				<div>
					<p className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
						{label}
					</p>
					<p className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
						{value}
					</p>
				</div>
			</div>
		</div>
	)
}
