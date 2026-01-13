# Dishes API - Документация и примеры запросов

Полная документация по API для работы с блюдами и их ингредиентами.

---

## 🍳 CRUD операции с блюдами

### Создать блюдо

```bash
curl -X POST "http://localhost:5000/api/dishes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Омлет с сыром",
    "description": "Классический омлет с сыром чеддер",
    "portions": 2
  }'
```

**Ответ:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Омлет с сыром",
  "description": "Классический омлет с сыром чеддер",
  "portions": 2,
  "photos": [],
  "status": "DRAFT",
  "isArchived": false,
  "createdAt": "2026-01-13T10:00:00.000Z",
  "updatedAt": "2026-01-13T10:00:00.000Z"
}
```

---

### Получить список блюд

```bash
# Все блюда (с пагинацией)
curl -X GET "http://localhost:5000/api/dishes?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Только READY
curl -X GET "http://localhost:5000/api/dishes?status=READY" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Только DRAFT
curl -X GET "http://localhost:5000/api/dishes?status=DRAFT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ответ:**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Омлет с сыром",
      "description": "Классический омлет",
      "portions": 2,
      "photos": [],
      "status": "DRAFT",
      "isArchived": false,
      "createdAt": "2026-01-13T10:00:00.000Z",
      "updatedAt": "2026-01-13T10:00:00.000Z",
      "_count": {
        "items": 3
      },
      "perPortion": {
        "nutrition": {
          "kcal": 157,
          "proteins": 12.7,
          "fats": 11.5,
          "carbs": 0.7
        },
        "price": 20,
        "currency": "RUB"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### Получить архивированные блюда

```bash
curl -X GET "http://localhost:5000/api/dishes/archived?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Получить блюдо с расчетами КБЖУ и цены

```bash
curl -X GET "http://localhost:5000/api/dishes/{dishId}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ответ:**

```json
{
  "dish": {
    "id": "uuid",
    "userId": "uuid",
    "name": "Омлет с сыром",
    "description": "Классический омлет",
    "portions": 2,
    "photos": [
      "https://res.cloudinary.com/.../omelet1.jpg",
      "https://res.cloudinary.com/.../omelet2.jpg"
    ],
    "status": "DRAFT",
    "isArchived": false,
    "createdAt": "2026-01-13T10:00:00.000Z",
    "updatedAt": "2026-01-13T10:00:00.000Z"
  },
  "items": [
    {
      "id": "uuid",
      "dishId": "uuid",
      "productUserId": "uuid",
      "sortOrder": 0,
      "note": "сырые яйца",
      "measureType": "GRAMS",
      "amountG": 200,
      "amountMl": null,
      "servingId": null,
      "servingsCount": null,
      "productUser": {
        "id": "uuid",
        "names": [
          {
            "lang": "RU",
            "name": "Яйца куриные"
          }
        ],
        "nutrition": {
          "caloriesKcal": 157,
          "proteinsG": 12.7,
          "fatsG": 11.5,
          "carbohydratesG": 0.7
        },
        "packages": [
          {
            "id": "uuid",
            "totalWeightG": 600,
            "priceTotal": 120,
            "currency": "RUB",
            "purchasedAt": "2026-01-10T00:00:00.000Z"
          }
        ]
      }
    }
  ],
  "computed": {
    "totalIngredientsWeight": 200,
    "totals": {
      "kcal": 314,
      "proteins": 25.4,
      "fats": 23,
      "carbs": 1.4,
      "price": 40,
      "currency": "RUB"
    },
    "perPortion": {
      "kcal": 157,
      "proteins": 12.7,
      "fats": 11.5,
      "carbs": 0.7,
      "price": 20,
      "currency": "RUB"
    },
    "per100g": {
      "kcal": 78.5,
      "proteins": 6.35,
      "fats": 5.75,
      "carbs": 0.35
    }
  },
  "issues": []
}
```

---

### Обновить блюдо

```bash
curl -X PATCH "http://localhost:5000/api/dishes/{dishId}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Омлет с сыром и помидорами",
    "portions": 3
  }'
```

---

### Изменить статус блюда

```bash
# Перевести в READY (с валидацией)
curl -X PATCH "http://localhost:5000/api/dishes/{dishId}/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "READY"
  }'

# Вернуть в DRAFT
curl -X PATCH "http://localhost:5000/api/dishes/{dishId}/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DRAFT"
  }'
```

**Примечание:** Переход в READY возможен только если:

- Есть хотя бы один ингредиент
- Нет критичных ошибок (severity: 'error')
- Предупреждения (severity: 'warning') не блокируют переход

---

### Удалить блюдо

```bash
curl -X DELETE "http://localhost:5000/api/dishes/{dishId}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Логика работы:**

- **Первое удаление (блюдо НЕ в архиве):** Перемещает в архив (мягкое удаление, `isArchived = true`)
- **Второе удаление (блюдо УЖЕ в архиве):** Удаляет навсегда с фото и ингредиентами

**Ответ при архивировании:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Омлет с сыром",
  "isArchived": true,
  ...
}
```

**Ответ при полном удалении:**

```json
{
  "message": "Блюдо успешно удалено навсегда",
  "deletedDishId": "uuid",
  "deletedPhotos": 2,
  "deletedItems": 3
}
```

---

### Восстановить блюдо из архива

```bash
curl -X POST "http://localhost:5000/api/dishes/{dishId}/restore" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📸 Управление фото

### Загрузить фото блюда

```bash
curl -X POST "http://localhost:5000/api/dishes/{dishId}/photos" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

**Ответ:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Омлет с сыром",
  "description": "Классический омлет",
  "portions": 2,
  "photos": ["https://res.cloudinary.com/.../photo.jpg"],
  "status": "DRAFT",
  "isArchived": false,
  "createdAt": "2026-01-13T10:00:00.000Z",
  "updatedAt": "2026-01-13T10:00:00.000Z"
}
```

**Примечание:**

- Поддерживаются форматы: JPEG, PNG, WebP
- Максимальный размер: 5MB
- Автоматическая оптимизация: resize до 800x800px, quality auto, WebP

---

### Удалить фото блюда

```bash
curl -X DELETE "http://localhost:5000/api/dishes/{dishId}/photos?photoUrl=https://res.cloudinary.com/.../photo.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ответ:**

