# Package Services - Документация

Группа сервисов для работы с покупками/упаковками продуктов (история покупок, цены, магазины).

---

## AddPackageService

**Файл:** `add-package.service.ts`

**Назначение:** Добавление записи о покупке/упаковке продукта.

### Метод: `execute(productId, userId, dto)`

**Описание:**
Создает новую запись о покупке продукта. Проверяет права доступа (только владелец продукта может добавлять покупки). Валидирует наличие хотя бы одного из полей totalWeightG или totalVolumeMl.

**Параметры:**

- `productId` (string) - ID продукта
- `userId` (string) - ID текущего пользователя
- `dto` (AddPackageDto) - Данные о покупке
  - `totalWeightG?` (number, 0.01-999999.99) - Вес упаковки в граммах
  - `totalVolumeMl?` (number, 0.01-999999.99) - Объем упаковки в миллилитрах
  - `priceTotal` (number, 0.01-9999999.99) - Цена покупки
  - `currency` (Currency) - Валюта (RUB, USD, EUR, UAH, KZT)
  - `purchasedAt?` (Date) - Дата покупки (default: now)
  - `store?` (string, max 100) - Название магазина
  - `note?` (string, max 500) - Заметки о покупке

**Возвращаемое значение:**
Объект ProductUserPackage:

```typescript
{
  id: string,
  productUserId: string,
  totalWeightG: number | null,
  totalVolumeMl: number | null,
  priceTotal: number,
  currency: Currency,
  purchasedAt: Date,
  store: string | null,
  note: string | null,
  createdAt: Date,
  updatedAt: Date,
}
```

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем продукта
- `BadRequestException` - если не указан ни totalWeightG, ни totalVolumeMl (валидация на уровне DTO)

**Особенности:**

- Только владелец продукта может добавлять покупки (админ НЕТ)
- Требуется хотя бы одно из полей: totalWeightG или totalVolumeMl
- Можно указать оба поля одновременно
- purchasedAt по умолчанию устанавливается в now()
- История покупок позволяет отслеживать динамику цен и предпочитаемые магазины

**Пример использования:**

```typescript
const package = await addPackageService.execute('product-id', 'user-id', {
  totalWeightG: 1000,
  priceTotal: 89.99,
  currency: 'RUB',
  purchasedAt: new Date('2024-01-15'),
  store: 'Пятерочка',
  note: 'Со скидкой по карте',
});
```

---

## UpdatePackageService

**Файл:** `update-package.service.ts`

**Назначение:** Обновление существующей записи о покупке.

### Метод: `execute(productId, packageId, userId, dto)`

**Описание:**
Обновляет запись о покупке продукта. Проверяет права доступа (только владелец продукта) и валидирует принадлежность покупки к продукту. Позволяет выборочно обновлять поля.

**Параметры:**

- `productId` (string) - ID продукта
- `packageId` (string) - ID покупки для обновления
- `userId` (string) - ID текущего пользователя
- `dto` (UpdatePackageDto) - Данные для обновления (все поля опциональны)
  - `totalWeightG?` (number, 0.01-999999.99) - Вес упаковки
  - `totalVolumeMl?` (number, 0.01-999999.99) - Объем упаковки
  - `priceTotal?` (number, 0.01-9999999.99) - Цена
  - `currency?` (Currency) - Валюта
  - `purchasedAt?` (Date) - Дата покупки
  - `store?` (string, max 100) - Магазин
  - `note?` (string, max 500) - Заметки

**Возвращаемое значение:**
Обновленный объект ProductUserPackage

**Исключения:**

- `NotFoundException` - если продукт или покупка не существуют, или покупка не принадлежит продукту
- `ForbiddenException` - если пользователь не является владельцем продукта

**Особенности:**

- Только владелец продукта может обновлять покупки
- Валидация принадлежности: package.productUserId === productId
- Selective update: обновляются только переданные поля
- Можно обновить одно поле, не затрагивая остальные
- При обновлении автоматически устанавливается updatedAt

**Пример использования:**

```typescript
const updated = await updatePackageService.execute(
  'product-id',
  'package-id',
  'user-id',
  {
    priceTotal: 79.99,
    note: 'Цена снизилась',
  },
);
```

---

## DeletePackageService

**Файл:** `delete-package.service.ts`

**Назначение:** Удаление записи о покупке.

### Метод: `execute(productId, packageId, userId)`

**Описание:**
Удаляет запись о покупке продукта. Проверяет права доступа (только владелец продукта) и валидирует принадлежность покупки к продукту.

**Параметры:**

- `productId` (string) - ID продукта
- `packageId` (string) - ID покупки для удаления
- `userId` (string) - ID текущего пользователя

**Возвращаемое значение:**

```typescript
{
  message: 'Покупка успешно удалена';
}
```

**Исключения:**

- `NotFoundException` - если продукт или покупка не существуют, или покупка не принадлежит продукту
- `ForbiddenException` - если пользователь не является владельцем продукта

**Особенности:**

- Только владелец продукта может удалять покупки
- Валидация принадлежности: package.productUserId === productId
- Физическое удаление из БД (без soft delete)
- Удаление покупки не влияет на сам продукт

**Пример использования:**

```typescript
const result = await deletePackageService.execute(
  'product-id',
  'package-id',
  'user-id',
);
```

---

## ListPackagesService

**Файл:** `list-packages.service.ts`

**Назначение:** Получение списка всех покупок продукта.

### Метод: `execute(productId, userId, isAdmin)`

**Описание:**
Возвращает все записи о покупках продукта, отсортированные по дате покупки (новые первые). Проверяет права доступа (владелец или админ).

**Параметры:**

- `productId` (string) - ID продукта
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором

**Возвращаемое значение:**
Массив объектов ProductUserPackage, отсортированных по `purchasedAt DESC`

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем и не администратор

**Особенности:**

- Права доступа: владелец или админ (в отличие от Add/Update/Delete, где только владелец)
- Сортировка по дате покупки: новые покупки в начале списка
- Включает все поля покупки (вес, объем, цена, валюта, магазин, заметки)
- Можно использовать для анализа динамики цен и предпочитаемых магазинов

**Пример использования:**

```typescript
const packages = await listPackagesService.execute(
  'product-id',
  'user-id',
  false,
);
// packages: [{ purchasedAt: '2024-01-20', ... }, { purchasedAt: '2024-01-10', ... }]
```

**Типичный use case:**

```typescript
// Получить историю покупок для отображения графика цен
const packages = await listPackagesService.execute(productId, userId, isAdmin);

// Анализ: средняя цена за кг
const avgPricePerKg =
  packages
    .filter((p) => p.totalWeightG)
    .reduce((sum, p) => sum + p.priceTotal / (p.totalWeightG / 1000), 0) /
  packages.filter((p) => p.totalWeightG).length;

// Анализ: любимые магазины
const storeStats = packages
  .filter((p) => p.store)
  .reduce((acc, p) => {
    acc[p.store] = (acc[p.store] || 0) + 1;
    return acc;
  }, {});
```
