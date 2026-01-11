# ProductUser API - Документация для фронтенда

## Обзор

API для работы с пользовательскими продуктами. Позволяет создавать персональные продукты с мультиязычными названиями, пищевой ценностью, историей покупок, фотографиями и пользовательскими порциями.
**Base URL:** `http://localhost:5000/api/products-user`
**Аутентификация:** Bearer Token (JWT)

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Основные возможности

- ✅ **Мультиязычность** - названия на 6 языках (RU, EN, UK, ES, FR, DE)
- ✅ **Пищевая ценность** - КБЖУ на 100г/100мл
- ✅ **История покупок** - цены, магазины, даты
- ✅ **Фотографии** - загрузка в Cloudinary с оптимизацией
- ✅ **Пользовательские порции** - стакан, ложка, яйцо и т.д.
- ✅ **Связи** - с категориями, брендами, глобальными продуктами
- ✅ **Контроль доступа** - владелец/администратор

---

## Endpoints

### 1. Product Endpoints

#### 1.1. Создать продукт

```http
POST /products-user
```

**Права доступа:** Любой авторизованный пользователь
**Body:**

```json
{
  "name": "Молоко 3.2%",
  "lang": "RU",
  "barcode": "4607065097981",
  "categoryId": "uuid-category",
  "brandId": "uuid-brand",
  "productGlobalId": "uuid-global",
  "nutrition": {
    "caloriesKcal": 59,
    "proteinsG": 2.8,
    "fatsG": 3.2,
    "carbohydratesG": 4.7,
    "sugarsG": 4.7,
    "fiberG": 0,
    "saltG": 0.1
  }
}
```

**Validation:**

- `name` - обязательное, 2-200 символов
- `lang` - опциональное, default: RU (RU | EN | UK | ES | FR | DE)
- `barcode` - опциональное, 8-13 цифр
- `categoryId` - опциональное, UUID
- `brandId` - опциональное, UUID (бренд должен быть approved)
- `productGlobalId` - опциональное, UUID
- `nutrition` - обязательное:
  - `caloriesKcal` - обязательное, 0-9999
  - `proteinsG` - обязательное, 0-999.99
  - `fatsG` - обязательное, 0-999.99
  - `carbohydratesG` - обязательное, 0-999.99
  - `sugarsG` - опциональное, 0-999.99
  - `fiberG` - опциональное, 0-999.99
  - `saltG` - опциональное, 0-999.99
    **Response 201:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "barcode": "4607065097981",
  "categoryId": "uuid-category",
  "brandId": "uuid-brand",
  "productGlobalId": "uuid-global",
  "photos": [],
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:00:00.000Z",
  "names": [
    {
      "productUserId": "uuid",
      "lang": "RU",
      "name": "Молоко 3.2%"
    }
  ],
  "nutrition": {
    "productUserId": "uuid",
    "caloriesKcal": 59,
    "proteinsG": 2.8,
    "fatsG": 3.2,
    "carbohydratesG": 4.7,
    "sugarsG": 4.7,
    "fiberG": 0,
    "saltG": 0.1
  },
  "category": { ... },
  "brand": { ... },
  "productGlobal": { ... }
}
```

**Curl:**

```bash
curl -X POST "http://localhost:5000/api/products-user" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Молоко 3.2%",
    "lang": "RU",
    "barcode": "4607065097981",
    "nutrition": {
      "caloriesKcal": 59,
      "proteinsG": 2.8,
      "fatsG": 3.2,
      "carbohydratesG": 4.7
    }
  }'
