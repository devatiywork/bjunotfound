/**
 * Утилита для генерации slug из названия с транслитерацией
 */

const transliterationMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

/**
 * Транслитерация кириллицы в латиницу
 * @param text - текст для транслитерации
 * @returns транслитерированный текст
 */
function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((char) => transliterationMap[char] || char)
    .join('');
}

/**
 * Генерация slug из названия
 * @param name - название категории
 * @returns slug (строка для URL)
 *
 * @example
 * generateSlug('Молочные продукты') // 'molochnye-produkty'
 * generateSlug('Фрукты & Овощи') // 'frukty-ovoshchi'
 * generateSlug('Хлеб, Выпечка') // 'hleb-vypechka'
 */
export function generateSlug(name: string): string {
  // 1. Транслитерация
  let slug = transliterate(name);

  // 2. Замена всех не-буквенно-цифровых символов на дефис
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // 3. Удаление дефисов в начале и конце
  slug = slug.replace(/^-+|-+$/g, '');

  // 4. Замена множественных дефисов на один
  slug = slug.replace(/-+/g, '-');

  return slug;
}

/**
 * Генерация уникального slug с проверкой существования
 * @param baseName - базовое название
 * @param checkExists - функция проверки существования slug
 * @returns уникальный slug
 */
export async function generateUniqueSlug(
  baseName: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 2;

  // Проверяем базовый slug
  while (await checkExists(slug)) {
    // Если занят, добавляем суффикс -2, -3 и т.д.
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }

  return slug;
}
