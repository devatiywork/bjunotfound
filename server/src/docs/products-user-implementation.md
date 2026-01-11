# ProductUser Module - План реализации

## Обзор модуля

**ProductUser** - пользовательские продукты. Каждый пользователь создает свою личную базу продуктов с возможностью привязки к глобальным продуктам, хранения упаковок, порций и цен.

**Связанные таблицы:**
- `ProductUser` - основная таблица
- `ProductUserI18n` - названия на разных языках (1:M)
- `NutritionUserPer100` - КБЖУ на 100г (1:1)
- `ProductUserPackage` - упаковки/покупки (1:M)
- `ProductUserServing` - порции (1:M)

---

## 1. DTOs

### CreateProductUserDto
```typescript
{
  name: string;              // обязательно, 2-200 символов
  lang?: Language;           // опционально, по умолчанию RU
  barcode?: string;          // опционально, 8-13 цифр
  categoryId?: string;       // опционально, UUID
  brandId?: string;          // опционально, UUID
  productGlobalId?: string;  // опционально, UUID (привязка к глобальному)
  
  // Nutrition (вложенный объект)
  nutrition: {
    caloriesKcal: number;    // обязательно, >= 0
    proteinsG: number;       // обязательно, >= 0
    fatsG: number;           // обязательно, >= 0
    carbohydratesG: number;  // обязательно, >= 0
    sugarsG?: number;        // опционально, >= 0
    fiberG?: number;         // опционально, >= 0
    saltG?: number;          // опционально, >= 0
  }
}
```

### UpdateProductUserDto
```typescript
{
  name?: string;             // опционально, 2-200 символов
  lang?: Language;           // опционально
  barcode?: string;          // опционально, 8-13 цифр
  categoryId?: string;       // опционально, UUID (null для удаления связи)
  brandId?: string;          // опционально, UUID (null для удаления связи)
  productGlobalId?: string;  // опционально, UUID
  
  // Nutrition (вложенный объект, опционально)
  nutrition?: {
    caloriesKcal?: number;
    proteinsG?: number;
    fatsG?: number;
    carbohydratesG?: number;
    sugarsG?: number;
    fiberG?: number;
    saltG?: number;
  }
}
```

### AddPackageDto
```typescript
{
  totalWeightG?: number;     // опционально, > 0
  totalVolumeMl?: number;    // опционально, > 0
  priceTotal: number;        // обязательно, >= 0
  currency: Currency;        // обязательно (RUB, USD, EUR, UAH, KZT)
  purchasedAt?: Date;        // опционально
  store?: string;            // опционально, до 100 символов
  note?: string;             // опционально, до 500 символов
}
```

**Валидация:** хотя бы одно из totalWeightG или totalVolumeMl должно быть указано

### UpdatePackageDto
```typescript
{
  totalWeightG?: number;
  totalVolumeMl?: number;
  priceTotal?: number;
  currency?: Currency;
  purchasedAt?: Date;
  store?: string;
  note?: string;
}
```

### AddServingDto
```typescript
{
  name: string;              // обязательно, 2-50 символов ("ломтик", "яйцо")
  amountUnits?: number;      // опционально, по умолчанию 1, > 0
  weightG?: number;          // опционально, > 0
  volumeMl?: number;         // опционально, > 0
  isDefault?: boolean;       // опционально, по умолчанию false
}
```

**Валидация:** хотя бы одно из weightG или volumeMl должно быть указано

### UpdateServingDto
```typescript
{
  name?: string;
  amountUnits?: number;
  weightG?: number;
  volumeMl?: number;
  isDefault?: boolean;
}
```

---

## 2. Специализированные сервисы

### Основные операции (services/product/)

#### CreateProductUserService
**Логика:**
1. Проверка categoryId (если указан - существует ли)
2. Проверка brandId (если указан - существует ли и одобрен)
3. Проверка productGlobalId (если указан - существует ли)
4. Создание ProductUser
5. Создание ProductUserI18n (name + lang)
6. Создание NutritionUserPer100

**Транзакция:** все 3 операции в одной транзакции

#### UpdateProductUserService
**Логика:**
1. Проверка владельца (userId === req.user.userId OR admin)
2. Проверка categoryId/brandId/productGlobalId (если меняются)
3. Обновление ProductUser
4. Обновление ProductUserI18n (если меняется name или lang)
5. Обновление NutritionUserPer100 (если передан nutrition)

**Транзакция:** все операции в одной транзакции

