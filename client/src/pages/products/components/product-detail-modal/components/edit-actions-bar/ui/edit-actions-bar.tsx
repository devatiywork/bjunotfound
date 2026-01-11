import { PenSquare, Save, X } from 'lucide-react'

interface EditActionsBarProps {
	isEditing: boolean
	onStartEdit: () => void
	onSave: () => void
	onCancel: () => void
	saving: boolean
}

export const EditActionsBar = ({
	isEditing,
	onStartEdit,
	onSave,
	onCancel,
	saving,
}: EditActionsBarProps) => {
	if (isEditing) {
		return (
			<div className='flex gap-2'>
				<button
					onClick={onCancel}
					disabled={saving}
					className='px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
				>
					<X className='w-4 h-4' />
					Отменить
				</button>
				<button
					onClick={onSave}
					disabled={saving}
					className='px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
				>
					<Save className='w-4 h-4' />
					{saving ? 'Сохранение...' : 'Сохранить'}
				</button>
			</div>
		)
	}

	return (
		<button
			onClick={onStartEdit}
			className='px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm'
		>
			<PenSquare className='w-4 h-4' />
			Редактировать
		</button>
	)
}
