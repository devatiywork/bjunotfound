# Serving Services - Документация

Группа сервисов для работы с пользовательскими порциями продуктов (custom servings: стакан, ломтик, яйцо и т.д.).

---

## AddServingService

**Файл:** `add-serving.service.ts`

**Назначение:** Добавление пользовательской порции продукта.

### Метод: `execute(productId, userId, dto)`

**Описание:**
Создает новую пользовательскую порцию для продукта. Проверяет права доступа (только владелец). Управляет флагом isDefault: если новая порция устанавливается как default, сбрасывает isDefault для всех остальных порций этого продукта.

**Параметры:**

- `productId` (string) - ID продукта
- `userId` (string) - ID текущего пользователя
- `dto` (AddServingDto) - Данные о порции
  - `name` (string, 2-50 символов) - Название порции (например, "Стакан", "Яйцо", "Ломтик")
  - `amountUnits?` (number, 0.01-9999.99, default: 1) - Количество единиц (например, 1 стакан)
  - `weightG?` (number, 0.01-999999.99) - Вес порции в граммах
  - `volumeMl?` (number, 0.01-999999.99) - Объем порции в миллилитрах
  - `isDefault?` (boolean, default: false) - Является ли порция по умолчанию

**Возвращаемое значение:**
Объект ProductUserServing:

```typescript
{
  id: string,
  productUserId: string,
  name: string,
  amountUnits: number,
  weightG: number | null,
  volumeMl: number | null,
  isDefault: boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем продукта
- `BadRequestException` - если не указан ни weightG, ни volumeMl (валидация на уровне DTO)

**Особенности:**

- Только владелец продукта может добавлять порции (админ НЕТ)
- Требуется хотя бы одно из полей: weightG или volumeMl
- Можно указать оба поля одновременно (например, для жидкостей)
- **isDefault management**: если isDefault=true, автоматически сбрасывает isDefault для всех других порций продукта
- Логика сброса выполняется ПЕРЕД созданием новой порции
- Используется updateMany для атомарности операции

**Пример использования:**

```typescript
const serving = await addServingService.execute('product-id', 'user-id', {
  name: 'Стакан',
  amountUnits: 1,
  volumeMl: 250,
  isDefault: true, // Автоматически сбросит isDefault у других порций
});
```

**Логика isDefault:**

```typescript
if (dto.isDefault) {
  await this.prisma.productUserServing.updateMany({
    where: { productUserId: productId },
    data: { isDefault: false },
  });
}
```

---

## UpdateServingService

**Файл:** `update-serving.service.ts`

**Назначение:** Обновление существующей пользовательской порции.

### Метод: `execute(productId, servingId, userId, dto)`

**Описание:**
Обновляет пользовательскую порцию продукта. Проверяет права доступа (только владелец) и валидирует принадлежность порции к продукту. Управляет флагом isDefault: если isDefault устанавливается в true, сбрасывает isDefault для всех остальных порций (кроме текущей).

**Параметры:**

- `productId` (string) - ID продукта
- `servingId` (string) - ID порции для обновления
- `userId` (string) - ID текущего пользователя
- `dto` (UpdateServingDto) - Данные для обновления (все поля опциональны)
  - `name?` (string, 2-50 символов) - Название порции
  - `amountUnits?` (number, 0.01-9999.99) - Количество единиц
  - `weightG?` (number, 0.01-999999.99) - Вес порции
  - `volumeMl?` (number, 0.01-999999.99) - Объем порции
  - `isDefault?` (boolean) - Флаг порции по умолчанию

**Возвращаемое значение:**
Обновленный объект ProductUserServing

**Исключения:**

- `NotFoundException` - если продукт или порция не существуют, или порция не принадлежит продукту
- `ForbiddenException` - если пользователь не является владельцем продукта

**Особенности:**

- Только владелец продукта может обновлять порции
- Валидация принадлежности: serving.productUserId === productId
- Selective update: обновляются только переданные поля
- **isDefault management**: если isDefault устанавливается в true, сбрасывает isDefault для всех других порций (исключая текущую)
- Сброс выполняется только при явной установке isDefault=true в DTO
- Используется where с NOT для исключения текущей порции из сброса

**Пример использования:**

```typescript
const updated = await updateServingService.execute(
  'product-id',
  'serving-id',
  'user-id',
  {
    name: 'Большой стакан',
    volumeMl: 300,
    isDefault: true, // Сбросит isDefault у других, кроме этой порции
  },
);
```

**Логика isDefault:**

```typescript
if (dto.isDefault === true) {
  await this.prisma.productUserServing.updateMany({
    where: {
      productUserId: productId,
      id: { not: servingId }, // Исключаем текущую порцию
    },
    data: { isDefault: false },
  });
}
```

**Важная деталь:**
Сброс isDefault происходит только при явной установке `isDefault: true` в DTO. Если `isDefault` не передан или `isDefault: false`, сброс не выполняется.

---

## DeleteServingService

**Файл:** `delete-serving.service.ts`

**Назначение:** Удаление пользовательской порции.

### Метод: `execute(productId, servingId, userId)`

**Описание:**
Удаляет пользовательскую порцию продукта. Проверяет права доступа (только владелец) и валидирует принадлежность порции к продукту.

**Параметры:**

- `productId` (string) - ID продукта
- `servingId` (string) - ID порции для удаления
- `userId` (string) - ID текущего пользователя

**Возвращаемое значение:**

```typescript
{
  message: 'Порция успешно удалена';
}
```

**Исключения:**

- `NotFoundException` - если продукт или порция не существуют, или порция не принадлежит продукту
- `ForbiddenException` - если пользователь не является владельцем продукта

**Особенности:**

- Только владелец продукта может удалять порции
- Валидация принадлежности: serving.productUserId === productId
- Физическое удаление из БД (без soft delete)
- При удалении default порции, другие порции остаются без default (нужно установить вручную)
- Удаление порции не влияет на сам продукт

**Пример использования:**

```typescript
const result = await deleteServingService.execute(
  'product-id',
  'serving-id',
  'user-id',
);
```

**Рекомендация:**
Если удаляется default порция, рекомендуется установить другую порцию как default:

```typescript
// 1. Удалить default порцию
await deleteServingService.execute(productId, defaultServingId, userId);

