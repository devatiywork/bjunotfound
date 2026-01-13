import { type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
}

export const Textarea = ({
	label,
	error,
	className = '',
	...props
}: TextareaProps) => {
	return (
		<div className='w-full'>
			{label && (
				<label
					htmlFor={props.id}
					className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
				>
					{label}
				</label>
			)}
			<textarea
				{...props}
				className={`w-full px-4 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:placeholder-gray-400 ${className}`}
			/>
			{error && (
				<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{error}</p>
			)}
		</div>
	)
}
