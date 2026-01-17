import { ArrowDown, ArrowUp, Check, GripVertical, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Header } from '../../../components/index.ts'
import {
	ActivityWidget,
	DailyNutritionWidget,
	GoalsWidget,
	WeightWidget,
} from '../components/index.ts'

type WidgetType = 'weight' | 'goals' | 'activity' | 'nutrition'

const STORAGE_KEY = 'home-widgets-order'
const DEFAULT_ORDER: WidgetType[] = ['nutrition', 'weight', 'goals', 'activity']

export const HomePage = () => {
	const [isEditMode, setIsEditMode] = useState(false)
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
	const [widgetOrder, setWidgetOrder] = useState<WidgetType[]>(DEFAULT_ORDER)

	useEffect(() => {
		document.title = 'Главная | TimeNoFat'

		// Загрузка порядка виджетов из localStorage
		const savedOrder = localStorage.getItem(STORAGE_KEY)
		if (savedOrder) {
			try {
				const order: WidgetType[] = JSON.parse(savedOrder)
				// Проверяем, что все виджеты из дефолтного порядка присутствуют
				const validOrder = order.filter(id =>
					DEFAULT_ORDER.includes(id)
				) as WidgetType[]

				// Добавляем виджеты, которых нет в сохраненном порядке
				DEFAULT_ORDER.forEach(id => {
					if (!validOrder.includes(id)) {
						validOrder.push(id)
					}
				})

				setWidgetOrder(validOrder)
			} catch {
				setWidgetOrder(DEFAULT_ORDER)
			}
		}
	}, [])

	const saveOrder = (newOrder: WidgetType[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder))
	}

	const renderWidget = (id: WidgetType) => {
		switch (id) {
			case 'weight':
				return <WeightWidget key={id} />
			case 'goals':
				return <GoalsWidget key={id} />
			case 'activity':
				return <ActivityWidget key={id} />
			case 'nutrition':
				return <DailyNutritionWidget key={id} />
		}
	}

	const handleDragStart = (index: number) => {
		setDraggedIndex(index)
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault()
		setDragOverIndex(index)

		if (draggedIndex === null || draggedIndex === index) return

		const newOrder = [...widgetOrder]
		const draggedWidget = newOrder[draggedIndex]
		newOrder.splice(draggedIndex, 1)
		newOrder.splice(index, 0, draggedWidget)

		setWidgetOrder(newOrder)
		setDraggedIndex(index)
	}

	const handleDragLeave = () => {
		setDragOverIndex(null)
	}

	const handleDragEnd = () => {
		setDraggedIndex(null)
		setDragOverIndex(null)
		saveOrder(widgetOrder)
	}

	const moveWidget = (index: number, direction: 'up' | 'down') => {
		const newOrder = [...widgetOrder]
		const targetIndex = direction === 'up' ? index - 1 : index + 1

		if (targetIndex < 0 || targetIndex >= widgetOrder.length)
			return // Меняем местами виджеты
		;[newOrder[index], newOrder[targetIndex]] = [
			newOrder[targetIndex],
			newOrder[index],
		]

		setWidgetOrder(newOrder)
		saveOrder(newOrder)
	}

	return (
		<div className='flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900'>
			<Header />

			<main className='container mx-auto flex-1 px-4 py-8'>
				{/* Уведомление о режиме редактирования */}
				{isEditMode && (
					<div className='mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 animate-fade-in'>
						<div className='flex items-start gap-3'>
							<GripVertical className='w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0' />
							<div className='flex-1'>
								<h3 className='font-semibold text-blue-900 dark:text-blue-200 mb-1'>
									Режим настройки виджетов
								</h3>
								<p className='text-sm text-blue-700 dark:text-blue-300'>
									Перетаскивайте виджеты или используйте стрелки для изменения
									их порядка. Изменения сохраняются автоматически.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Кнопка режима редактирования */}
				<div className='flex justify-end mb-6'>
					<button
						onClick={() => setIsEditMode(!isEditMode)}
						className={`
							group relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
							transition-all duration-300 ease-in-out transform
							${
								isEditMode
									? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 hover:scale-105'
									: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md hover:scale-105'
							}
						`}
					>
						{isEditMode ? (
							<>
								<Check className='w-4 h-4 transition-transform duration-300 group-hover:scale-110' />
								<span>Готово</span>
								<div className='absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
							</>
						) : (
							<>
								<Settings className='w-4 h-4 transition-transform duration-300 group-hover:rotate-90' />
								<span>Настроить виджеты</span>
								<div className='absolute inset-0 rounded-lg bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
							</>
						)}
					</button>
				</div>

				{/* Widgets - колонка на мобильных, ряд на десктопе */}
				<div className='flex flex-col gap-6 lg:flex-row flex-wrap'>
					{widgetOrder.map((widgetId, index) => (
						<div
							key={widgetId}
							draggable={isEditMode}
							onDragStart={() => handleDragStart(index)}
							onDragOver={e => handleDragOver(e, index)}
							onDragLeave={handleDragLeave}
							onDragEnd={handleDragEnd}
							className={`
								flex-1 relative transition-all duration-300 ease-out
								${isEditMode ? 'cursor-move' : ''}
								${
									draggedIndex === index
										? 'scale-95 opacity-40 rotate-2'
										: 'scale-100 opacity-100 rotate-0'
								}
								${dragOverIndex === index && draggedIndex !== index ? 'scale-105' : ''}
								${isEditMode && draggedIndex !== index ? 'hover:scale-102' : ''}
							`}
							style={{
								transformOrigin: 'center',
								transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
							}}
						>
							{/* Рамка в режиме редактирования */}
							{isEditMode && (
								<div
									className={`
										absolute -inset-2 rounded-xl transition-all duration-300
										${
											draggedIndex === index
												? 'bg-linear-to-r from-blue-400/30 to-purple-400/30 blur-sm'
												: dragOverIndex === index
												? 'bg-linear-to-r from-green-400/30 to-blue-400/30 blur-sm animate-pulse'
												: 'bg-blue-500/10 blur-sm opacity-0 group-hover:opacity-100'
										}
									`}
								/>
							)}

							{/* Индикатор перетаскивания */}
							{isEditMode && (
								<div className='relative flex items-center justify-between mb-3 gap-2'>
									{/* Кнопки управления стрелками */}
									<div className='flex gap-1'>
										<button
											onClick={() => moveWidget(index, 'up')}
											disabled={index === 0}
											className={`
												p-2 rounded-lg transition-all duration-300
												${
													index === 0
														? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
														: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 hover:scale-110 active:scale-95'
												}
											`}
											title='Переместить вверх'
										>
											<ArrowUp className='w-4 h-4' />
										</button>
										<button
											onClick={() => moveWidget(index, 'down')}
											disabled={index === widgetOrder.length - 1}
											className={`
												p-2 rounded-lg transition-all duration-300
												${
													index === widgetOrder.length - 1
														? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
														: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 hover:scale-110 active:scale-95'
												}
											`}
											title='Переместить вниз'
										>
											<ArrowDown className='w-4 h-4' />
										</button>
									</div>

									{/* Индикатор захвата */}
									<div
										className={`
											flex-1 flex items-center justify-center p-2 rounded-lg
											transition-all duration-300
											${
												draggedIndex === index
													? 'bg-blue-100 dark:bg-blue-900/50 scale-110'
													: 'bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 hover:scale-110'
											}
										`}
									>
										<GripVertical
											className={`
												w-6 h-6 transition-all duration-300
												${
													draggedIndex === index
														? 'text-blue-600 dark:text-blue-400 animate-bounce'
														: 'text-blue-500 dark:text-blue-400'
												}
											`}
										/>
										{draggedIndex === index && (
											<div className='absolute inset-0 rounded-lg bg-blue-500/20 animate-ping' />
										)}
									</div>
								</div>
							)}

							{/* Виджет */}
							<div
								className={`
									relative transition-all duration-300
									${
										isEditMode
											? 'ring-2 ring-blue-400/50 dark:ring-blue-500/50 rounded-xl shadow-xl'
											: ''
									}
									${draggedIndex === index ? 'shadow-2xl shadow-blue-500/50' : ''}
								`}
							>
								{renderWidget(widgetId)}
							</div>

							{/* Индикатор позиции при перетаскивании */}
							{isEditMode &&
								dragOverIndex === index &&
								draggedIndex !== index && (
									<div className='absolute inset-0 rounded-xl border-4 border-dashed border-green-500 dark:border-green-400 animate-pulse pointer-events-none' />
								)}
						</div>
					))}
				</div>
			</main>

			{/* CSS анимации */}
			<style>{`
				@keyframes fade-in {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				
				.animate-fade-in {
					animation: fade-in 0.3s ease-out;
				}
				
				.hover\\:scale-102:hover {
					transform: scale(1.02);
				}
			`}</style>
		</div>
	)
}
