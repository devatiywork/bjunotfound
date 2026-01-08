/**
 * Утилиты для работы с часовыми поясами
 */

/**
 * Получить текущий часовой пояс устройства пользователя
 */
export const getUserTimezone = (): string => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	} catch {
		// Fallback на UTC если не удалось определить
		return 'UTC'
	}
}

/**
 * Все доступные часовые пояса (IANA Time Zone Database)
 */
export const ALL_TIMEZONES = [
	{ value: 'UTC', label: 'UTC - Всемирное координированное время' },
	// Европа
	{ value: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
	{ value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
	{ value: 'Europe/Samara', label: 'Самара (UTC+4)' },
	{ value: 'Europe/London', label: 'Лондон (UTC+0)' },
	{ value: 'Europe/Paris', label: 'Париж (UTC+1)' },
	{ value: 'Europe/Berlin', label: 'Берлин (UTC+1)' },
	{ value: 'Europe/Rome', label: 'Рим (UTC+1)' },
	{ value: 'Europe/Madrid', label: 'Мадрид (UTC+1)' },
	{ value: 'Europe/Kiev', label: 'Киев (UTC+2)' },
	{ value: 'Europe/Minsk', label: 'Минск (UTC+3)' },
	{ value: 'Europe/Istanbul', label: 'Стамбул (UTC+3)' },
	{ value: 'Europe/Athens', label: 'Афины (UTC+2)' },
	{ value: 'Europe/Helsinki', label: 'Хельсинки (UTC+2)' },
	{ value: 'Europe/Stockholm', label: 'Стокгольм (UTC+1)' },
	{ value: 'Europe/Oslo', label: 'Осло (UTC+1)' },
	{ value: 'Europe/Copenhagen', label: 'Копенгаген (UTC+1)' },
	{ value: 'Europe/Warsaw', label: 'Варшава (UTC+1)' },
	{ value: 'Europe/Prague', label: 'Прага (UTC+1)' },
	{ value: 'Europe/Vienna', label: 'Вена (UTC+1)' },
	{ value: 'Europe/Budapest', label: 'Будапешт (UTC+1)' },
	{ value: 'Europe/Bucharest', label: 'Бухарест (UTC+2)' },
	{ value: 'Europe/Amsterdam', label: 'Амстердам (UTC+1)' },
	{ value: 'Europe/Brussels', label: 'Брюссель (UTC+1)' },
	{ value: 'Europe/Lisbon', label: 'Лиссабон (UTC+0)' },
	{ value: 'Europe/Dublin', label: 'Дублин (UTC+0)' },
	{ value: 'Europe/Zurich', label: 'Цюрих (UTC+1)' },

	// Азия (Россия)
	{ value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
	{ value: 'Asia/Omsk', label: 'Омск (UTC+6)' },
	{ value: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
	{ value: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
	{ value: 'Asia/Yakutsk', label: 'Якутск (UTC+9)' },
	{ value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
	{ value: 'Asia/Magadan', label: 'Магадан (UTC+11)' },
	{ value: 'Asia/Kamchatka', label: 'Камчатка (UTC+12)' },
	{ value: 'Asia/Anadyr', label: 'Анадырь (UTC+12)' },
	{ value: 'Asia/Sakhalin', label: 'Сахалин (UTC+11)' },

	// Азия (другие страны)
	{ value: 'Asia/Dubai', label: 'Дубай (UTC+4)' },
	{ value: 'Asia/Tokyo', label: 'Токио (UTC+9)' },
	{ value: 'Asia/Shanghai', label: 'Шанхай (UTC+8)' },
	{ value: 'Asia/Hong_Kong', label: 'Гонконг (UTC+8)' },
	{ value: 'Asia/Singapore', label: 'Сингапур (UTC+8)' },
	{ value: 'Asia/Seoul', label: 'Сеул (UTC+9)' },
	{ value: 'Asia/Bangkok', label: 'Бангкок (UTC+7)' },
	{ value: 'Asia/Jakarta', label: 'Джакарта (UTC+7)' },
	{ value: 'Asia/Kolkata', label: 'Калькутта (UTC+5:30)' },
	{ value: 'Asia/Karachi', label: 'Карачи (UTC+5)' },
	{ value: 'Asia/Tashkent', label: 'Ташкент (UTC+5)' },
	{ value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
	{ value: 'Asia/Dhaka', label: 'Дакка (UTC+6)' },
	{ value: 'Asia/Manila', label: 'Манила (UTC+8)' },
	{ value: 'Asia/Taipei', label: 'Тайбэй (UTC+8)' },
	{ value: 'Asia/Jerusalem', label: 'Иерусалим (UTC+2)' },
	{ value: 'Asia/Riyadh', label: 'Эр-Рияд (UTC+3)' },
	{ value: 'Asia/Tehran', label: 'Тегеран (UTC+3:30)' },
	{ value: 'Asia/Baghdad', label: 'Багдад (UTC+3)' },
	{ value: 'Asia/Baku', label: 'Баку (UTC+4)' },
	{ value: 'Asia/Yerevan', label: 'Ереван (UTC+4)' },
	{ value: 'Asia/Tbilisi', label: 'Тбилиси (UTC+4)' },
	{ value: 'Asia/Kabul', label: 'Кабул (UTC+4:30)' },
	{ value: 'Asia/Kathmandu', label: 'Катманду (UTC+5:45)' },
	{ value: 'Asia/Colombo', label: 'Коломбо (UTC+5:30)' },
	{ value: 'Asia/Yangon', label: 'Янгон (UTC+6:30)' },
	{ value: 'Asia/Hanoi', label: 'Ханой (UTC+7)' },
	{ value: 'Asia/Kuala_Lumpur', label: 'Куала-Лумпур (UTC+8)' },

	// Америка (Северная)
	{ value: 'America/New_York', label: 'Нью-Йорк (UTC-5)' },
	{ value: 'America/Chicago', label: 'Чикаго (UTC-6)' },
	{ value: 'America/Denver', label: 'Денвер (UTC-7)' },
	{ value: 'America/Los_Angeles', label: 'Лос-Анджелес (UTC-8)' },
	{ value: 'America/Anchorage', label: 'Анкоридж (UTC-9)' },
	{ value: 'America/Phoenix', label: 'Финикс (UTC-7)' },
	{ value: 'America/Toronto', label: 'Торонто (UTC-5)' },
	{ value: 'America/Vancouver', label: 'Ванкувер (UTC-8)' },
	{ value: 'America/Halifax', label: 'Галифакс (UTC-4)' },
	{ value: 'America/Mexico_City', label: 'Мехико (UTC-6)' },
	{ value: 'America/Havana', label: 'Гавана (UTC-5)' },
	{ value: 'America/Jamaica', label: 'Ямайка (UTC-5)' },

	// Америка (Южная)
	{ value: 'America/Sao_Paulo', label: 'Сан-Паулу (UTC-3)' },
	{ value: 'America/Buenos_Aires', label: 'Буэнос-Айрес (UTC-3)' },
	{ value: 'America/Santiago', label: 'Сантьяго (UTC-3)' },
	{ value: 'America/Lima', label: 'Лима (UTC-5)' },
	{ value: 'America/Bogota', label: 'Богота (UTC-5)' },
	{ value: 'America/Caracas', label: 'Каракас (UTC-4)' },
	{ value: 'America/Montevideo', label: 'Монтевидео (UTC-3)' },
	{ value: 'America/La_Paz', label: 'Ла-Пас (UTC-4)' },
	{ value: 'America/Asuncion', label: 'Асунсьон (UTC-3)' },

	// Африка
	{ value: 'Africa/Cairo', label: 'Каир (UTC+2)' },
	{ value: 'Africa/Johannesburg', label: 'Йоханнесбург (UTC+2)' },
	{ value: 'Africa/Lagos', label: 'Лагос (UTC+1)' },
	{ value: 'Africa/Nairobi', label: 'Найроби (UTC+3)' },
	{ value: 'Africa/Casablanca', label: 'Касабланка (UTC+1)' },
	{ value: 'Africa/Algiers', label: 'Алжир (UTC+1)' },
	{ value: 'Africa/Tunis', label: 'Тунис (UTC+1)' },
	{ value: 'Africa/Addis_Ababa', label: 'Аддис-Абеба (UTC+3)' },
	{ value: 'Africa/Accra', label: 'Аккра (UTC+0)' },

	// Австралия и Океания
	{ value: 'Australia/Sydney', label: 'Сидней (UTC+11)' },
	{ value: 'Australia/Melbourne', label: 'Мельбурн (UTC+11)' },
	{ value: 'Australia/Brisbane', label: 'Брисбен (UTC+10)' },
	{ value: 'Australia/Perth', label: 'Перт (UTC+8)' },
	{ value: 'Australia/Adelaide', label: 'Аделаида (UTC+10:30)' },
	{ value: 'Australia/Darwin', label: 'Дарвин (UTC+9:30)' },
	{ value: 'Pacific/Auckland', label: 'Окленд (UTC+13)' },
	{ value: 'Pacific/Fiji', label: 'Фиджи (UTC+12)' },
	{ value: 'Pacific/Honolulu', label: 'Гонолулу (UTC-10)' },
	{ value: 'Pacific/Guam', label: 'Гуам (UTC+10)' },
	{ value: 'Pacific/Tahiti', label: 'Таити (UTC-10)' },

	// Атлантика
	{ value: 'Atlantic/Reykjavik', label: 'Рейкьявик (UTC+0)' },
	{ value: 'Atlantic/Azores', label: 'Азорские острова (UTC-1)' },
	{ value: 'Atlantic/Cape_Verde', label: 'Кабо-Верде (UTC-1)' },
]

/**
 * Популярные часовые пояса для быстрого выбора (deprecated, используйте ALL_TIMEZONES)
 * @deprecated Используйте ALL_TIMEZONES с поиском
 */
export const COMMON_TIMEZONES = ALL_TIMEZONES

/**
 * Получить метку часового пояса для отображения
 */
export const getTimezoneLabel = (timezone: string): string => {
	const found = ALL_TIMEZONES.find(tz => tz.value === timezone)
	return found ? found.label : timezone
}