```

---

<!-- !! -->

#### 1.2. Обновить продукт

```http
PATCH /products-user/:id
```

**Права доступа:** Владелец или администратор
**Params:**

- `id` - UUID продукта

**Body (все поля опциональны):**

```json
{
  "name": "Молоко 2.5%",
  "lang": "RU",
  "barcode": "4607065097982",
  "categoryId": "uuid-new-category",
  "brandId": null,
  "productGlobalId": "uuid-new-global",
  "nutrition": {
    "fatsG": 2.5
  }
}
```

**Особенности:**

- Передача `null` для `categoryId`, `brandId`, `productGlobalId` удаляет связь
- Обновление `name` с `lang` делает upsert в i18n таблицу
- Nutrition обновляется селективно (только переданные поля)

**Response 200:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "barcode": "4607065097982",
  "categoryId": "uuid-new-category",
  "brandId": null,
  "productGlobalId": "uuid-new-global",
  "photos": [],
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:05:00.000Z",
  "names": [
    {
      "productUserId": "uuid",
      "lang": "RU",
      "name": "Молоко 2.5%"
    }
  ],
  "nutrition": {
    "productUserId": "uuid",
    "caloriesKcal": 59,
    "proteinsG": 2.8,
    "fatsG": 2.5,
    "carbohydratesG": 4.7,
    "sugarsG": 4.7,
    "fiberG": 0,
    "saltG": 0.1
  }
}
```

**Curl:**

```bash
curl -X PATCH "http://localhost:5000/api/products-user/uuid" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Молоко 2.5%",
    "nutrition": {
      "fatsG": 2.5
    }
  }'
```

---

<!-- !! -->

#### 1.3. Удалить продукт

```http
DELETE /products-user/:id
```

**Права доступа:** Владелец или администратор

**Params:**

- `id` - UUID продукта

**Response 200:**

```json
{
  "message": "Продукт успешно удален"
}
```

**Особенности:**

- Каскадное удаление: i18n, nutrition, packages, servings удаляются автоматически
- TODO: проверка использования в планах питания (когда модуль будет реализован)

**Curl:**

```bash
curl -X DELETE "http://localhost:5000/api/products-user/uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 1.4. Получить продукт

```http
GET /products-user/:id
```

**Права доступа:** Владелец или администратор

**Params:**

- `id` - UUID продукта

**Response 200:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "barcode": "4607065097981",
  "categoryId": "uuid-category",
  "brandId": "uuid-brand",
  "productGlobalId": "uuid-global",
  "photos": [
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ],
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:00:00.000Z",
  "names": [
    {
      "productUserId": "uuid",
      "lang": "RU",
      "name": "Молоко 3.2%"
    },
    {
      "productUserId": "uuid",
      "lang": "EN",
      "name": "Milk 3.2%"
    }
  ],
  "nutrition": {
    "productUserId": "uuid",
    "caloriesKcal": 59,
    "proteinsG": 2.8,
    "fatsG": 3.2,
    "carbohydratesG": 4.7,
    "sugarsG": 4.7,
    "fiberG": 0,
    "saltG": 0.1
  },
  "category": {
    "id": "uuid",
    "name": "Молочные продукты"
  },
  "brand": {
    "id": "uuid",
    "name": "Простоквашино",
    "status": "approved"
  },
  "productGlobal": {
    "id": "uuid",
    "barcode": "4607065097981",
    "names": [...],
    "nutrition": {...}
  },
  "packages": [
    {
      "id": "uuid",
      "totalWeightG": 1000,
      "priceTotal": 89.99,
      "currency": "RUB",
      "purchasedAt": "2026-01-10T12:00:00.000Z",
      "store": "Пятерочка"
    }
  ],
  "servings": [
    {
      "id": "uuid",
      "name": "Стакан",
      "amountUnits": 1,
      "volumeMl": 250,
      "isDefault": true
    },
    {
      "id": "uuid",
      "name": "Ложка",
      "amountUnits": 1,
      "volumeMl": 15,
      "isDefault": false
    }
  ],
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

**Curl:**

```bash
curl -X GET "http://localhost:5000/api/products-user/uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 1.5. Список всех продуктов (admin only)

```http
GET /products-user?page=1&limit=20&categoryId=uuid&brandId=uuid&userId=uuid
```

**Права доступа:** Только администраторы

**Query Parameters:**

- `page` - номер страницы (default: 1)
- `limit` - записей на странице (default: 20)
- `categoryId` - фильтр по категории (опционально)
- `brandId` - фильтр по бренду (опционально)
- `userId` - фильтр по владельцу (опционально)

**Response 200:**

