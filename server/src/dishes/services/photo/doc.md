# Photo Services - Документация

Сервисы для управления фотографиями блюд.

---

## AddDishPhotoService

**Файл:** `add-dish-photo.service.ts`

**Назначение:** Добавляет URL фото в массив фотографий блюда

### Метод: `execute(userId, dishId, photoUrl)`

**Описание:**
Находит блюдо по ID, проверяет права доступа, добавляет новый URL фото в массив `photos`.

**Параметры:**

- `userId` (string) - ID пользователя-владельца
- `dishId` (string) - ID блюда
- `photoUrl` (string) - URL фото с Cloudinary

**Возвращаемое значение:**
Обновленный объект блюда с добавленным фото.

**Исключения:**

- `NotFoundException` - блюдо не найдено
- `ForbiddenException` - попытка добавить фото к чужому блюду

**Особенности:**

- Использует Prisma `push` для добавления в массив
- Не проверяет дубликаты URL (можно добавить одно фото несколько раз)
- Не ограничивает количество фото

**Пример использования:**

```typescript
const updatedDish = await addDishPhotoService.execute(
  'user-uuid',
  'dish-uuid',
  'https://res.cloudinary.com/.../photo.jpg',
);
```

---

## RemoveDishPhotoService

**Файл:** `remove-dish-photo.service.ts`

**Назначение:** Удаляет URL фото из массива фотографий блюда

### Метод: `execute(userId, dishId, photoUrl)`

**Описание:**
Находит блюдо по ID, проверяет права доступа и наличие фото, удаляет URL из массива `photos`.

**Параметры:**

- `userId` (string) - ID пользователя-владельца
- `dishId` (string) - ID блюда
- `photoUrl` (string) - URL фото для удаления

**Возвращаемое значение:**
Обновленный объект блюда без удаленного фото.

**Исключения:**

- `NotFoundException` - блюдо не найдено или фото не найдено в блюде
- `ForbiddenException` - попытка удалить фото из чужого блюда

**Особенности:**

- Проверяет наличие фото в массиве перед удалением
- Использует `filter` для создания нового массива без указанного URL
- НЕ удаляет само изображение из Cloudinary (это делается в контроллере через CloudinaryService)

**Пример использования:**

```typescript
const updatedDish = await removeDishPhotoService.execute(
  'user-uuid',
  'dish-uuid',
  'https://res.cloudinary.com/.../photo.jpg',
);
```

---

## Типичный workflow

1. **Загрузка фото:**
   - Клиент отправляет `multipart/form-data` с файлом
   - Контроллер вызывает `CloudinaryService.uploadImage()`
   - Получает URL с Cloudinary
   - Вызывает `AddDishPhotoService.execute()` с полученным URL

2. **Удаление фото:**
   - Клиент отправляет URL фото для удаления
   - Контроллер вызывает `RemoveDishPhotoService.execute()`
   - Затем вызывает `CloudinaryService.deleteImage()` для удаления из Cloudinary
   - Фото удаляется и из БД, и из хранилища
