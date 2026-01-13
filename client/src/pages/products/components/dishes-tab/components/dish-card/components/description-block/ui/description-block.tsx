interface DescriptionBlockProps {
	description: string
}

export const DescriptionBlock = ({ description }: DescriptionBlockProps) => {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
				Описание
			</label>
			<div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4'>
				<p className='text-gray-900 dark:text-white leading-relaxed'>
					{description}
				</p>
			</div>
		</div>
	)
}
