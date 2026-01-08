import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SelectOption {
	value: string
	label: string
}

interface SelectProps {
	label?: string
	error?: string
	options: SelectOption[]
	value?: string
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	searchable?: boolean
	className?: string
	id?: string
	required?: boolean
}

export const Select = ({
	label,
	error,
	options,
	value,
	onChange,
	placeholder = 'Выберите опцию',
	disabled = false,
	searchable = false,
	className = '',
	id,
	required = false,
}: SelectProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [openUpward, setOpenUpward] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Фильтрация опций по поисковому запросу
	const filteredOptions = searchable
		? options.filter(option =>
				option.label.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: options

	// Найти выбранную опцию
	const selectedOption = options.find(option => option.value === value)

	// Закрытие при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
				setSearchQuery('')
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Фокус на поиске при открытии
	useEffect(() => {
		if (isOpen && searchable && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [isOpen, searchable])

	// Определение направления открытия dropdown
	useEffect(() => {
		if (isOpen && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect()
			const spaceBelow = window.innerHeight - rect.bottom
			const spaceAbove = rect.top
			const dropdownHeight = 250 // Максимальная высота dropdown

			// Если внизу меньше места, чем вверху - открываем вверх
			if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
				setOpenUpward(true)
			} else {
				setOpenUpward(false)
			}
		}
	}, [isOpen])

	// Сброс подсветки при изменении фильтра
	useEffect(() => {
		setHighlightedIndex(-1)
	}, [searchQuery])

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen)
			setSearchQuery('')
		}
	}

	const handleSelect = (selectedValue: string) => {
		onChange?.(selectedValue)
		setIsOpen(false)
		setSearchQuery('')
		setHighlightedIndex(-1)
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange?.('')
		setSearchQuery('')
	}

	// Клавиатурная навигация
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return

		switch (e.key) {
			case 'Enter':
				e.preventDefault()
				if (isOpen) {
					if (
						highlightedIndex >= 0 &&
						highlightedIndex < filteredOptions.length
					) {
						handleSelect(filteredOptions[highlightedIndex].value)
					}
				} else {
					setIsOpen(true)
				}
				break

			case 'ArrowDown':
				e.preventDefault()
				if (!isOpen) {
					setIsOpen(true)
				} else {
					setHighlightedIndex(prev =>
						prev < filteredOptions.length - 1 ? prev + 1 : prev
					)
				}
				break

			case 'ArrowUp':
				e.preventDefault()
				if (isOpen) {
					setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0))
				}
				break

			case 'Escape':
				e.preventDefault()
				setIsOpen(false)
				setSearchQuery('')
				break

			case 'Tab':
				if (isOpen) {
					setIsOpen(false)
					setSearchQuery('')
				}
				break
		}
	}

	return (
		<div className={`w-full ${className}`} ref={containerRef}>
			{/* Label */}
			{label && (
				<label
					htmlFor={id}
					className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
				>
					{label}
					{required && <span className='text-red-500 ml-1'>*</span>}
				</label>
			)}

			{/* Select Button */}
			<div className='relative'>
				<button
					type='button'
					id={id}
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					className={`
						w-full px-4 py-3 text-left text-sm font-medium rounded-lg
						border transition-all duration-200
						flex items-center justify-between gap-2
						${
							disabled
								? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800'
								: 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'
						}
						${
							isOpen
								? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/30'
								: 'border-gray-300 dark:border-gray-600'
						}
						${error ? 'border-red-500 dark:border-red-500' : 'bg-white dark:bg-gray-700'}
						text-gray-900 dark:text-white
					`}
					aria-haspopup='listbox'
					aria-expanded={isOpen}
				>
					<span
						className={`flex-1 truncate ${
							!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''
						}`}
					>
						{selectedOption ? selectedOption.label : placeholder}
					</span>

					<div className='flex items-center gap-1'>
						{selectedOption && !disabled && (
							<X
								className='w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
								onClick={handleClear}
							/>
						)}
						<ChevronDown
							className={`w-5 h-5 text-gray-400 transition-transform duration-75 ${
								isOpen ? 'rotate-180' : ''
							}`}
						/>
					</div>
				</button>

				{/* Dropdown */}
				{isOpen && (
					<div
						ref={dropdownRef}
						className={`absolute z-50 w-full
							${openUpward ? 'bottom-full mb-2' : 'top-full mt-2'}
							bg-white dark:bg-gray-800
							border border-gray-200 dark:border-gray-700
							rounded-lg shadow-lg
							max-h-60 overflow-hidden
							transition-opacity duration-75`}
						role='listbox'
					>
						{/* Search Input */}
						{searchable && (
							<div className='p-2 border-b border-gray-200 dark:border-gray-700'>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
									<input
										ref={searchInputRef}
										type='text'
										value={searchQuery}
										onChange={e => setSearchQuery(e.target.value)}
										placeholder='Поиск...'
										className='
											w-full pl-9 pr-3 py-2 text-sm
											bg-gray-50 dark:bg-gray-700
											border border-gray-300 dark:border-gray-600
											rounded-md
											text-gray-900 dark:text-white
											placeholder-gray-500 dark:placeholder-gray-400
											focus:outline-none focus:ring-2 focus:ring-blue-500/20
										'
										onClick={e => e.stopPropagation()}
									/>
								</div>
							</div>
						)}

						{/* Options List */}
						<div className='overflow-y-auto max-h-48 py-1'>
							{filteredOptions.length === 0 ? (
								<div className='px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400'>
									Ничего не найдено
								</div>
							) : (
								filteredOptions.map((option, index) => {
									const isSelected = option.value === value
									const isHighlighted = index === highlightedIndex

									return (
										<button
											key={option.value}
											type='button'
											onClick={() => handleSelect(option.value)}
											onMouseEnter={() => setHighlightedIndex(index)}
											className={`
												w-full px-4 py-2.5 text-left text-sm
												flex items-center justify-between gap-2
												transition-colors duration-150
												${
													isHighlighted
														? 'bg-blue-50 dark:bg-blue-900/20'
														: 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
												}
												${
													isSelected
														? 'text-blue-600 dark:text-blue-400 font-medium'
														: 'text-gray-900 dark:text-white'
												}
											`}
											role='option'
											aria-selected={isSelected}
										>
											<span className='flex-1 truncate'>{option.label}</span>
											{isSelected && (
												<Check className='w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400' />
											)}
										</button>
									)
								})
							)}
						</div>
					</div>
				)}
			</div>

			{/* Error Message */}
			{error && (
				<p className='mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1'>
					<span className='inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400'></span>
					{error}
				</p>
			)}
		</div>
	)
}