// 2. Получить список оставшихся порций
const servings = await listServingsService.execute(productId, userId, false);

// 3. Установить новую default порцию
if (servings.length > 0) {
  await updateServingService.execute(productId, servings[0].id, userId, {
    isDefault: true,
  });
}
```

---

## ListServingsService

**Файл:** `list-servings.service.ts`

**Назначение:** Получение списка всех порций продукта.

### Метод: `execute(productId, userId, isAdmin)`

**Описание:**
Возвращает все пользовательские порции продукта, отсортированные по флагу isDefault (default первая) и дате создания. Проверяет права доступа (владелец или админ).

**Параметры:**

- `productId` (string) - ID продукта
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором

**Возвращаемое значение:**
Массив объектов ProductUserServing, отсортированных по:

1. `isDefault DESC` - default порция в начале списка
2. `createdAt ASC` - старые порции раньше новых

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем и не администратор

**Особенности:**

- Права доступа: владелец или админ (в отличие от Add/Update/Delete, где только владелец)
- **Специальная сортировка**: default порция всегда первая в списке
- Если нет default порции, порции сортируются только по дате создания
- Включает все поля порции (name, amountUnits, weightG, volumeMl, isDefault)

**Пример использования:**

```typescript
const servings = await listServingsService.execute(
  'product-id',
  'user-id',
  false,
);
// servings: [
//   { name: 'Стакан', isDefault: true, ... },  // Default первый
//   { name: 'Ложка', isDefault: false, ... },
//   { name: 'Яйцо', isDefault: false, ... },
// ]
```

**Типичный use case:**

```typescript
// Получить default порцию для автоматического выбора в UI
const servings = await listServingsService.execute(productId, userId, isAdmin);
const defaultServing = servings.find((s) => s.isDefault) || servings[0];

// Рассчитать калории для порции
const product = await getProductUserService.execute(productId, userId, isAdmin);
const caloriesPerServing =
  product.nutrition.caloriesKcal * (defaultServing.weightG / 100);
```

**Важная деталь:**
Сортировка гарантирует, что:

- Default порция всегда на первой позиции (если есть)
- Остальные порции отсортированы по дате создания (старые → новые)
- Удобно для UI: можно брать первый элемент как default

**Порядок сортировки:**

```typescript
orderBy: [
  { isDefault: 'desc' }, // true > false
  { createdAt: 'asc' }, // 2024-01-01 < 2024-01-10
];
```
