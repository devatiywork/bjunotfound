# Category Services - Документация

## CreateCategoryService

**Файл:** `create-category.service.ts`

**Назначение:** Создание новой категории продуктов с автогенерацией slug

### Метод: `execute(dto: CreateCategoryDto)`

**Описание:**
Создаёт новую категорию в базе данных. Если slug не указан, генерирует его автоматически из названия с транслитерацией. Проверяет существование родительской категории и уникальность slug.

**Параметры:**

- `dto` (CreateCategoryDto) - данные для создания категории:
  - `name*` (string) - название категории (2-100 символов)
  - `slug?` (string) - slug для URL (опционально, генерируется автоматически)
  - `parentId?` (string) - ID родительской категории
  - `photos?` (string[]) - массив URL фотографий
  - `isActive?` (boolean) - активна ли категория (по умолчанию true)

**Возвращаемое значение:**
Объект созданной категории со всеми полями

**Исключения:**

- `BadRequestException` - если родительская категория не найдена или slug уже занят

**Особенности:**

- Автоматическая транслитерация: "Молочные продукты" → "molochnye-produkty"
- Если slug занят, добавляется суффикс: "dairy-2", "dairy-3"
- Проверка существования parentId перед созданием

**Пример использования:**

```typescript
const category = await createCategoryService.execute({
  name: 'Молочные продукты',
  parentId: null,
  isActive: true,
});
// Результат: { id: 'uuid', name: '...', slug: 'molochnye-produkty', ... }
```

---

## UpdateCategoryService

**Файл:** `update-category.service.ts`

**Назначение:** Обновление существующей категории с проверкой циклических зависимостей

### Метод: `execute(id: string, dto: UpdateCategoryDto)`

**Описание:**
Обновляет категорию по ID. Проверяет циклические зависимости при изменении parentId, уникальность slug и существование связанных сущностей.

**Параметры:**

- `id` (string) - ID обновляемой категории
- `dto` (UpdateCategoryDto) - данные для обновления (все поля опциональны):
  - `name?` (string) - новое название
  - `slug?` (string) - новый slug
  - `parentId?` (string | null) - новый родитель (null для корневой категории)
  - `photos?` (string[]) - новый массив фотографий
  - `isActive?` (boolean) - новый статус активности

**Возвращаемое значение:**
Объект обновлённой категории

**Исключения:**

- `NotFoundException` - если категория не найдена
- `BadRequestException` - если:
  - Родительская категория не найдена
  - Попытка установить себя в качестве родителя
  - Обнаружена циклическая зависимость
  - Slug уже занят другой категорией

**Особенности:**

- Рекурсивная проверка циклов в дереве категорий
- Частичное обновление (только переданные поля)
- Проверка уникальности slug только если он изменился

**Пример использования:**

```typescript
const updated = await updateCategoryService.execute('uuid', {
  name: 'Молочная продукция',
  isActive: false,
});
```

### Приватный метод: `checkCyclicDependency(categoryId, newParentId, visited)`

**Описание:**
Рекурсивно проверяет, не создаст ли смена родителя циклическую зависимость в дереве категорий.

**Логика:**

1. Проверяет, не является ли новый родитель самой категорией
2. Проверяет, не посещался ли уже этот узел (обнаружение цикла)
3. Рекурсивно поднимается по дереву предков
4. Возвращает true при обнаружении цикла

---

## DeleteCategoryService

**Файл:** `delete-category.service.ts`

**Назначение:** Удаление категории с проверкой связанных данных

### Метод: `execute(id: string)`

**Описание:**
Удаляет категорию из базы данных. Перед удалением проверяет, нет ли у категории подкатегорий или продуктов.

**Параметры:**

- `id` (string) - ID удаляемой категории

**Возвращаемое значение:**

```typescript
{
  message: 'Категория успешно удалена',
  deletedId: string
}
```

**Исключения:**

- `NotFoundException` - если категория не найдена
- `BadRequestException` - если:
  - У категории есть подкатегории
  - В категории есть продукты (productsGlobal или productsUser)

**Особенности:**

- Физическое удаление из БД (не soft delete)
- Защита от удаления категорий с данными
- Показывает количество связанных сущностей в сообщении об ошибке

**Пример использования:**

```typescript
const result = await deleteCategoryService.execute('uuid');
// Результат: { message: '...', deletedId: 'uuid' }
```

---

## GetCategoryService

**Файл:** `get-category.service.ts`

**Назначение:** Получение категории по ID или slug

### Метод: `execute(id: string, isAdmin: boolean = false)`

**Описание:**
Получает детальную информацию о категории по ID с родителем, детьми и подсчётом продуктов.

**Параметры:**

- `id` (string) - ID категории
- `isAdmin` (boolean) - является ли запрашивающий администратором

**Возвращаемое значение:**
Объект категории с:

- `parent` - родительская категория (id, name, slug)
- `children[]` - массив дочерних категорий
- `_count` - подсчёт productsGlobal и productsUser

**Исключения:**

- `NotFoundException` - если категория не найдена или неактивна (для не-админов)

**Особенности:**

- Неактивные категории видны только админам
- Дочерние категории фильтруются по isActive для не-админов

### Метод: `executeBySlug(slug: string, isAdmin: boolean = false)`

**Описание:**
Аналогично execute(), но поиск по slug вместо ID.

**Параметры:**

