import { BarChart3 } from 'lucide-react'
import { useEffect } from 'react'
import { Header } from '../../../components/index.ts'
import { WeekCalendar } from '../components/index.ts'

export const NutritionChartPage = () => {
	useEffect(() => {
		document.title = 'График питания | TimeNoFat'
	}, [])

	return (
		<div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
			<Header />

			<main className='flex-1 px-4 py-4'>
				<div className='max-w-[1600px] mx-auto'>
					<div className='flex items-center gap-3 mb-4'>
						<BarChart3 className='w-8 h-8 text-green-600 dark:text-green-400' />
						<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
							График питания
						</h1>
					</div>

					<WeekCalendar />
				</div>
			</main>
		</div>
	)
}