```json
{
  "message": "Фото успешно удалено"
}
```

---

## 🥗 Управление ингредиентами

### Добавить ингредиент (граммы)

```bash
curl -X POST "http://localhost:5000/api/dishes/{dishId}/items" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productUserId": "uuid",
    "measureType": "GRAMS",
    "amountG": 200,
    "note": "сырые яйца",
    "sortOrder": 0
  }'
```

---

### Добавить ингредиент (миллилитры)

```bash
curl -X POST "http://localhost:5000/api/dishes/{dishId}/items" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productUserId": "uuid",
    "measureType": "MILLILITERS",
    "amountMl": 250,
    "note": "молоко 3.2%"
  }'
```

---

### Добавить ингредиент (порции)

```bash
curl -X POST "http://localhost:5000/api/dishes/{dishId}/items" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productUserId": "uuid",
    "measureType": "SERVINGS",
    "servingId": "uuid",
    "servingsCount": 4,
    "note": "4 яйца среднего размера"
  }'
```

**Примечание:** `servingId` должен принадлежать указанному `productUserId`

---

### Обновить ингредиент

```bash
# Изменить количество
curl -X PATCH "http://localhost:5000/api/dishes/{dishId}/items/{itemId}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amountG": 250,
    "note": "обновленный комментарий"
  }'

# Изменить тип измерения
curl -X PATCH "http://localhost:5000/api/dishes/{dishId}/items/{itemId}" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "measureType": "SERVINGS",
    "servingId": "uuid",
    "servingsCount": 5
  }'
```

---

### Удалить ингредиент

```bash
- `photos` - массив URL фото (не обязательно при создании)
curl -X DELETE "http://localhost:5000/api/dishes/{dishId}/items/{itemId}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Изменить порядок ингредиентов

```bash
curl -X POST "http://localhost:5000/api/dishes/{dishId}/items/reorder" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": "uuid1", "sortOrder": 0 },
      { "id": "uuid2", "sortOrder": 1 },
      { "id": "uuid3", "sortOrder": 2 }
    ]
  }'
