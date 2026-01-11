# Photo Services - Документация

## UploadBrandPhotoService

**Файл:** `upload-brand-photo.service.ts`

**Назначение:** Загрузка фотографии бренда в Cloudinary

### Метод: `execute(id, file, userId, isAdmin)`

**Описание:**
Загружает изображение в Cloudinary (папка 'brands'), добавляет URL в массив photos бренда. Доступно администратору или создателю бренда.

**Параметры:**

- `id` (string) - ID бренда
- `file` (Express.Multer.File) - Загружаемый файл (из FormData)
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Флаг администратора

**Возвращаемое значение:**

```typescript
{
  message: string; // "Фото успешно загружено"
  photoUrl: string; // URL загруженного фото
  totalPhotos: number; // Общее количество фото после загрузки
}
```

**Исключения:**

- `NotFoundException` - если бренд не найден
- `BadRequestException` - если пользователь не админ и не создатель бренда
- Ошибки CloudinaryService (неверный формат, превышен размер)

**Особенности:**

- Проверка прав доступа: `isAdmin OR createdBy === userId`
- Загрузка в Cloudinary с автоматической оптимизацией (resize, format, quality)
- URL добавляется в конец массива через `push`
- Ограничения CloudinaryService: JPEG/PNG/WebP, макс 5MB

**Пример использования:**

```typescript
const result = await uploadBrandPhotoService.execute(
  'brand-id',
  file,
  'user-id',
  false,
);
// { message: "Фото успешно загружено", photoUrl: "https://...", totalPhotos: 3 }
```

## DeleteBrandPhotoService

**Файл:** `delete-brand-photo.service.ts`

**Назначение:** Удаление фотографии бренда из Cloudinary и базы данных

### Метод: `execute(id, photoUrl)`

**Описание:**
Удаляет изображение из Cloudinary, затем удаляет URL из массива photos бренда. Доступно только администратору.

**Параметры:**

- `id` (string) - ID бренда
- `photoUrl` (string) - URL фото для удаления

**Возвращаемое значение:**

```typescript
{
  message: string; // "Фото успешно удалено"
  totalPhotos: number; // Количество оставшихся фото
}
```

**Исключения:**

- `NotFoundException` - если бренд не найден
- `BadRequestException` - если photoUrl не найден в массиве photos

**Особенности:**

- Удаление из Cloudinary НЕ блокирует удаление из БД (ошибка логируется, но процесс продолжается)
- URL удаляется через `filter` (создается новый массив без указанного URL)
- Проверка наличия URL перед удалением
- Операция идемпотентна в Cloudinary (повторное удаление не вызывает ошибку)

**Пример использования:**

```typescript
const result = await deleteBrandPhotoService.execute(
  'brand-id',
  'https://res.cloudinary.com/.../photo.jpg',
);
// { message: "Фото успешно удалено", totalPhotos: 2 }
```

## Работа с Cloudinary

### CloudinaryService

Сервис используется обоими операциями:

- `uploadImage(file, folder)` - загрузка с оптимизацией
- `deleteImage(url)` - удаление по URL

### Настройки загрузки

- **Папка**: `brands` (изолирована от других сущностей)
- **Формат**: auto (предпочтительно WebP для оптимизации)
- **Размер**: resize до 800x800px
- **Качество**: auto (баланс качества/размера)

### Обработка ошибок

- Ошибки загрузки пробрасываются в контроллер
- Ошибки удаления логируются, но НЕ блокируют операцию
- Причина: если файл уже удален из Cloudinary, URL все равно должен быть удален из БД

### Безопасность

- Валидация формата файла (только изображения)
- Ограничение размера (макс 5MB)
- Извлечение `public_id` из URL для удаления