- `slug` (string) - slug категории
- `isAdmin` (boolean) - является ли запрашивающий администратором

**Пример использования:**

```typescript
const category = await getCategoryService.execute('uuid', false);
const bySslug = await getCategoryService.executeBySlug('dairy', false);
```

---

## ListCategoriesService

**Файл:** `list-categories.service.ts`

**Назначение:** Получение отфильтрованного списка категорий

### Метод: `execute(query, isAdmin: boolean = false)`

**Описание:**
Возвращает список категорий с фильтрацией, поиском и подсчётом.

**Параметры:**

- `query` (object):
  - `onlyActive?` (boolean) - показать только активные
  - `parentId?` (string | null) - фильтр по родителю (null = корневые)
  - `search?` (string) - поиск по названию (case-insensitive)
- `isAdmin` (boolean) - является ли запрашивающий администратором

**Возвращаемое значение:**

```typescript
{
  categories: Category[], // массив категорий
  total: number // общее количество
}
```

**Особенности:**

- По умолчанию onlyActive=true для не-админов
- Поиск с ILIKE (без учёта регистра)
- Сортировка по name (алфавит)
- Включает подсчёт children, productsGlobal, productsUser

**Пример использования:**

```typescript
const { categories, total } = await listCategoriesService.execute(
  {
    onlyActive: true,
    parentId: null, // только корневые
    search: 'молоч',
  },
  false,
);
```

---

## GetCategoryTreeService

**Файл:** `get-category-tree.service.ts`

**Назначение:** Построение иерархического дерева категорий

### Метод: `execute(isAdmin: boolean = false)`

**Описание:**
Возвращает все категории в виде вложенной структуры (дерево).

**Параметры:**

- `isAdmin` (boolean) - является ли запрашивающий администратором

**Возвращаемое значение:**

```typescript
{
  tree: CategoryTreeNode[] // массив корневых категорий с вложенными children
}
```

**Особенности:**

- Один запрос к БД для всех категорий
- Построение дерева в памяти (эффективно)
- Фильтрация по isActive для не-админов
- Рекурсивная структура с неограниченной вложенностью

**Пример использования:**

```typescript
const { tree } = await getCategoryTreeService.execute(false);
// Результат: [{ id, name, slug, children: [{ ... }] }]
```

### Приватный метод: `buildTree(categories, parentId)`

**Описание:**
Рекурсивно строит дерево из плоского списка категорий.

**Логика:**

1. Находит все категории с указанным parentId
2. Для каждой найденной категории рекурсивно строит дочерние узлы
3. Возвращает массив узлов текущего уровня

---

## UploadPhotoService

**Файл:** `upload-photo.service.ts`

**Назначение:** Загрузка фотографии категории в Cloudinary

### Метод: `execute(id: string, file: Express.Multer.File)`

**Описание:**
Загружает изображение в Cloudinary и добавляет URL в массив photos категории.

**Параметры:**

- `id` (string) - ID категории
- `file` (Express.Multer.File) - файл изображения из multer

**Возвращаемое значение:**

```typescript
{
  message: 'Фото успешно загружено',
  photoUrl: string, // URL загруженного фото
  category: {
    id: string,
    photos: string[] // обновлённый массив фотографий
  }
}
```

**Исключения:**

- `NotFoundException` - если категория не найдена
- `BadRequestException` - если неверный формат/размер файла (от CloudinaryService)

**Особенности:**

- Загрузка в папку 'categories' на Cloudinary
- Валидация формата (JPEG, PNG, WebP)
- Валидация размера (макс 5MB)
- Автоматическая оптимизация (resize до 800x800px, quality auto, format auto)
- Использует Prisma `push` для добавления URL в массив

**Пример использования:**

```typescript
const result = await uploadPhotoService.execute('uuid', file);
```

---

## DeletePhotoService

**Файл:** `delete-photo.service.ts`

**Назначение:** Удаление фотографии категории

### Метод: `execute(id: string, photoUrl: string)`

**Описание:**
Удаляет фотографию из Cloudinary и удаляет URL из массива photos категории.

**Параметры:**

- `id` (string) - ID категории
- `photoUrl` (string) - URL удаляемой фотографии

**Возвращаемое значение:**

```typescript
{
  message: 'Фото успешно удалено',
  category: {
    id: string,
    photos: string[] // обновлённый массив фотографий
  }
}
```

**Исключения:**

- `NotFoundException` - если категория или фото не найдено

**Особенности:**

- Проверяет наличие URL в массиве photos
- Удаляет фото из Cloudinary (с обработкой ошибок)
- Продолжает работу, даже если фото не удалось удалить из Cloudinary
- Использует filter() для удаления URL из массива

**Пример использования:**

```typescript
const result = await deletePhotoService.execute(
  'uuid',
  'https://cloudinary.com/photo.jpg',
);
```

---

## Общие принципы работы сервисов

**Dependency Injection:**
Все сервисы инжектят `PrismaService` для доступа к БД. Сервисы загрузки фото дополнительно инжектят `CloudinaryService`.

**Обработка ошибок:**

- `NotFoundException` - ресурс не найден (404)
- `BadRequestException` - невалидные данные или бизнес-правила нарушены (400)

**Архитектура:**
Следуем паттерну Single Responsibility - каждый сервис отвечает за одну операцию. Главный `CategoriesService` координирует вызовы специализированных сервисов.