```json
{
  "products": [
    {
      "id": "uuid",
      "userId": "uuid",
      "barcode": "4607065097981",
      "categoryId": "uuid",
      "brandId": "uuid",
      "photos": [],
      "createdAt": "2026-01-11T10:00:00.000Z",
      "updatedAt": "2026-01-11T10:00:00.000Z",
      "names": [...],
      "nutrition": {...},
      "category": {...},
      "brand": {...},
      "user": {
        "id": "uuid",
        "email": "user@example.com"
      },
      "_count": {
        "packages": 5,
        "servings": 3
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**Curl:**

```bash
curl -X GET "http://localhost:5000/api/products-user?page=1&limit=20&categoryId=uuid" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

#### 1.6. Мои продукты

```http
GET /products-user/my?page=1&limit=20&categoryId=uuid&brandId=uuid
```

**Права доступа:** Любой авторизованный пользователь

**Query Parameters:**

- `page` - номер страницы (default: 1)
- `limit` - записей на странице (default: 20)
- `categoryId` - фильтр по категории (опционально)
- `brandId` - фильтр по бренду (опционально)

**Response 200:**

```json
{
  "products": [
    {
      "id": "uuid",
      "userId": "uuid",
      "barcode": "4607065097981",
      "categoryId": "uuid",
      "brandId": "uuid",
      "photos": ["https://..."],
      "createdAt": "2026-01-11T10:00:00.000Z",
      "updatedAt": "2026-01-11T10:00:00.000Z",
      "names": [...],
      "nutrition": {...},
      "category": {...},
      "brand": {...},
      "_count": {
        "packages": 5,
        "servings": 3
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

**Curl:**

```bash
curl -X GET "http://localhost:5000/api/products-user/my?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 1.7. Поиск продуктов

```http
GET /products-user/my/search?query=молоко
```

**Права доступа:** Любой авторизованный пользователь

**Query Parameters:**

- `query` - строка поиска (обязательно)

**Response 200:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "barcode": "4607065097981",
    "categoryId": "uuid",
    "brandId": "uuid",
    "photos": [],
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:00:00.000Z",
    "names": [
      {
        "productUserId": "uuid",
        "lang": "RU",
        "name": "Молоко 3.2%"
      }
    ],
    "nutrition": {...},
    "category": {...},
    "brand": {...}
  }
]
```

**Особенности:**

- Поиск по всем языкам одновременно
- Case-insensitive, contains
- Лимит 50 результатов
- Только свои продукты

**Curl:**

```bash
curl -X GET "http://localhost:5000/api/products-user/my/search?query=молоко" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Photo Endpoints

#### 2.1. Загрузить фотографию

```http
POST /products-user/:id/photos
```

**Права доступа:** Владелец или администратор

**Params:**

- `id` - UUID продукта

**Body (multipart/form-data):**

- `photo` - файл изображения (JPEG, PNG, WebP, max 5MB)

**Response 200:**

```json
{
  "message": "Фотография успешно загружена",
  "photoUrl": "https://res.cloudinary.com/...",
  "totalPhotos": 3
}
```

**Особенности:**

- Загрузка в Cloudinary (папка 'products-user')
- Автоматическая оптимизация: resize 800x800px, quality auto, format WebP
- URL добавляется в массив `photos`

**Curl:**

```bash
curl -X POST "http://localhost:5000/api/products-user/uuid/photos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg"
```

---

#### 2.2. Удалить фотографию

```http
DELETE /products-user/:id/photos?photoUrl=https://...
```

**Права доступа:** Владелец или администратор

**Params:**

- `id` - UUID продукта

**Query Parameters:**

- `photoUrl` - полный URL фотографии для удаления

**Response 200:**

```json
{
  "message": "Фотография успешно удалена",
  "totalPhotos": 2
}
```

**Особенности:**

- Удаление из Cloudinary + фильтрация из массива `photos`
- Graceful degradation: если Cloudinary недоступен, удаление из БД продолжается

**Curl:**

