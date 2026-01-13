import { Textarea } from '../../../../../../../../../components'

interface DescriptionEditorProps {
	value: string
	onChange: (value: string) => void
}

export const DescriptionEditor = ({
	value,
	onChange,
}: DescriptionEditorProps) => {
	return (
		<Textarea
			label='Описание'
			value={value}
			onChange={e => onChange(e.target.value)}
			rows={4}
		/>
	)
}