#### DeleteProductUserService
**Логика:**
1. Проверка владельца
2. Проверка использования в MealPlan (будущее)
3. Каскадное удаление: i18n, nutrition, packages, servings, photos

#### GetProductUserService
**Логика:**
1. Проверка доступа (владелец или админ)
2. Включение всех связей: names, nutrition, category, brand, productGlobal, packages, servings

#### ListProductsUserService (все продукты, админ)
**Логика:**
1. Только для админов
2. Пагинация (page, limit)
3. Фильтры: categoryId, brandId, userId
4. Включение names, nutrition, user

#### ListMyProductsUserService
**Логика:**
1. Продукты текущего пользователя
2. Пагинация
3. Фильтры: categoryId, brandId
4. Сортировка по createdAt DESC

#### SearchProductsUserService
**Логика:**
1. Поиск по ProductUserI18n.name (ILIKE)
2. Только продукты пользователя
3. Limit 50 результатов

---

### Фото (services/photo/)

#### UploadProductUserPhotoService
**Логика:**
1. Проверка владельца
2. Загрузка в Cloudinary (папка 'products-user')
3. Добавление URL в массив photos

#### DeleteProductUserPhotoService
**Логика:**
1. Проверка владельца
2. Удаление из Cloudinary
3. Удаление URL из массива photos

---

### Упаковки (services/package/)

#### AddPackageService
**Логика:**
1. Проверка владельца продукта
2. Валидация: хотя бы одно из totalWeightG/totalVolumeMl
3. Создание ProductUserPackage

#### UpdatePackageService
**Логика:**
1. Проверка владельца продукта
2. Обновление упаковки

#### DeletePackageService
**Логика:**
1. Проверка владельца продукта
2. Удаление упаковки

#### ListPackagesService
**Логика:**
1. Проверка владельца продукта
2. Список всех упаковок продукта
3. Сортировка по purchasedAt DESC (новые первые)

---

### Порции (services/serving/)

#### AddServingService
**Логика:**
1. Проверка владельца продукта
2. Валидация: хотя бы одно из weightG/volumeMl
3. Если isDefault=true - сбросить isDefault у других порций
4. Создание ProductUserServing

#### UpdateServingService
**Логика:**
1. Проверка владельца продукта
2. Если isDefault=true - сбросить у других
3. Обновление порции

#### DeleteServingService
**Логика:**
1. Проверка владельца продукта
2. Удаление порции

#### ListServingsService
**Логика:**
1. Проверка владельца продукта
2. Список всех порций продукта
3. Сортировка: isDefault DESC, createdAt ASC

---

## 3. Endpoints (15 штук)

### Продукты

**GET /products-user**  
Доступ: admin  
Описание: Список всех пользовательских продуктов (с пагинацией)

**GET /products-user/my**  
Доступ: auth  
Описание: Мои продукты (с пагинацией и фильтрами)

**GET /products-user/my/search?query=молоко**  
Доступ: auth  
Описание: Поиск по моим продуктам

**GET /products-user/:id**  
Доступ: auth (владелец или админ)  
Описание: Получить продукт со всеми связями

**POST /products-user**  
Доступ: auth  
Описание: Создать продукт (name + lang + nutrition обязательны)

**PATCH /products-user/:id**  
Доступ: auth (владелец или админ)  
Описание: Обновить продукт

**DELETE /products-user/:id**  
Доступ: auth (владелец или админ)  
Описание: Удалить продукт

---

### Фото

**POST /products-user/:id/photos**  
Доступ: auth (владелец или админ)  
Описание: Загрузить фото (multipart/form-data)

**DELETE /products-user/:id/photos?photoUrl=...**  
Доступ: auth (владелец или админ)  
Описание: Удалить фото

---

### Упаковки

**GET /products-user/:id/packages**  
Доступ: auth (владелец или админ)  
Описание: Список упаковок продукта

**POST /products-user/:id/packages**  
Доступ: auth (владелец)  
Описание: Добавить упаковку

**PATCH /products-user/:id/packages/:packageId**  
Доступ: auth (владелец)  
Описание: Обновить упаковку

**DELETE /products-user/:id/packages/:packageId**  
Доступ: auth (владелец)  
Описание: Удалить упаковку

---

### Порции

**GET /products-user/:id/servings**  
Доступ: auth (владелец или админ)  
Описание: Список порций продукта

**POST /products-user/:id/servings**  
Доступ: auth (владелец)  
Описание: Добавить порцию

**PATCH /products-user/:id/servings/:servingId**  
Доступ: auth (владелец)  
Описание: Обновить порцию

