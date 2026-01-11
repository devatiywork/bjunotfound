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
			<div className='border-b border-gray-200 dark:border-gray-700 overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6'>
				<nav className='flex -mb-px gap-1' aria-label='Tabs'>
					{tabs.map(tab => (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`
								whitespace-nowrap py-3 px-2.5 sm:py-4 sm:px-4 border-b-2 font-medium text-xs sm:text-sm
								flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0
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
										className: 'w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0',
									} as any
								)}
							<span>{tab.label}</span>
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
