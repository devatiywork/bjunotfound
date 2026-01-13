import { Input } from '../../../../../../../../../components'

interface EditableFieldsProps {
	values: {
		name: string
		description: string
		portions: number
	}
	onChange: (key: 'name' | 'description' | 'portions', value: string) => void
}

export const EditableFields = ({ values, onChange }: EditableFieldsProps) => {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
			<Input
				label='Название'
				value={values.name}
				onChange={e => onChange('name', e.target.value)}
			/>
			<Input
				label='Порций'
				type='number'
				min={1}
				value={values.portions}
				onChange={e => onChange('portions', e.target.value)}
			/>
		</div>
	)
}
