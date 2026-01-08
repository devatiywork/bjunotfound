# Find Services - Документация

## FindAllDishesService

**Файл:** `find-all-dishes.service.ts`

**Назначение:** Получение списка блюд с продвинутой фильтрацией, пагинацией и сортировкой.

### Метод: `execute(filters: FilterDishesDto, userId?: string)`

**Описание:**
Возвращает список блюд с учетом множественных фильтров. Показывает публичные блюда + личные блюда пользователя (если userId указан). Поддерживает пагинацию, поиск, фильтрацию по тегам, типам, калориям, времени приготовления, цене и сортировку.

**Параметры:**

- `filters` (FilterDishesDto):
  - `page?` (number) - Номер страницы (по умолчанию 1)
  - `limit?` (number) - Размер страницы (по умолчанию 20, макс. 100)
  - `search?` (string) - Поиск по названию и описанию (case-insensitive)
  - `tagIds?` (string[]) - Фильтр по тегам (блюда с хотя бы одним из тегов)
  - `mealType?` (MealType) - Фильтр по типу приема пищи
  - `cuisineType?` (CuisineType) - Фильтр по типу кухни
  - `dishCategory?` (DishCategory) - Фильтр по категории блюда
  - `difficulty?` (DifficultyLevel) - Фильтр по сложности
  - `minCalories?` (number) - Минимум калорий на порцию
  - `maxCalories?` (number) - Максимум калорий на порцию
  - `minCookingTime?` (number) - Минимум времени приготовления
  - `maxCookingTime?` (number) - Максимум времени приготовления
  - `minPrice?` (number) - Минимум цены за порцию
  - `maxPrice?` (number) - Максимум цены за порцию
  - `source?` (DataSource) - Фильтр по источнику (ADMIN/USER/API/IMPORT)
  - `isVerified?` (boolean) - Только верифицированные блюда
  - `sortBy?` (string) - Поле сортировки (по умолчанию 'createdAt')
  - `sortOrder?` ('asc' | 'desc') - Порядок сортировки (по умолчанию 'desc')
- `userId?` (string) - ID текущего пользователя (для показа личных блюд)

**Возвращаемое значение:**
Объект с блюдами и пагинацией:

```typescript
{
  dishes: Array<Dish>,  // Массив блюд с creator, ingredients, tags
  pagination: {
    total: number,      // Общее количество блюд
    page: number,       // Текущая страница
    limit: number,      // Размер страницы
    totalPages: number  // Всего страниц
  }
}
```

**Логика работы:**

1. **Построение базового where:**
   - Если userId указан: `isPublic=true OR userId=userId`
   - Иначе: только `isPublic=true`

2. **Применение фильтров:**
   - Поиск: по name и description (contains, case-insensitive)
   - Теги: блюда с хотя бы одним из указанных тегов (some)
   - Перечисления: точное совпадение (mealType, cuisineType, difficulty, source)
   - Диапазоны: gte/lte для калорий, времени, цены

3. **Выполнение запросов:**
   - Параллельно: findMany (с пагинацией и сортировкой) + count
   - Включает creator, ingredients (с product), tags

4. **Возврат результата:**
   - Массив блюд + метаданные пагинации

**Особенности:**

- **Доступ:** Показывает публичные + личные (если авторизован)
- **Комбинация фильтров:** Все фильтры работают одновременно (AND логика)
- **Фильтрация по тегам:** Достаточно одного совпадения
- **Ограниченные поля продуктов:** Для ingredients.product показываются только основные поля

**Пример использования:**

```typescript
// Поиск низкокалорийных блюд на завтрак
const result = await findAllDishesService.execute(
  {
    page: 1,
    limit: 10,
    mealType: 'BREAKFAST',
    maxCalories: 400,
    difficulty: 'EASY',
    sortBy: 'caloriesPerServing',
    sortOrder: 'asc',
  },
  'user-uuid',
);

// Результат:
// {
//   dishes: [
//     { name: 'Овсянка с ягодами', caloriesPerServing: 320, ... },
//     { name: 'Омлет с овощами', caloriesPerServing: 380, ... }
//   ],
//   pagination: {
//     total: 25,
//     page: 1,
//     limit: 10,
//     totalPages: 3
//   }
// }
```

**Применение:**

- Каталог блюд с фильтрами
- Подбор блюд под калорийность дня
- Поиск рецептов по типу кухни
- Быстрые рецепты (фильтр по времени)

---

## FindOneDishService

**Файл:** `find-one-dish.service.ts`

**Назначение:** Получение детальной информации о конкретном блюде.

### Метод: `execute(id: string, userId?: string)`

**Описание:**
Возвращает полную информацию о блюде по ID. Проверяет права доступа: публичные блюда доступны всем, личные - только создателю.

**Параметры:**

- `id` (string) - UUID блюда
- `userId?` (string) - ID текущего пользователя (для проверки доступа)

**Возвращаемое значение:**
Блюдо со всеми связями:

- `creator` (id, email)
- `ingredients` с полными данными продуктов
- `tags` с полными данными тегов
- Все поля блюда (КБЖУ, цена, метаданные)

**Логика работы:**

1. **Поиск блюда:**
   - findUnique по ID
   - Включает все связи (creator, ingredients.product, tags.tag)

2. **Проверка существования:**
   - Выбрасывает `NotFoundException` если не найдено

3. **Проверка доступа:**
   - Если блюдо публичное (isPublic=true): доступно всем
   - Если личное (isPublic=false): проверяет userId === dish.userId
   - Выбрасывает `ForbiddenException` если нет доступа

**Исключения:**

- `NotFoundException` - блюдо не найдено
- `ForbiddenException` - доступ к личному блюду запрещен

**Особенности:**

- **Контроль доступа:** Личные блюда видны только создателю
- **Полные данные:** Возвращает все поля продуктов в ингредиентах
- **Публичный доступ:** Публичные блюда доступны без авторизации

**Пример использования:**

```typescript
// Получение публичного блюда (без авторизации)
const dish = await findOneDishService.execute('dish-uuid');

// Получение личного блюда (требует авторизации)
const myDish = await findOneDishService.execute('my-dish-uuid', 'user-uuid');

// Попытка доступа к чужому личному блюду
try {
  await findOneDishService.execute('someone-private-dish-uuid', 'user-uuid');
} catch (error) {
  // ForbiddenException: Доступ к этому блюду запрещен
}
```

**Применение:**

- Страница детального просмотра блюда
- Получение данных для редактирования
- API endpoint для мобильного приложения