```bash
curl -X DELETE "http://localhost:5000/api/products-user/uuid/photos?photoUrl=https://res.cloudinary.com/..." \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Package Endpoints (История покупок)

#### 3.1. Добавить покупку

```http
POST /products-user/:id/packages
```

**Права доступа:** Только владелец продукта

**Params:**

- `id` - UUID продукта

**Body:**

```json
{
  "totalWeightG": 1000,
  "totalVolumeMl": null,
  "priceTotal": 89.99,
  "currency": "RUB",
  "purchasedAt": "2026-01-10T12:00:00.000Z",
  "store": "Пятерочка",
  "note": "Со скидкой по карте"
}
```

**Validation:**

- `totalWeightG` - опциональное, 0.01-999999.99
- `totalVolumeMl` - опциональное, 0.01-999999.99
- **Хотя бы одно из полей `totalWeightG` или `totalVolumeMl` обязательно**
- `priceTotal` - обязательное, 0.01-9999999.99
- `currency` - обязательное (RUB | USD | EUR | UAH | KZT)
- `purchasedAt` - опциональное, default: now
- `store` - опциональное, max 100 символов
- `note` - опциональное, max 500 символов

**Response 201:**

```json
{
  "id": "uuid",
  "productUserId": "uuid",
  "totalWeightG": 1000,
  "totalVolumeMl": null,
  "priceTotal": 89.99,
  "currency": "RUB",
  "purchasedAt": "2026-01-10T12:00:00.000Z",
  "store": "Пятерочка",
  "note": "Со скидкой по карте",
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:00:00.000Z"
}
```

**Curl:**

```bash
curl -X POST "http://localhost:5000/api/products-user/uuid/packages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalWeightG": 1000,
    "priceTotal": 89.99,
    "currency": "RUB",
    "store": "Пятерочка"
  }'
```

---

#### 3.2. Обновить покупку

```http
PATCH /products-user/:id/packages/:packageId
```

**Права доступа:** Только владелец продукта

**Params:**

- `id` - UUID продукта
- `packageId` - UUID покупки

**Body (все поля опциональны):**

```json
{
  "priceTotal": 79.99,
  "note": "Цена снизилась"
}
```

**Response 200:**

```json
{
  "id": "uuid",
  "productUserId": "uuid",
  "totalWeightG": 1000,
  "totalVolumeMl": null,
  "priceTotal": 79.99,
  "currency": "RUB",
  "purchasedAt": "2026-01-10T12:00:00.000Z",
  "store": "Пятерочка",
  "note": "Цена снизилась",
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:05:00.000Z"
}
```

**Curl:**

```bash
curl -X PATCH "http://localhost:5000/api/products-user/uuid/packages/package-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceTotal": 79.99,
    "note": "Цена снизилась"
  }'
```

---

#### 3.3. Удалить покупку

```http
DELETE /products-user/:id/packages/:packageId
```

**Права доступа:** Только владелец продукта

**Params:**

- `id` - UUID продукта
- `packageId` - UUID покупки

**Response 200:**

```json
{
  "message": "Покупка успешно удалена"
}
```

**Curl:**

```bash
curl -X DELETE "http://localhost:5000/api/products-user/uuid/packages/package-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 3.4. Список покупок

```http
GET /products-user/:id/packages
```

**Права доступа:** Владелец или администратор

**Params:**

- `id` - UUID продукта

**Response 200:**

```json
[
  {
    "id": "uuid",
    "productUserId": "uuid",
    "totalWeightG": 1000,
    "totalVolumeMl": null,
    "priceTotal": 79.99,
    "currency": "RUB",
    "purchasedAt": "2026-01-10T12:00:00.000Z",
    "store": "Пятерочка",
    "note": "Цена снизилась",
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:05:00.000Z"
  },
  {
    "id": "uuid",
    "productUserId": "uuid",
    "totalWeightG": 1000,
    "totalVolumeMl": null,
    "priceTotal": 89.99,
    "currency": "RUB",
    "purchasedAt": "2026-01-05T12:00:00.000Z",
    "store": "Магнит",
    "note": null,
    "createdAt": "2026-01-05T12:30:00.000Z",
    "updatedAt": "2026-01-05T12:30:00.000Z"
  }
]
```

**Особенности:**

- Сортировка по `purchasedAt DESC` (новые первые)
- Используется для анализа динамики цен

**Curl:**