```

---

## 📊 Структура данных

### MeasureType (Тип измерения)

- `GRAMS` - граммы
- `MILLILITERS` - миллилитры
- `SERVINGS` - порции продукта

### DishStatus (Статус блюда)

- `DRAFT` - черновик (можно сохранить с неполными данными)
- `READY` - готово (все ингредиенты корректно посчитаны)

### IssueCode (Коды проблем)

- `MISSING_NUTRITION` - у продукта нет КБЖУ
- `MISSING_PURCHASE` - у продукта нет покупок
- `SERVING_INVALID` - порция не найдена или некорректна
- `VOLUME_APPROXIMATION` - расчет приблизительный (1мл = 1г)
- `PRODUCT_NOT_FOUND` - продукт не найден
- `INVALID_PORTIONS` - количество порций <= 0

---

## ⚠️ Валидация и ограничения

### При создании/обновлении блюда:

- `portions` должно быть > 0
- `name` обязателен при создании

### При добавлении ингредиента:

- **GRAMS:** обязателен только `amountG > 0`
- **MILLILITERS:** обязателен только `amountMl > 0`
- **SERVINGS:** обязательны `servingId` и `servingsCount > 0`
- Порция (`servingId`) должна принадлежать указанному продукту (`productUserId`)
- Пользователь должен быть владельцем блюда и продукта

### При изменении статуса на READY:

- Блюдо должно иметь хотя бы один ингредиент
- Не должно быть issues с `severity: 'error'`

### При загрузке фото:

- Поддерживаемые форматы: JPEG, PNG, WebP
- Максимальный размер файла: 5MB
- Автоматическая оптимизация до 800x800px
- Можно загрузить несколько фото
- Фото загружаются только на существующее блюдо (не при создании)
- Предупреждения (`severity: 'warning'`) не блокируют переход

---

## 🧮 Логика расчетов

### Конвертация в граммы:

- **GRAMS:** `resolvedGrams = amountG`
- **MILLILITERS:** `resolvedGrams = amountMl` (приближение 1:1)
- **SERVINGS:**
  - Если порция в граммах: `resolvedGrams = servingsCount * weightG`
  - Если порция в мл: `resolvedGrams = servingsCount * volumeMl` (приближение 1:1)

### Расчет КБЖУ:

- Коэффициент: `k = resolvedGrams / 100`
- КБЖУ ингредиента = КБЖУ_на_100г \* k
- Итоговые значения: сумма всех ингредиентов
- На порцию: `totals / portions`
- На 100г блюда: `(totals * 100) / totalIngredientsWeight`
  - Всегда рассчитывается от суммы веса ингредиентов

### Расчет цены:

- Берется последняя покупка (по `purchasedAt` или `createdAt`)
- Если покупка в граммах: `price = (priceTotal / totalWeightG) * resolvedGrams`
- Если покупка в мл: `price = (priceTotal / totalVolumeMl) * resolvedMl`
- Общая цена: сумма всех ингредиентов
- На порцию: `totalPrice / portions`

---

## 🔄 Типичные сценарии использования

### Создание блюда с ингредиентами:

```bash
# 1. Создать блюдо
DISH_ID=$(curl -X POST "http://localhost:5000/api/dishes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Омлет","portions":2}' | jq -r '.id')

# 2. Добавить яйца (4 штуки по 60г)
curl -X POST "http://localhost:5000/api/dishes/$DISH_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productUserId":"'$EGGS_PRODUCT_ID'",
    "measureType":"SERVINGS",
    "servingId":"'$EGG_SERVING_ID'",
    "servingsCount":4
  }'

# 3. Добавить молоко (100 мл)
curl -X POST "http://localhost:5000/api/dishes/$DISH_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productUserId":"'$MILK_PRODUCT_ID'",
    "measureType":"MILLILITERS",
    "amountMl":100
  }'

# 4. Добавить сыр (50 г)
curl -X POST "http://localhost:5000/api/dishes/$DISH_ID/items" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productUserId":"'$CHEESE_PRODUCT_ID'",
    "measureType":"GRAMS",
    "amountG":50
  }'

# 5. Получить блюдо с расчетами
curl -X GET "http://localhost:5000/api/dishes/$DISH_ID" \
  -H "Authorization: Bearer $TOKEN"

# 6. Перевести в READY (если нет ошибок)
curl -X PATCH "http://localhost:5000/api/dishes/$DISH_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"READY"}'
```

---

## 🐛 Обработка ошибок

### 400 Bad Request

- Некорректные данные (например, portions <= 0)
- Порция не принадлежит продукту
- Невозможно изменить статус на READY (есть критичные ошибки)

### 401 Unauthorized

- Отсутствует или некорректен токен авторизации

### 403 Forbidden

- Попытка доступа к блюду/продукту другого пользователя

### 404 Not Found

- Блюдо, продукт, ингредиент или порция не найдены

---

## 📝 Примечания

- Все расчеты выполняются динамически при GET запросе
- Ничего не хранится в БД, только входные данные
- Цены всегда актуальные (последняя покупка)
- Округление до 2 знаков после запятой
- Валюта берется из первого ингредиента с ценой
