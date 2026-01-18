/**
 * Утилиты для работы с часовыми поясами
 */

/**
 * Вычисляет границы дня в UTC на основе часового пояса пользователя
 *
 * @param date - дата (если не указана, используется текущая)
 * @param timezone - IANA timezone (например, "Europe/Moscow")
 * @returns объект с startOfDay и endOfDay в UTC
 */
export function getDayBoundaries(
  date: Date | undefined,
  timezone: string,
): { startOfDay: Date; endOfDay: Date } {
  const now = date || new Date();

  // Форматируем дату в формат YYYY-MM-DD в часовом поясе пользователя
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = formatter.format(now); // "2026-01-19"

  // Создаём начало и конец дня в часовом поясе пользователя
  // и конвертируем в UTC
  const startOfDayLocal = new Date(`${dateStr}T00:00:00`);
  const endOfDayLocal = new Date(`${dateStr}T23:59:59.999`);

  // Получаем смещение часового пояса
  const offsetMs = getTimezoneOffsetMs(timezone, now);

  // Конвертируем в UTC
  const startOfDay = new Date(startOfDayLocal.getTime() - offsetMs);
  const endOfDay = new Date(endOfDayLocal.getTime() - offsetMs);

  return { startOfDay, endOfDay };
}

/**
 * Вычисляет границы периода в UTC на основе часового пояса пользователя
 *
 * @param startDate - начальная дата
 * @param endDate - конечная дата
 * @param timezone - IANA timezone
 * @returns объект с startOfPeriod и endOfPeriod в UTC
 */
export function getPeriodBoundaries(
  startDate: Date,
  endDate: Date,
  timezone: string,
): { startOfPeriod: Date; endOfPeriod: Date } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const startDateStr = formatter.format(startDate);
  const endDateStr = formatter.format(endDate);

  const startOfPeriodLocal = new Date(`${startDateStr}T00:00:00`);
  const endOfPeriodLocal = new Date(`${endDateStr}T23:59:59.999`);

  const startOffsetMs = getTimezoneOffsetMs(timezone, startDate);
  const endOffsetMs = getTimezoneOffsetMs(timezone, endDate);

  const startOfPeriod = new Date(startOfPeriodLocal.getTime() - startOffsetMs);
  const endOfPeriod = new Date(endOfPeriodLocal.getTime() - endOffsetMs);

  return { startOfPeriod, endOfPeriod };
}

/**
 * Получает смещение часового пояса в миллисекундах
 */
function getTimezoneOffsetMs(timezone: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return tzDate.getTime() - utcDate.getTime();
}

/**
 * Форматирует дату в строку YYYY-MM-DD в указанном часовом поясе
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
