# Favorites Services - Документация

## AddToFavoritesService

**Файл:** `add-to-favorites.service.ts`

**Назначение:** Добавление блюда в избранное пользователя.

### Метод: `execute(dishId: string, userId: string)`

**Описание:**
Добавляет блюдо в избранное пользователя. Проверяет существование блюда, права доступа (для личных блюд) и дубликаты. Создает запись в таблице FavoriteDish.

**Параметры:**

- `dishId` (string) - UUID блюда для добавления
- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Объект с сообщением:

```typescript
{
  message: 'Блюдо добавлено в избранное';
}
```

**Логика работы:**

1. **Проверка существования блюда:**
   - Ищет блюдо по dishId
   - Выбрасывает `NotFoundException` если не найдено

2. **Проверка доступа:**
   - Если блюдо публичное (isPublic=true): доступно всем
   - Если личное (isPublic=false): проверяет dish.userId === userId
   - Выбрасывает `ForbiddenException` если нет доступа

3. **Проверка дубликатов:**
   - Ищет существующую запись FavoriteDish
   - Выбрасывает `BadRequestException` если уже в избранном

4. **Добавление:**
   - Создает запись FavoriteDish с userId и dishId
   - Автоматически устанавливается addedAt (текущая дата)

**Исключения:**

- `NotFoundException` - блюдо не найдено
- `ForbiddenException` - доступ к личному блюду запрещен
- `BadRequestException` - блюдо уже в избранном

**Особенности:**

- **Контроль доступа:** Нельзя добавить чужое личное блюдо
- **Защита от дубликатов:** Одно блюдо нельзя добавить дважды
- **Timestamp:** Дата добавления сохраняется автоматически

**Пример использования:**

```typescript
// Добавление публичного блюда
const result = await addToFavoritesService.execute('dish-uuid', 'user-uuid');
// { message: 'Блюдо добавлено в избранное' }

// Попытка добавить чужое личное блюдо
try {
  await addToFavoritesService.execute('private-dish-uuid', 'user-uuid');
} catch (error) {
  // ForbiddenException: Доступ к этому блюду запрещен
}

// Попытка добавить дважды
try {
  await addToFavoritesService.execute('already-favorite-dish', 'user-uuid');
} catch (error) {
  // BadRequestException: Блюдо уже в избранном
}
```

---

## RemoveFromFavoritesService

**Файл:** `remove-from-favorites.service.ts`

**Назначение:** Удаление блюда из избранного пользователя.

### Метод: `execute(dishId: string, userId: string)`

**Описание:**
Удаляет блюдо из избранного пользователя. Проверяет существование записи и удаляет ее.

**Параметры:**

- `dishId` (string) - UUID блюда для удаления
- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Объект с сообщением:

```typescript
{
  message: 'Блюдо удалено из избранного';
}
```

**Логика работы:**

1. **Проверка существования:**
   - Ищет запись FavoriteDish по составному ключу (userId, dishId)
   - Выбрасывает `NotFoundException` если не найдена

2. **Удаление:**
   - Удаляет запись FavoriteDish

**Исключения:**

- `NotFoundException` - блюдо не найдено в избранном

**Особенности:**

- **Простая логика:** Только проверка и удаление
- **Безопасность:** Пользователь может удалить только свои избранные

**Пример использования:**

```typescript
// Удаление из избранного
const result = await removeFromFavoritesService.execute(
  'dish-uuid',
  'user-uuid',
);
// { message: 'Блюдо удалено из избранного' }

// Попытка удалить несуществующее
try {
  await removeFromFavoritesService.execute('not-favorite-dish', 'user-uuid');
} catch (error) {
  // NotFoundException: Блюдо не найдено в избранном
}
```

---

## GetFavoritesService

**Файл:** `get-favorites.service.ts`

**Назначение:** Получение списка избранных блюд пользователя.

### Метод: `execute(userId: string)`

**Описание:**
Возвращает список всех избранных блюд пользователя, отсортированных по дате добавления (от новых к старым). Включает полную информацию о блюдах.

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Массив блюд (извлеченных из FavoriteDish.dish):

```typescript
Array<
  Dish & {
    creator: { id: string; email: string };
    ingredients: Array<{
      product: {
        id;
        name;
        unit;
        calories;
        proteins;
        fats;
        carbs;
        servingSize;
      };
    }>;
    tags: Array<{ tag: DishTag }>;
  }
>;
```

**Логика работы:**

1. **Поиск избранных:**
   - Ищет все FavoriteDish для userId
   - Включает связанное блюдо (dish) с:
     - creator (id, email)
     - ingredients с ограниченными полями product
     - tags с полными данными tag

2. **Сортировка:**
   - orderBy addedAt DESC (недавно добавленные первыми)

3. **Извлечение блюд:**
   - Мапит `favorites.map(fav => fav.dish)`
   - Возвращает только блюда без метаданных FavoriteDish

**Особенности:**

- **Сортировка:** По дате добавления (DESC)
- **Ограниченные поля product:** Только основные поля для экономии трафика
- **Полные теги:** Все поля тегов включены

**Пример использования:**

```typescript
const favorites = await getFavoritesService.execute('user-uuid');

// Результат:
// [
//   {
//     id: 'dish-1-uuid',
//     name: 'Куриный салат Цезарь',
//     caloriesPerServing: 225,
//     creator: { id: 'creator-uuid', email: 'creator@example.com' },
//     ingredients: [
//       {
//         product: {
//           id: 'chicken-id',
//           name: 'Куриная грудка',
//           calories: 165,
//           ...
//         }
//       }
//     ],
//     tags: [
//       { tag: { id: 'tag-id', name: 'Высокобелковое', ... } }
//     ]
//   },
//   {
//     id: 'dish-2-uuid',
//     name: 'Овсянка с ягодами',
//     ...
//   }
// ]
```

**Применение:**

- Страница избранных рецептов
- Быстрый доступ к любимым блюдам
- Планирование питания из избранного
- API для мобильного приложения

**Важно:**

- Возвращаются только блюда, без метаданных addedAt
- Если блюдо удалено - оно автоматически исчезнет из избранного (Cascade)
- Сортировка по дате добавления помогает найти недавно добавленные
