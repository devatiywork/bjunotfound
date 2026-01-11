# Photo Services - Документация

Группа сервисов для работы с фотографиями пользовательских продуктов (загрузка/удаление через Cloudinary).

---

## UploadProductUserPhotoService

**Файл:** `upload-product-user-photo.service.ts`

**Назначение:** Загрузка фотографии продукта в Cloudinary и добавление URL в массив photos.

### Метод: `execute(productId, userId, isAdmin, file)`

**Описание:**
Загружает фотографию продукта в Cloudinary (папка 'products-user'), добавляет URL в массив photos продукта. Проверяет права доступа (владелец или админ). Поддерживает форматы JPEG, PNG, WebP с автоматической оптимизацией.

**Параметры:**

- `productId` (string) - ID продукта для загрузки фото
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором
- `file` (Express.Multer.File) - Файл изображения из multipart/form-data

**Возвращаемое значение:**

```typescript
{
  message: 'Фотография успешно загружена',
  photoUrl: string,        // URL фотографии в Cloudinary
  totalPhotos: number,     // Общее количество фотографий после добавления
}
```

**Исключения:**

- `NotFoundException` - если продукт не существует
- `ForbiddenException` - если пользователь не является владельцем и не администратор
- `BadRequestException` - если файл не передан или неверный формат (из CloudinaryService)

**Особенности:**

- Загрузка в папку 'products-user' в Cloudinary
- Автоматическая оптимизация: resize до 800x800px, quality auto, format auto (WebP)
- Валидация формата: JPEG, PNG, WebP
- Валидация размера: максимум 5MB (из CloudinaryService)
- Push URL в массив photos (не заменяет существующие)
- Права доступа: владелец или админ

**Пример использования:**

```typescript
const result = await uploadProductUserPhotoService.execute(
  'product-id',
  'user-id',
  false,
  file, // Express.Multer.File из multipart/form-data
);
// result: { message: '...', photoUrl: 'https://...', totalPhotos: 3 }
```

**Использование в контроллере:**

```typescript
@Post(':id/photos')
@UseInterceptors(FileInterceptor('photo'))
async uploadPhoto(
  @Request() req,
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
) {
  const isAdmin = req.user.role === 'admin';
  return this.productsUserService.uploadPhoto(id, req.user.id, isAdmin, file);
}
```

---

## DeleteProductUserPhotoService

**Файл:** `delete-product-user-photo.service.ts`

**Назначение:** Удаление фотографии продукта из Cloudinary и массива photos.

### Метод: `execute(productId, userId, isAdmin, photoUrl)`

**Описание:**
Удаляет фотографию из Cloudinary и удаляет URL из массива photos продукта. Проверяет права доступа (владелец или админ). Если удаление из Cloudinary не удается, логирует ошибку, но продолжает удаление из БД.

**Параметры:**

- `productId` (string) - ID продукта
- `userId` (string) - ID текущего пользователя
- `isAdmin` (boolean) - Является ли пользователь администратором
- `photoUrl` (string) - URL фотографии для удаления (должен быть в массиве photos)

**Возвращаемое значение:**

```typescript
{
  message: 'Фотография успешно удалена',
  totalPhotos: number,     // Количество фотографий после удаления
}
```

**Исключения:**

- `NotFoundException` - если продукт не существует или photoUrl не найден в массиве photos
- `ForbiddenException` - если пользователь не является владельцем и не администратор

**Особенности:**

- Удаление из Cloudinary через CloudinaryService.deletePhoto()
- Graceful degradation: если удаление из Cloudinary не удается, ошибка логируется, но удаление из БД продолжается
- Фильтрация URL из массива photos (сохраняет все кроме удаляемого)
- Проверка наличия URL в photos перед удалением
- Права доступа: владелец или админ

**Пример использования:**

```typescript
const result = await deleteProductUserPhotoService.execute(
  'product-id',
  'user-id',
  false,
  'https://res.cloudinary.com/...',
);
// result: { message: '...', totalPhotos: 2 }
```

**Использование в контроллере:**

```typescript
@Delete(':id/photos')
async deletePhoto(
  @Request() req,
  @Param('id') id: string,
  @Query('photoUrl') photoUrl: string,
) {
  const isAdmin = req.user.role === 'admin';
  return this.productsUserService.deletePhoto(id, req.user.id, isAdmin, photoUrl);
}
```

**Важная деталь:**
Ошибки удаления из Cloudinary не блокируют операцию:

```typescript
try {
  await this.cloudinary.deletePhoto(photoUrl);
} catch (error) {
  console.error('Ошибка удаления фото из Cloudinary:', error);
  // Продолжаем удаление из БД
}
```
