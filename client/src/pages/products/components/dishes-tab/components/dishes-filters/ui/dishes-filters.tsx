import { Input } from '../../../../../../../components'

type FilterTab = 'all' | 'ready' | 'draft' | 'archived'

interface DishesFiltersProps {
	search: string
	onSearchChange: (value: string) => void
	activeTab: FilterTab
	onTabChange: (tab: FilterTab) => void
	counts: {
		all: number
		ready: number
		draft: number
		archived: number
	}
}

export const DishesFilters = ({
	search,
	onSearchChange,
	activeTab,
	onTabChange,
	counts,
}: DishesFiltersProps) => {
	return (
		<div className='space-y-4'>
			{/* Поиск */}
			<SearchInput value={search} onChange={onSearchChange} />

			{/* Табы фильтров */}
			<FilterTabs
				activeTab={activeTab}
				onTabChange={onTabChange}
				counts={counts}
			/>
		</div>
	)
}

// Подкомпонент для поиска
const SearchInput = ({
	value,
	onChange,
}: {
	value: string
	onChange: (value: string) => void
}) => {
	return (
		<div className='relative'>
			<Input
				type='text'
				placeholder='Поиск блюд...'
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					onChange(e.target.value)
				}
				className='pl-10'
			/>
			<svg
				className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500'
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth={2}
					d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
				/>
			</svg>
		</div>
	)
}

// Подкомпонент для табов
const FilterTabs = ({
	activeTab,
	onTabChange,
	counts,
}: {
	activeTab: FilterTab
	onTabChange: (tab: FilterTab) => void
	counts: DishesFiltersProps['counts']
}) => {
	const tabs: { key: FilterTab; label: string; count: number }[] = [
		{ key: 'all', label: 'Все', count: counts.all },
		{ key: 'ready', label: 'Готовые', count: counts.ready },
		{ key: 'draft', label: 'Черновики', count: counts.draft },
		{ key: 'archived', label: 'Архив', count: counts.archived },
	]

	return (
		<div className='flex flex-wrap gap-2'>
			{tabs.map(tab => (
				<button
					key={tab.key}
					onClick={() => onTabChange(tab.key)}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
						activeTab === tab.key
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
					}`}
				>
					<span>{tab.label}</span>
					<span
						className={`px-1.5 py-0.5 text-xs rounded-full min-w-5 text-center ${
							activeTab === tab.key
								? 'bg-white/20 text-white'
								: 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
						}`}
					>
						{tab.count}
					</span>
				</button>
			))}
		</div>
	)
}

export type { FilterTab }
