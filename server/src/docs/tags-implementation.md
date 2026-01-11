# Tags Module - План реализации

## 1. Схема базы данных

### Модель Tag (добавить в schema.prisma)

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique // название тега
  slug      String   @unique // URL-безопасный ключ
  color     String?  // цвет для UI (HEX: #FF5733)
  icon      String?  // emoji или название иконки
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  dishes    DishTag[] // связь многие-ко-многим с блюдами
  
  @@map("tags")
}

model DishTag {
  dishId String
  tagId  String
  
  dish Dish @relation(fields: [dishId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([dishId, tagId])
  @@map("dish_tags")
}
```

**Примечание:** Модель Dish будет создана позже, но связь нужно предусмотреть сейчас.

---

## 2. DTOs

### CreateTagDto
```typescript
{
  name: string;      // обязательно, 2-50 символов
  color?: string;    // опционально, HEX формат #RRGGBB
  icon?: string;     // опционально, 1-10 символов (emoji/название)
}
```

**Валидация:**
- `name`: @IsString(), @MinLength(2), @MaxLength(50)
- `color`: @IsOptional(), @Matches(/^#[0-9A-Fa-f]{6}$/)
- `icon`: @IsOptional(), @MinLength(1), @MaxLength(10)

### UpdateTagDto
```typescript
{
  name?: string;     // опционально, 2-50 символов
  color?: string;    // опционально, HEX формат
  icon?: string;     // опционально, 1-10 символов
}
```

**Валидация:** те же правила, но все поля опциональны

---

## 3. Специализированные сервисы

### CreateTagService
**Файл:** `services/tag/create-tag.service.ts`

**Логика:**
1. Генерация slug из name через утилиту `generateSlug()`
2. Проверка уникальности name и slug
3. Создание тега

**Ошибки:**
- `BadRequestException` - тег с таким названием/slug уже существует

---

### UpdateTagService
**Файл:** `services/tag/update-tag.service.ts`

**Логика:**
1. Проверка существования тега
2. Если меняется name - регенерация slug
3. Проверка уникальности нового name/slug
4. Обновление тега

**Ошибки:**
- `NotFoundException` - тег не найден
- `BadRequestException` - новое название дублирует существующий тег

---

### DeleteTagService
**Файл:** `services/tag/delete-tag.service.ts`

**Логика:**
1. Проверка существования тега
2. Подсчет использования в блюдах через DishTag
3. Если используется - ошибка, иначе удаление

**Ошибки:**
- `NotFoundException` - тег не найден
- `BadRequestException` - тег используется в N блюдах

---

### GetTagService
**Файл:** `services/tag/get-tag.service.ts`

**Логика:**
1. Поиск тега по ID
2. Включение подсчета использований в блюдах

**Ошибки:**
- `NotFoundException` - тег не найден

---

### ListTagsService
**Файл:** `services/tag/list-tags.service.ts`

**Логика:**
1. Получение всех тегов
2. Включение подсчета использований в блюдах
3. Сортировка по name (алфавит)

**Возвращает:** массив тегов

---

## 4. Структура модуля

```
src/tags/
  dto/
    create-tag.dto.ts
    update-tag.dto.ts
  services/
    tag/
      create-tag.service.ts
      update-tag.service.ts
      delete-tag.service.ts
      get-tag.service.ts
      list-tags.service.ts
      doc.md
    index.ts
  tags.service.ts       ← координатор
  tags.controller.ts
  tags.module.ts
```

---

## 5. Endpoints

### GET /tags
**Доступ:** публичный  
**Описание:** Список всех тегов  
**Ответ:** массив тегов с подсчетом использований

### GET /tags/:id
**Доступ:** публичный  
**Описание:** Получить тег по ID  
**Ответ:** объект тега

### POST /tags
**Доступ:** только админ (@Roles('admin'))  
**Описание:** Создать тег  
**Body:** CreateTagDto  
**Ответ:** созданный тег

### PATCH /tags/:id
**Доступ:** только админ (@Roles('admin'))  
**Описание:** Обновить тег  
**Body:** UpdateTagDto  
**Ответ:** обновленный тег

### DELETE /tags/:id
**Доступ:** только админ (@Roles('admin'))  
**Описание:** Удалить тег  
**Ответ:** { message: "Тег успешно удален" }

---

## 6. Утилита generateSlug

**Файл:** `src/utils/slug.utils.ts` (уже существует для категорий)

**Использование:** транслитерация + lowercase + замена пробелов на дефисы

Пример:
- "Вегетарианское" → "vegetarianskoe"
- "Low Carb" → "low-carb"
- "Без глютена" → "bez-glyutena"

---

## 7. Guards и авторизация

- `GET /tags` - публичный (без guard)
- `GET /tags/:id` - публичный (без guard)
- `POST /tags` - @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')
- `PATCH /tags/:id` - @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')
- `DELETE /tags/:id` - @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')

---

## 8. Swagger документация

**Inline в контроллере:**
- @ApiTags('Теги')
- @ApiBearerAuth('JWT-auth') для защищенных endpoints
- @ApiOperation() для каждого метода
- @ApiResponse() для всех возможных статусов
- @ApiProperty() в DTOs

---

## 9. Порядок разработки

1. ✅ **Создать план реализации** (этот документ)
2. 📝 Добавить модели Tag и DishTag в schema.prisma
3. 📝 Создать миграцию
4. 📝 Создать DTOs (Create, Update) с валидацией
5. 📝 Создать 5 специализированных сервисов
6. 📝 Создать главный TagsService (координатор)
7. 📝 Создать TagsController с 5 endpoints
8. 📝 Создать TagsModule
9. 📝 Зарегистрировать в AppModule
10. 📝 Создать doc.md для сервисов
11. 📝 Создать src/docs/tags-api.md с curl примерами
12. 📝 npm run build - проверка сборки

---

## 10. Примеры использования

### Создание тега
```json
{
  "name": "Вегетарианское",
  "color": "#00C853",
  "icon": "🥗"
}
```

### Ответ
```json
{
  "id": "uuid",
  "name": "Вегетарианское",
  "slug": "vegetarianskoe",
  "color": "#00C853",
  "icon": "🥗",
  "createdAt": "2024-01-11T12:00:00Z",
  "updatedAt": "2024-01-11T12:00:00Z",
  "_count": {
    "dishes": 0
  }
}
```

---

## 11. Особенности реализации

- **Простая модель:** нет i18n, нет модерации, нет фото
- **Публичные списки:** все могут видеть теги
- **CRUD только админ:** создание/редактирование/удаление
- **Защита от удаления:** нельзя удалить тег, используемый в блюдах
- **Slug автогенерация:** из названия тега
- **Уникальность:** name и slug должны быть уникальны
- **Цвет опционален:** для удобства UI (цветные метки)
- **Иконка опционален:** emoji или название из библиотеки иконок

---

## 12. Связь с блюдами (будущее)

Когда будет создан модуль Dishes:
- Блюдо может иметь несколько тегов
- Тег может быть у нескольких блюд
- Связь через таблицу DishTag (многие-ко-многим)
- При удалении блюда - связи удаляются каскадно
- При удалении тега - проверка использования

---

## Готовность к реализации ✅

План готов. Все детали проработаны. Можно приступать к кодированию.
