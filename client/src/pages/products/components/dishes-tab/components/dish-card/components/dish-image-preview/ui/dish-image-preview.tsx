import { Image as ImageIcon } from 'lucide-react'

interface DishImagePreviewProps {
	src: string | null
	name: string
}

export const DishImagePreview = ({ src, name }: DishImagePreviewProps) => {
	return (
		<div className='mb-3 h-40 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 flex items-center justify-center'>
			{src ? (
				<img
					src={src}
					alt={`Фото блюда ${name}`}
					className='h-full w-full object-cover'
					loading='lazy'
				/>
			) : (
				<div className='flex flex-col items-center text-gray-400 dark:text-gray-500'>
					<ImageIcon className='h-10 w-10' />
					<span className='mt-1 text-xs'>Фото недоступно</span>
				</div>
			)}
		</div>
	)
}
