export const DishesTab = () => {
	return (
		<div className='text-center py-12'>
			<div className='text-gray-400 dark:text-gray-500 mb-4'>
				<svg
					className='mx-auto h-12 w-12'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 6v6m0 0v6m0-6h6m-6 0H6'
					/>
				</svg>
			</div>
			<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
				Список блюд
			</h3>
			<p className='text-gray-600 dark:text-gray-400'>
				Здесь будет список готовых блюд с возможностью создания рецептов
			</p>
		</div>
	)
}