```bash
curl -X GET "http://localhost:5000/api/products-user/uuid/packages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Serving Endpoints (Пользовательские порции)

#### 4.1. Добавить порцию

```http
POST /products-user/:id/servings
```

**Права доступа:** Только владелец продукта

**Params:**

- `id` - UUID продукта

**Body:**

```json
{
  "name": "Стакан",
  "amountUnits": 1,
  "weightG": null,
  "volumeMl": 250,
  "isDefault": true
}
```

**Validation:**

- `name` - обязательное, 2-50 символов
- `amountUnits` - опциональное, 0.01-9999.99, default: 1
- `weightG` - опциональное, 0.01-999999.99
- `volumeMl` - опциональное, 0.01-999999.99
- **Хотя бы одно из полей `weightG` или `volumeMl` обязательно**
- `isDefault` - опциональное, boolean, default: false

**Response 201:**

```json
{
  "id": "uuid",
  "productUserId": "uuid",
  "name": "Стакан",
  "amountUnits": 1,
  "weightG": null,
  "volumeMl": 250,
  "isDefault": true,
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:00:00.000Z"
}
```

**Особенности:**

- Если `isDefault: true`, автоматически сбрасывает `isDefault` у всех других порций продукта
- Гарантирует только одну default порцию на продукт

**Curl:**

```bash
curl -X POST "http://localhost:5000/api/products-user/uuid/servings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Стакан",
    "volumeMl": 250,
    "isDefault": true
  }'
```

---

#### 4.2. Обновить порцию

```http
PATCH /products-user/:id/servings/:servingId
```

**Права доступа:** Только владелец продукта

**Params:**

- `id` - UUID продукта
- `servingId` - UUID порции

**Body (все поля опциональны):**

```json
{
  "name": "Большой стакан",
  "volumeMl": 300,
  "isDefault": true
}
```

**Response 200:**

```json
{
  "id": "uuid",
  "productUserId": "uuid",
  "name": "Большой стакан",
  "amountUnits": 1,
  "weightG": null,
  "volumeMl": 300,
  "isDefault": true,
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:05:00.000Z"
}
```

**Особенности:**

- Если `isDefault: true`, сбрасывает `isDefault` у всех других порций (исключая текущую)

**Curl:**

```bash
curl -X PATCH "http://localhost:5000/api/products-user/uuid/servings/serving-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Большой стакан",
    "volumeMl": 300,
    "isDefault": true
  }'
```

---

#### 4.3. Удалить порцию

```http
DELETE /products-user/:id/servings/:servingId
```

**Права доступа:** Только владелец продукта

**Params:**

- `id` - UUID продукта
- `servingId` - UUID порции

**Response 200:**

```json
{
  "message": "Порция успешно удалена"
}
```

**Важно:** При удалении default порции, другие порции остаются без default. Рекомендуется установить новую default порцию вручную.

**Curl:**

```bash
curl -X DELETE "http://localhost:5000/api/products-user/uuid/servings/serving-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### 4.4. Список порций

```http
GET /products-user/:id/servings
```

**Права доступа:** Владелец или администратор

**Params:**

- `id` - UUID продукта

**Response 200:**

```json
[
  {
    "id": "uuid",
    "productUserId": "uuid",
    "name": "Стакан",
    "amountUnits": 1,
    "weightG": null,
    "volumeMl": 250,
    "isDefault": true,
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "productUserId": "uuid",
    "name": "Ложка",
    "amountUnits": 1,
    "weightG": null,
    "volumeMl": 15,
    "isDefault": false,
    "createdAt": "2026-01-10T09:00:00.000Z",
    "updatedAt": "2026-01-10T09:00:00.000Z"
  },
  {
    "id": "uuid",
    "productUserId": "uuid",
    "name": "Чайная ложка",
    "amountUnits": 1,
    "weightG": null,
    "volumeMl": 5,
    "isDefault": false,
    "createdAt": "2026-01-09T08:00:00.000Z",
    "updatedAt": "2026-01-09T08:00:00.000Z"
  }
]
```

**Особенности:**

- Сортировка: `isDefault DESC`, `createdAt ASC` (default первая, затем старые → новые)
- Default порция всегда на первой позиции

**Curl:**

