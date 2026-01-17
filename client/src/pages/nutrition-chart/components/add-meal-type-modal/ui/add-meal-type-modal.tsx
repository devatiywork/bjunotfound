import { memo, useCallback, useState } from 'react'
import { createMealType } from '../../../../../api/services/meal-types.ts'
import type { MealType } from '../../../../../api/types/meal-types.ts'
import { Input, Modal } from '../../../../../components/index.ts'

interface AddMealTypeModalProps {
	isOpen: boolean
	onClose: () => void
	onCreated: (mealType: MealType) => void
}

export const AddMealTypeModal = memo(function AddMealTypeModal({
	isOpen,
	onClose,
	onCreated,
}: AddMealTypeModalProps) {
	const [name, setName] = useState('')
	const [isCreating, setIsCreating] = useState(false)

	const handleClose = useCallback(() => {
		setName('')
		onClose()
	}, [onClose])

	const handleCreate = useCallback(async () => {
		if (!name.trim()) return

		setIsCreating(true)
		try {
			const newMealType = await createMealType({
				name: name.trim(),
			})
			setName('')
			onCreated(newMealType)
		} catch {
			console.error('Не удалось создать тип приема пищи')
		} finally {
			setIsCreating(false)
		}
	}, [name, onCreated])

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Новый тип приема пищи'
			maxWidth='sm'
		>
			<div className='space-y-4'>
				<Input
					label='Название'
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder='Например: Второй завтрак'
					autoFocus
				/>
				<div className='flex justify-end gap-3 pt-2'>
					<button
						onClick={handleClose}
						className='px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
					>
						Отмена
					</button>
					<button
						onClick={handleCreate}
						disabled={!name.trim() || isCreating}
						className='px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-400 rounded-lg transition-colors disabled:cursor-not-allowed'
					>
						{isCreating ? 'Создание...' : 'Создать'}
					</button>
				</div>
			</div>
		</Modal>
	)
})
