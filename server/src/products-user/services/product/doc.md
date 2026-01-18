# Product Services - Документация

Группа сервисов для работы с пользовательскими продуктами (CRUD операции).

---

## CreateProductUserService

**Файл:** `create-product-user.service.ts`

**Назначение:** Создание нового пользовательского продукта с локализацией и пищевой ценностью.

### Метод: `execute(userId, dto)`

**Описание:**
Создает новый продукт пользователя в транзакции, включая запись в таблицы `ProductUser`, `ProductUserI18n` и `NutritionUserPer100`. Валидирует связанные сущности (категория, бренд, глобальный продукт) перед созданием.

**Параметры:**

- `userId` (string) - ID пользователя-владельца продукта
- `dto` (CreateProductUserDto) - Данные для создания продукта
  - `name` (string, 2-200 символов) - Название продукта
  - `lang?` (Language, default: RU) - Язык названия
  - `barcode?` (string, 8-13 цифр) - Штрихкод продукта
  - `categoryId?` (string) - ID категории
  - `brandId?` (string) - ID бренда (одобренный или созданный текущим пользователем)
  - `productGlobalId?` (string) - ID глобального продукта
  - `nutrition` (NutritionDto) - Пищевая ценность на 100г/100мл
    - `caloriesKcal` (number, 0-9999) - Калории (ккал)
    - `proteinsG` (number, 0-999.99) - Белки (г)
    - `fatsG` (number, 0-999.99) - Жиры (г)
    - `carbohydratesG` (number, 0-999.99) - Углеводы (г)
    - `sugarsG?` (number, 0-999.99) - Сахара (г)
    - `fiberG?` (number, 0-999.99) - Клетчатка (г)
    - `saltG?` (number, 0-999.99) - Соль (г)

**Возвращаемое значение:**
Объект ProductUser с включениями:

- `names[]` - локализованные названия
- `nutrition` - пищевая ценность
- `category` - категория (если указана)
- `brand` - бренд (если указан)
- `productGlobal` - глобальный продукт (если указан)

**Исключения:**

- `NotFoundException` - если categoryId, brandId или productGlobalId не существуют
- `BadRequestException` - если бренд не прошел модерацию И создан другим пользователем

**Особенности:**

- Использует транзакцию для атомарности операций
- Автоматически создает первую i18n запись с указанным языком
- Создает nutrition запись со всеми полями (обязательными и опциональными)
- Все связи (category, brand, productGlobal) опциональны

**Пример использования:**

```typescript
const product = await createProductUserService.execute('user-id', {
  name: 'Молоко 3.2%',
  lang: 'RU',
  barcode: '4607065097981',
  categoryId: 'category-id',
  brandId: 'brand-id',
  nutrition: {
    caloriesKcal: 59,
    proteinsG: 2.8,
    fatsG: 3.2,
    carbohydratesG: 4.7,
    sugarsG: 4.7,
    fiberG: 0,
    saltG: 0.1,
  },
});
```

---

## UpdateProductUserService

**Файл:** `update-product-user.service.ts`

**Назначение:** Обновление существующего пользовательского продукта.

### Метод: `execute(productId, userId, isAdmin, dto)`

**Описание:**
Обновляет продукт пользователя в транзакции. Проверяет права доступа (владелец или админ). Поддерживает обновление названия (через upsert i18n), связей и пищевой ценности. Позволяет удалять связи передачей null.

**Параметры:**

- `productId` (string) - ID продукта для обновления
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором
- `dto` (UpdateProductUserDto) - Данные для обновления (все поля опциональны)
  - `name?` (string, 2-200 символов) - Новое название
  - `lang?` (Language) - Язык для обновления названия
  - `barcode?` (string, 8-13 цифр) - Новый штрихкод
  - `categoryId?` (string | null) - ID категории или null для удаления связи
  - `brandId?` (string | null) - ID бренда или null
  - `productGlobalId?` (string | null) - ID глобального продукта или null
  - `nutrition?` (NutritionUpdateDto) - Обновление пищевой ценности
    - Все поля опциональны (caloriesKcal?, proteinsG?, fatsG?, carbohydratesG?, sugarsG?, fiberG?, saltG?)