```bash
curl -X GET "http://localhost:5000/api/products-user/uuid/servings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Типы данных (DTOs)

### Language

```typescript
enum Language {
  RU = 'RU',
  EN = 'EN',
  UK = 'UK',
  ES = 'ES',
  FR = 'FR',
  DE = 'DE',
}
```

### Currency

```typescript
enum Currency {
  RUB = 'RUB',
  USD = 'USD',
  EUR = 'EUR',
  UAH = 'UAH',
  KZT = 'KZT',
}
```

### NutritionDto

```typescript
{
  caloriesKcal: number;      // 0-9999, обязательное
  proteinsG: number;         // 0-999.99, обязательное
  fatsG: number;             // 0-999.99, обязательное
  carbohydratesG: number;    // 0-999.99, обязательное
  sugarsG?: number;          // 0-999.99, опциональное
  fiberG?: number;           // 0-999.99, опциональное
  saltG?: number;            // 0-999.99, опциональное
}
```

### ProductUser (полный объект)

```typescript
{
  id: string;                      // UUID
  userId: string;                  // UUID владельца
  barcode?: string;                // 8-13 цифр
  categoryId?: string;             // UUID категории
  brandId?: string;                // UUID бренда
  productGlobalId?: string;        // UUID глобального продукта
  photos: string[];                // Массив URL фотографий
  createdAt: Date;
  updatedAt: Date;

  // Includes
  names: {
    productUserId: string;
    lang: Language;
    name: string;
  }[];
  nutrition: {
    productUserId: string;
    caloriesKcal: number;
    proteinsG: number;
    fatsG: number;
    carbohydratesG: number;
    sugarsG?: number;
    fiberG?: number;
    saltG?: number;
  };
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
    status: string;
  };
  productGlobal?: {
    id: string;
    barcode: string;
    names: [...];
    nutrition: {...};
  };
  packages?: ProductUserPackage[];
  servings?: ProductUserServing[];
  user?: {
    id: string;
    email: string;
  };
  _count?: {
    packages: number;
    servings: number;
  };
}
```

### ProductUserPackage

```typescript
{
  id: string;                    // UUID
  productUserId: string;         // UUID продукта
  totalWeightG?: number;         // 0.01-999999.99
  totalVolumeMl?: number;        // 0.01-999999.99
  priceTotal: number;            // 0.01-9999999.99
  currency: Currency;            // RUB | USD | EUR | UAH | KZT
  purchasedAt: Date;             // Дата покупки
  store?: string;                // max 100 символов
  note?: string;                 // max 500 символов
  createdAt: Date;
  updatedAt: Date;
}
```

### ProductUserServing

```typescript
{
  id: string;                    // UUID
  productUserId: string;         // UUID продукта
  name: string;                  // 2-50 символов
  amountUnits: number;           // 0.01-9999.99, default: 1
  weightG?: number;              // 0.01-999999.99
  volumeMl?: number;             // 0.01-999999.99
  isDefault: boolean;            // default: false
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Коды ошибок

### 400 Bad Request

**Причины:**

- Невалидные данные в теле запроса
- Бренд не прошел модерацию (status !== 'approved')
- Не указано ни `weightG`, ни `volumeMl` для package/serving

**Пример:**

```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 2 characters",
    "nutrition.caloriesKcal must not be greater than 9999"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized

**Причины:**

- Отсутствует токен авторизации
- Токен невалидный или истек

**Пример:**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

**Причины:**

- Недостаточно прав для операции
- Попытка изменить/удалить чужой продукт
- Попытка добавить package/serving к чужому продукту

**Пример:**

```json
{
  "statusCode": 403,
  "message": "Нет прав для изменения этого продукта"
}
```

### 404 Not Found

**Причины:**

- Продукт не существует
- Категория/Бренд/ProductGlobal не найдены
- Package/Serving не существует или не принадлежит продукту
- Фотография не найдена в массиве photos

**Пример:**

```json
{
  "statusCode": 404,
  "message": "Продукт с ID \"uuid\" не найден"
}
```

### 429 Too Many Requests

**Причины:**

- Превышен лимит запросов (rate limiting)

**Пример:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Примеры использования

### Создание продукта с фотографией и порциями

```bash
# 1. Создать продукт
PRODUCT_ID=$(curl -s -X POST "http://localhost:5000/api/products-user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Молоко Простоквашино 3.2%",
    "lang": "RU",
    "barcode": "4607065097981",
    "categoryId": "'"$CATEGORY_ID"'",
    "brandId": "'"$BRAND_ID"'",
    "nutrition": {
      "caloriesKcal": 59,
      "proteinsG": 2.8,
      "fatsG": 3.2,
      "carbohydratesG": 4.7,
      "sugarsG": 4.7
    }
  }' | jq -r '.id')

# 2. Загрузить фотографию
curl -X POST "http://localhost:5000/api/products-user/$PRODUCT_ID/photos" \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/milk.jpg"

# 3. Добавить порции
curl -X POST "http://localhost:5000/api/products-user/$PRODUCT_ID/servings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Стакан",
    "volumeMl": 250,
    "isDefault": true
  }'

