export const LoadingState = () => {
	return (
		<div className='flex items-center justify-center py-12'>
			<div className='flex items-center gap-3'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
				<span className='text-gray-600 dark:text-gray-400'>
					Загрузка данных...
				</span>
			</div>
		</div>
	)
}