**Возвращаемое значение:**
Обновленный объект ProductUser с включениями (names, nutrition, category, brand, productGlobal)

**Исключения:**

- `NotFoundException` - если продукт, categoryId, brandId или productGlobalId не существуют
- `ForbiddenException` - если пользователь не является владельцем и не администратор
- `BadRequestException` - если новый бренд не прошел модерацию И создан другим пользователем

**Особенности:**

- Использует транзакцию для атомарности
- Обновление названия: upsert в ProductUserI18n по unique constraint (productUserId + lang)
- Поддержка null для удаления связей (categoryId, brandId, productGlobalId)
- Selective update: обновляются только переданные поля
- Валидация прав доступа: владелец или админ

**Пример использования:**

```typescript
const updated = await updateProductUserService.execute(
  'product-id',
  'user-id',
  false,
  {
    name: 'Молоко 2.5%',
    lang: 'RU',
    brandId: 'new-brand-id',
    nutrition: {
      fatsG: 2.5,
    },
  },
);
```

---

## DeleteProductUserService

**Файл:** `delete-product-user.service.ts`

**Назначение:** Удаление пользовательского продукта.

### Метод: `execute(productId, userId, isAdmin)`

**Описание:**
Удаляет продукт пользователя. Проверяет права доступа (владелец или админ). TODO: добавить проверку использования продукта в планах питания (когда модуль MealPlan будет реализован). Каскадное удаление обрабатывается на уровне БД.

**Параметры:**

- `productId` (string) - ID продукта для удаления
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором

**Возвращаемое значение:**

```typescript
{
  message: 'Продукт успешно удален';
}
```

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем и не администратор

**Особенности:**

- Каскадное удаление: ProductUserI18n, NutritionUserPer100, ProductUserPackage, ProductUserServing удаляются автоматически
- TODO: добавить проверку использования в MealPlan (при реализации модуля)
- Валидация прав доступа: владелец или админ

**Пример использования:**

```typescript
const result = await deleteProductUserService.execute(
  'product-id',
  'user-id',
  false,
);
```

---

## GetProductUserService

**Файл:** `get-product-user.service.ts`

**Назначение:** Получение детальной информации о пользовательском продукте.

### Метод: `execute(productId, userId, isAdmin)`

**Описание:**
Возвращает полную информацию о продукте со всеми связями и данными. Проверяет права доступа (владелец или админ). Включает локализации, пищевую ценность, связанные сущности, историю покупок и порции.

**Параметры:**

- `productId` (string) - ID продукта
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором

**Возвращаемое значение:**
Объект ProductUser с включениями:

- `names[]` - все локализованные названия (productUserId, lang, name)
- `nutrition` - пищевая ценность на 100г/100мл
- `category` - категория (если указана)
- `brand` - бренд (если указан)
- `productGlobal` - глобальный продукт с вложенными names и nutrition (если указан)
- `packages[]` - история покупок (сортировка по purchasedAt DESC)
- `servings[]` - пользовательские порции (default first, затем по дате создания)
- `user` - информация о владельце (id, email)

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем и не администратор

**Особенности:**

- Полная информация со всеми связями
- Сортировка packages по дате покупки (новые первые)
- Сортировка servings по isDefault DESC, затем createdAt ASC (default порция первая)
- Включает вложенный productGlobal с его names и nutrition
- Валидация прав доступа: владелец или админ

**Пример использования:**

```typescript
const product = await getProductUserService.execute(
  'product-id',
  'user-id',
  false,
);
```

---

## ListProductsUserService

**Файл:** `list-products-user.service.ts`

**Назначение:** Получение списка всех пользовательских продуктов (только для администраторов).