curl -X POST "http://localhost:5000/api/products-user/$PRODUCT_ID/servings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ложка",
    "volumeMl": 15
  }'

# 4. Добавить покупку
curl -X POST "http://localhost:5000/api/products-user/$PRODUCT_ID/packages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalWeightG": 1000,
    "priceTotal": 89.99,
    "currency": "RUB",
    "store": "Пятерочка",
    "note": "Акция -10%"
  }'

# 5. Получить полную информацию
curl -X GET "http://localhost:5000/api/products-user/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Расчет калорий для порции

```typescript
// Frontend logic
const product = await getProduct(productId);
const defaultServing =
  product.servings.find((s) => s.isDefault) || product.servings[0];

// Калории на порцию
const caloriesPerServing = defaultServing.volumeMl
  ? (product.nutrition.caloriesKcal * defaultServing.volumeMl) / 100
  : (product.nutrition.caloriesKcal * defaultServing.weightG) / 100;

console.log(
  `Калорий в ${defaultServing.name}: ${caloriesPerServing.toFixed(1)} ккал`,
);
```

### Анализ истории покупок

```typescript
// Frontend logic
const packages = await getPackages(productId);

// Средняя цена за кг
const avgPricePerKg =
  packages
    .filter((p) => p.totalWeightG)
    .reduce((sum, p) => sum + p.priceTotal / (p.totalWeightG / 1000), 0) /
  packages.filter((p) => p.totalWeightG).length;

// Любимый магазин
const storeCounts = packages
  .filter((p) => p.store)
  .reduce((acc, p) => {
    acc[p.store] = (acc[p.store] || 0) + 1;
    return acc;
  }, {});

const favoriteStore = Object.keys(storeCounts).sort(
  (a, b) => storeCounts[b] - storeCounts[a],
)[0];

console.log(`Средняя цена за кг: ${avgPricePerKg.toFixed(2)} руб`);
console.log(
  `Любимый магазин: ${favoriteStore} (${storeCounts[favoriteStore]} покупок)`,
);
```

---

## Rate Limiting

**Лимиты:** 10 запросов / 60 секунд с одного IP

**Headers в ответе:**

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1736591850
```

**При превышении:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Заметки для фронтенда

### Мультиязычность

- Всегда передавайте `lang` при создании/обновлении названия
- Для добавления перевода используйте PATCH с новым `lang` и `name`
- При получении продукта фильтруйте `names` по текущему языку UI

### Порции

- Default порция автоматически выбирается первой в массиве `servings`
- При удалении default порции, установите новую через PATCH
- Один продукт может иметь несколько порций, но только одну default

### Покупки

- Сортировка по дате (новые первые) для отображения истории
- Используйте для построения графиков цен и аналитики
- Храните totalWeightG и totalVolumeMl для расчета цены за единицу

### Фотографии

- URL фотографий хранятся в массиве `photos` в порядке загрузки
- Для удаления передавайте полный URL из массива
- Cloudinary автоматически оптимизирует изображения до WebP

### Поиск

- Используйте debounce для запросов поиска (300-500ms)
- Минимум 2 символа для запроса (клиентская валидация)
- Лимит 50 результатов - показывайте предупреждение если достигнут

---

**Версия API:** 1.0.0  
**Дата:** 11 января 2026 г.  
**Контакт:** backend@bjunotfound.com
