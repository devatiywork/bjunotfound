/**
 * Утилиты для работы с брендами
 */

/**
 * Нормализация названия бренда для дедупликации
 * @param name - название бренда
 * @returns нормализованное название (lowercase, без пробелов и спецсимволов)
 *
 * @example
 * normalizeBrandName('Danone') // 'danone'
 * normalizeBrandName('COCA-COLA') // 'cocacola'
 * normalizeBrandName('Dr. Oetker') // 'droetker'
 * normalizeBrandName('Мир Вкуса') // 'мирвкуса'
 */
export function normalizeBrandName(name: string): string {
  return name
    .toLowerCase() // Преобразование в нижний регистр
    .trim() // Удаление пробелов по краям
    .replace(/[\s\-_.,'";:!?()[\]{}]+/g, '') // Удаление пробелов и спецсимволов
    .replace(/[^\p{L}\p{N}]/gu, ''); // Удаление всех символов кроме букв и цифр (поддержка Unicode)
}
