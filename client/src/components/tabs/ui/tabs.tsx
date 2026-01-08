import { cloneElement, type ReactElement, type ReactNode } from 'react'

export interface Tab {
	id: string
	label: string
	content: ReactNode
	icon?: ReactNode
}

export interface TabsProps {
	tabs: Tab[]
	activeTab: string
	onTabChange: (tabId: string) => void
	className?: string
}

export function Tabs({
	tabs,
	activeTab,
	onTabChange,
	className = '',
}: TabsProps) {
	return (
		<div className={`w-full ${className}`}>
			{/* Заголовки табов */}
			<div className='border-b border-gray-200 dark:border-gray-700'>
				<nav
					className='flex -mb-px space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide'
					aria-label='Tabs'
				>
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`
								whitespace-nowrap py-4 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm sm:text-sm
								flex items-center gap-2 sm:gap-2 transition-colors
								${
									activeTab === tab.id
										? 'border-blue-500 text-blue-600 dark:text-blue-400'
										: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
								}
							`}
							aria-current={activeTab === tab.id ? 'page' : undefined}
						>
							{tab.icon &&
								cloneElement(
									tab.icon as ReactElement,
									{
										className: 'w-5 h-5 sm:w-5 sm:h-5',
									} as any
								)}
							<span className='hidden sm:inline'>{tab.label}</span>
							<span className='sm:hidden'>{tab.label.split(' ')[0]}</span>
						</button>
					))}
				</nav>
			</div>

			{/* Контент активного таба */}
			<div className='mt-4 sm:mt-6'>
				{tabs.find(tab => tab.id === activeTab)?.content}
			</div>
		</div>
	)
}
