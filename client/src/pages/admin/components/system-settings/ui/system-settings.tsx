import { RefreshCw, RotateCcw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import * as AdminAPI from '../../../../../api/services/admin.ts'
import type {
	CalorieSetting,
	SettingsGrouped,
} from '../../../../../api/types/admin.ts'
import {
	CollapsibleSection,
	useToast,
} from '../../../../../components/index.ts'

// Функция для преобразования плоского ответа бэкенда в структурированный формат
function transformBackendSettings(backendData: any): SettingsGrouped {
	return {
		safety_limits: [
			{
				key: 'minCaloriesFemale',
				value: backendData.minCaloriesFemale,
				category: 'safety_limits',
				label: 'Минимальные калории для женщин',
				description: 'Безопасный минимум калорий в день для женщин',
			},
			{
				key: 'minCaloriesMale',
				value: backendData.minCaloriesMale,
				category: 'safety_limits',
				label: 'Минимальные калории для мужчин',
				description: 'Безопасный минимум калорий в день для мужчин',
			},
			{
				key: 'maxDeficit',
				value: backendData.maxDeficit,
				category: 'safety_limits',
				label: 'Максимальный дефицит калорий',
				description: 'Максимально допустимый дефицит калорий в день',
			},
			{
				key: 'maxSurplus',
				value: backendData.maxSurplus,
				category: 'safety_limits',
				label: 'Максимальный профицит калорий',
				description: 'Максимально допустимый профицит калорий в день',
			},
		],
		weight_loss_pace: [
			{
				key: 'paceVeryFast',
				value: backendData.paceVeryFast,
				category: 'weight_loss_pace',
				label: 'Очень быстрый темп',
				description: 'Дефицит калорий для очень быстрого похудения',
			},
			{
				key: 'paceFast',
				value: backendData.paceFast,
				category: 'weight_loss_pace',
				label: 'Быстрый темп',
				description: 'Дефицит калорий для быстрого похудения',
			},
			{
				key: 'paceModerate',
				value: backendData.paceModerate,
				category: 'weight_loss_pace',
				label: 'Умеренный темп',
				description: 'Дефицит калорий для умеренного похудения (рекомендуется)',
			},
			{
				key: 'paceComfortable',
				value: backendData.paceComfortable,
				category: 'weight_loss_pace',
				label: 'Комфортный темп',
				description: 'Дефицит калорий для комфортного похудения',
			},
		],
		weight_gain_pace: [
			{
				key: 'paceGainFast',
				value: backendData.paceGainFast,
				category: 'weight_gain_pace',
				label: 'Быстрый набор',
				description: 'Профицит калорий для быстрого набора массы',
			},
			{
				key: 'paceGainModerate',
				value: backendData.paceGainModerate,
				category: 'weight_gain_pace',
				label: 'Умеренный набор',
				description:
					'Профицит калорий для умеренного набора массы (рекомендуется)',
			},
			{
				key: 'paceGainComfortable',
				value: backendData.paceGainComfortable,
				category: 'weight_gain_pace',
				label: 'Комфортный набор',
				description: 'Профицит калорий для комфортного набора массы',
			},
		],
		constants: [
			{
				key: 'caloriesPerKgFat',
				value: backendData.caloriesPerKgFat,
				category: 'constants',
				label: 'Калорий в 1 кг жира',
				description: 'Количество калорий, эквивалентное 1 кг жировой массы',
			},
		],
	}
}

export function SystemSettings() {
	const [settings, setSettings] = useState<SettingsGrouped | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState<string | null>(null)
	const { showToast } = useToast()

	useEffect(() => {
		loadSettings()
	}, [])

	async function loadSettings() {
		try {
			setLoading(true)
			const data = await AdminAPI.getSettings()
			// Преобразуем плоский ответ бэкенда в структурированный формат
			const transformedData = transformBackendSettings(data)
			setSettings(transformedData)
		} catch (error: any) {
			// Если эндпоинт не реализован (404), показываем заглушку
			if (error.response?.status === 404) {
				showToast(
					'Настройки калорийности пока не реализованы на сервере',
					'warning'
				)
			} else {
				showToast(
					error.response?.data?.message || 'Не удалось загрузить настройки',
					'error'
				)
			}
		} finally {
			setLoading(false)
		}
	}

	async function handleUpdateSetting(key: string, value: number) {
		try {
			setSaving(key)
			await AdminAPI.updateSetting(key, { value })
			showToast('Настройка обновлена, кэш инвалидирован', 'success')
			loadSettings()
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось обновить настройку',
				'error'
			)
		} finally {
			setSaving(null)
		}
	}

	async function handleResetAll() {
		if (
			!confirm(
				'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?'
			)
		) {
			return
		}

		try {
			setLoading(true)
			await AdminAPI.resetSettings()
			showToast('Все настройки сброшены к значениям по умолчанию', 'success')
			loadSettings()
		} catch (error: any) {
			showToast(
				error.response?.data?.message || 'Не удалось сбросить настройки',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center py-8 sm:py-12'>
				<div className='animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mb-4'></div>
				<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
					Загрузка настроек...
				</p>
			</div>
		)
	}

	if (!settings) {
		return (
			<div className='flex flex-col items-center justify-center py-8 sm:py-12 px-3 sm:px-4'>
				<div className='text-center max-w-md w-full'>
					<div className='mb-4 inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-700'>
						<RefreshCw className='w-8 h-8 sm:w-10 sm:h-10 text-gray-400' />
					</div>
					<h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3'>
						Настройки калорийности недоступны
					</h3>
					<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6'>
						Эндпоинт управления настройками калорийности еще не реализован на
						сервере. Эта функция будет доступна в следующей версии.
					</p>
					<div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 text-left'>
						<p className='text-xs sm:text-sm text-blue-900 dark:text-blue-100'>
							💡 Пока настройки калорийности используют значения по умолчанию из
							файла{' '}
							<code className='bg-blue-100 dark:bg-blue-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs'>
								calorieCalculator.ts
							</code>
						</p>
					</div>
					<button
						onClick={loadSettings}
						className='
							mt-4 sm:mt-6 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md
							hover:bg-blue-700 transition-colors flex items-center justify-center gap-2
							text-sm sm:text-base
						'
					>
						<RefreshCw className='w-4 h-4' />
						Попробовать снова
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-4 sm:space-y-6'>
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
				<p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
					Настройки калорийности и ограничений системы
				</p>
				<button
					onClick={handleResetAll}
					disabled={loading}
					className='
						w-full sm:w-auto px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-md
						hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed
						transition-colors flex items-center justify-center gap-2 text-sm sm:text-base
					'
				>
					<RotateCcw className='w-4 h-4' />
					<span>Сбросить все</span>
				</button>
			</div>

			<CollapsibleSection title='Границы безопасности' defaultCollapsed={false}>
				<div className='space-y-4'>
					{settings.safety_limits.map((setting: CalorieSetting) => (
						<SettingItem
							key={setting.key}
							setting={setting}
							onUpdate={handleUpdateSetting}
							saving={saving === setting.key}
						/>
					))}
				</div>
			</CollapsibleSection>

			<CollapsibleSection title='Темпы похудения'>
				<div className='space-y-4'>
					{settings.weight_loss_pace.map((setting: CalorieSetting) => (
						<SettingItem
							key={setting.key}
							setting={setting}
							onUpdate={handleUpdateSetting}
							saving={saving === setting.key}
						/>
					))}
				</div>
			</CollapsibleSection>

			<CollapsibleSection title='Темпы набора массы'>
				<div className='space-y-4'>
					{settings.weight_gain_pace.map((setting: CalorieSetting) => (
						<SettingItem
							key={setting.key}
							setting={setting}
							onUpdate={handleUpdateSetting}
							saving={saving === setting.key}
						/>
					))}
				</div>
			</CollapsibleSection>

			<CollapsibleSection title='Константы'>
				<div className='space-y-4'>
					{settings.constants.map((setting: CalorieSetting) => (
						<SettingItem
							key={setting.key}
							setting={setting}
							onUpdate={handleUpdateSetting}
							saving={saving === setting.key}
						/>
					))}
				</div>
			</CollapsibleSection>
		</div>
	)
}

interface SettingItemProps {
	setting: CalorieSetting
	onUpdate: (key: string, value: number) => void
	saving: boolean
}

function SettingItem({ setting, onUpdate, saving }: SettingItemProps) {
	const [value, setValue] = useState(setting.value.toString())
	const [changed, setChanged] = useState(false)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		setValue(setting.value.toString())
		setChanged(false)
		setError('')
	}, [setting.value])

	function handleChange(newValue: string) {
		setValue(newValue)
		setChanged(newValue !== setting.value.toString())
		setError('')
	}

	function handleSave() {
		const numValue = parseFloat(value)
		if (isNaN(numValue) || numValue <= 0) {
			return
		}
		onUpdate(setting.key, numValue)
	}

	function handleReset() {
		setValue(setting.value.toString())
		setChanged(false)
		setError('')
	}

	return (
		<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 space-y-3'>
			<div className='flex flex-col sm:flex-row justify-between items-start gap-2'>
				<div className='flex-1'>
					<h4 className='text-sm sm:text-base font-medium text-gray-900 dark:text-white'>
						{setting.label}
					</h4>
					<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1'>
						{setting.description}
					</p>
				</div>
				<div className='text-xs sm:text-sm font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap'>
					Текущее: {setting.value}
				</div>
			</div>

			{error && (
				<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2'>
					<p className='text-xs sm:text-sm text-red-800 dark:text-red-200'>
						{error}
					</p>
				</div>
			)}

			<div className='flex flex-col sm:flex-row gap-2'>
				<input
					type='number'
					step='any'
					value={value}
					onChange={e => handleChange(e.target.value)}
					disabled={saving}
					className='
						flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md
						bg-white dark:bg-gray-800 text-gray-900 dark:text-white
						focus:outline-none focus:ring-2 focus:ring-blue-500
						disabled:opacity-50 disabled:cursor-not-allowed
					'
				/>
				<div className='flex gap-2'>
					{changed && !error && (
						<button
							onClick={handleReset}
							disabled={saving}
							className='
								flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-md text-sm
								hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed
								transition-colors flex items-center justify-center gap-1.5
							'
						>
							<RotateCcw className='w-3 h-3 sm:w-4 sm:h-4' />
							<span className='hidden sm:inline'>Отмена</span>
						</button>
					)}
					<button
						onClick={handleSave}
						disabled={!changed || saving || !!error}
						className='
							flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-sm
							hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
							transition-colors flex items-center justify-center gap-1.5
						'
					>
						{saving ? (
							<>
								<RefreshCw className='w-3 h-3 sm:w-4 sm:h-4 animate-spin' />
								<span className='hidden sm:inline'>Сохранение...</span>
							</>
						) : (
							<>
								<Save className='w-3 h-3 sm:w-4 sm:h-4' />
								<span>Сохранить</span>
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