### Метод: `execute(page, limit, categoryId?, brandId?, userId?)`

**Описание:**
Возвращает пагинированный список продуктов пользователей с фильтрами. Эндпоинт доступен только администраторам. Поддерживает фильтрацию по категории, бренду и владельцу.

**Параметры:**

- `page` (number) - Номер страницы (начиная с 1)
- `limit` (number) - Количество записей на странице
- `categoryId?` (string) - Фильтр по категории (опционально)
- `brandId?` (string) - Фильтр по бренду (опционально)
- `userId?` (string) - Фильтр по владельцу (опционально)

**Возвращаемое значение:**

```typescript
{
  products: ProductUser[],  // с включениями: names, nutrition, category, brand, user, _count packages/servings
  pagination: {
    total: number,          // Общее количество записей
    page: number,           // Текущая страница
    limit: number,          // Записей на странице
    totalPages: number,     // Всего страниц
  }
}
```

**Исключения:**
Нет (доступ контролируется на уровне контроллера через @Roles('admin'))

**Особенности:**

- Только для администраторов
- Пагинация: skip = (page - 1) \* limit
- Множественные фильтры можно комбинировать
- Включает \_count для packages и servings
- Сортировка по дате создания (DESC)

**Пример использования:**

```typescript
const result = await listProductsUserService.execute(
  1, // page
  20, // limit
  'category-id', // categoryId
  undefined, // brandId
  'user-id', // userId
);
```

---

## ListMyProductsUserService

**Файл:** `list-my-products-user.service.ts`

**Назначение:** Получение списка продуктов текущего пользователя.

### Метод: `execute(userId, page, limit, categoryId?, brandId?)`

**Описание:**
Возвращает пагинированный список продуктов владельца. Фильтрация только по своим продуктам с опциональными фильтрами по категории и бренду.

**Параметры:**

- `userId` (string) - ID пользователя-владельца
- `page` (number) - Номер страницы (начиная с 1)
- `limit` (number) - Количество записей на странице
- `categoryId?` (string) - Фильтр по категории (опционально)
- `brandId?` (string) - Фильтр по бренду (опционально)

**Возвращаемое значение:**

```typescript
{
  products: ProductUser[],  // с включениями: names, nutrition, category, brand, _count packages/servings
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
  }
}
```

**Исключения:**
Нет (userId берется из JWT токена)

**Особенности:**

- Автоматическая фильтрация по userId
- Включает \_count для packages и servings
- Не включает информацию о user (поскольку это свои продукты)
- Пагинация и фильтры аналогичны ListProductsUserService
- Сортировка по дате создания (DESC)

**Пример использования:**

```typescript
const result = await listMyProductsUserService.execute(
  'user-id',
  1,
  20,
  'category-id',
  'brand-id',
);
```

---

## SearchProductsUserService

**Файл:** `search-products-user.service.ts`

**Назначение:** Поиск продуктов пользователя по названию.

### Метод: `execute(userId, query)`

**Описание:**
Выполняет поиск по названиям продуктов текущего пользователя во всех языках (таблица ProductUserI18n). Поиск регистронезависимый с оператором contains. Лимит 50 результатов.

**Параметры:**

- `userId` (string) - ID пользователя-владельца
- `query` (string) - Строка поиска (без минимальной длины)

**Возвращаемое значение:**
Массив объектов ProductUser (максимум 50) с включениями:

- `names[]` - локализованные названия
- `nutrition` - пищевая ценность
- `category` - категория
- `brand` - бренд

**Исключения:**
Нет (пустой массив если ничего не найдено)

**Особенности:**

- Поиск в ProductUserI18n.name (case-insensitive contains)
- Автоматическая фильтрация по userId владельца продукта
- Лимит 50 результатов для производительности
- Поиск по всем языкам одновременно
- Не требует минимальной длины query (но рекомендуется 2+ символа)

**Пример использования:**

```typescript
const results = await searchProductsUserService.execute('user-id', 'молоко');
```