**DELETE /products-user/:id/servings/:servingId**  
Доступ: auth (владелец)  
Описание: Удалить порцию

---

## 4. Структура модуля

```
src/products-user/
  dto/
    create-product-user.dto.ts
    update-product-user.dto.ts
    add-package.dto.ts
    update-package.dto.ts
    add-serving.dto.ts
    update-serving.dto.ts
  services/
    product/
      create-product-user.service.ts
      update-product-user.service.ts
      delete-product-user.service.ts
      get-product-user.service.ts
      list-products-user.service.ts
      list-my-products-user.service.ts
      search-products-user.service.ts
      doc.md
    photo/
      upload-photo.service.ts
      delete-photo.service.ts
      doc.md
    package/
      add-package.service.ts
      update-package.service.ts
      delete-package.service.ts
      list-packages.service.ts
      doc.md
    serving/
      add-serving.service.ts
      update-serving.service.ts
      delete-serving.service.ts
      list-servings.service.ts
      doc.md
    index.ts
  products-user.service.ts       ← координатор
  products-user.controller.ts
  products-user.module.ts
```

**Итого:** 18 специализированных сервисов

---

## 5. Особенности реализации

### I18n работа

**Создание:**
- Пользователь передает name + lang
- Создается запись в ProductUserI18n

**Обновление:**
- Если меняется name - обновляется запись с текущим lang
- Если меняется lang - создается новая запись, старая остается

**Чтение:**
- Возвращаем массив names с разными языками
- Клиент выбирает нужный язык

### Nutrition (1:1)

**Создание:**
- Одновременно с ProductUser создается NutritionUserPer100
- productUserId = PK и FK одновременно

**Обновление:**
- Через upsert (если нет - создать, если есть - обновить)

**Удаление:**
- Каскадное при удалении ProductUser

### Packages и Servings (1:M)

**История покупок (packages):**
- Храним каждую покупку отдельной записью
- Пользователь видит историю цен
- Может анализировать изменение цены

**Порции (servings):**
- Пользователь создает удобные порции ("ложка", "ломтик")
- Одна порция может быть isDefault
- Используются в MealPlan для быстрого добавления

### Контроль доступа

**Владелец:**
- Видит, редактирует, удаляет свои продукты
- Добавляет упаковки/порции только к своим

**Админ:**
- Видит все продукты всех пользователей
- Может редактировать любые
- Не может добавлять упаковки/порции чужих продуктов

### Связи с другими таблицами

**ProductGlobal (опционально):**
- Если пользователь нашел глобальный продукт - привязываем
- Можно автоматически копировать nutrition из global

**Category:**
- Опционально, для фильтрации

**Brand:**
- Опционально, должен быть одобрен (isApproved=true)

---

## 6. Порядок разработки

1. ✅ **Создать план** (этот документ)
2. 📝 Создать 6 DTOs с валидацией
3. 📝 Создать 7 сервисов для product/
4. 📝 Создать 2 сервиса для photo/
5. 📝 Создать 4 сервиса для package/
6. 📝 Создать 4 сервиса для serving/
7. 📝 Создать главный ProductsUserService (координатор)
8. 📝 Создать ProductsUserController с 18 endpoints
9. 📝 Создать ProductsUserModule
10. 📝 Зарегистрировать в AppModule
11. 📝 Создать 4 файла doc.md для групп сервисов
12. 📝 Создать src/docs/products-user-api.md
13. 📝 npm run build

---

## 7. Примеры использования

### Создание продукта

```json
{
  "name": "Молоко 3.2%",
  "lang": "RU",
  "categoryId": "uuid-category-dairy",
  "brandId": "uuid-brand-parmalat",
  "barcode": "4607039290530",
  "nutrition": {
    "caloriesKcal": 59,
    "proteinsG": 2.9,
    "fatsG": 3.2,
    "carbohydratesG": 4.7,
    "sugarsG": 4.7
  }
}
```

### Добавление упаковки

```json
{
  "totalVolumeMl": 1000,
  "priceTotal": 89.90,
  "currency": "RUB",
  "purchasedAt": "2024-01-11T10:00:00Z",
  "store": "Пятёрочка",
  "note": "Акция 1+1"
}
```

### Добавление порции

```json
{
  "name": "Стакан",
  "amountUnits": 1,
  "volumeMl": 250,
  "isDefault": true
}
```

---

## Готовность к реализации ✅

План детально проработан. 18 специализированных сервисов, 18 endpoints, полная работа с i18n, nutrition, packages, servings. Можно приступать.
