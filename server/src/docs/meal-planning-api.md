# API Графика питания - Документация

## Оглавление

1. [Типы приемов пищи (MealTypes)](#типы-приемов-пищи-mealtypes)
2. [События питания (MealEvents)](#события-питания-mealevents)
3. [Статистика (MealStatistics)](#статистика-mealstatistics)

---

## Типы приемов пищи (MealTypes)

### Описание логики

**Назначение:** Управление типами приемов пищи для категоризации событий в графике питания.

**Два вида типов:**

1. **Системные типы** (userId = null):
   - Завтрак (BREAKFAST)
   - Обед (LUNCH)
   - Ужин (DINNER)
   - Перекус (SNACK)
   - Созданы сразу
   - Нельзя редактировать или удалить
   - Доступны всем пользователям

2. **Пользовательские типы** (userId = конкретный пользователь):
   - Создаются пользователем ("Второй завтрак", "Перед тренировкой", "Ночной перекус")
   - Можно редактировать (название, порядок, активность)
   - Можно архивировать (мягкое удаление)
   - Видны только владельцу

**Логика работы:**

- При получении списка типов возвращаются: все системные активные + пользовательские активные неархивированные
- Сортировка по полю sortOrder (порядок отображения)
- Архивированные типы не отображаются в списке
- При попытке редактирования системного типа - ошибка 403 Forbidden

**Валидация прав:**

- Для всех операций требуется JWT авторизация
- Системные типы защищены от изменений на уровне сервиса
- Пользователь может управлять только своими типами

---

### API Endpoints

#### 1. Создать пользовательский тип приема пищи

**POST** `/meal-types`

**Описание:** Создает новый пользовательский тип приема пищи для текущего пользователя.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Тело запроса:**

```json
{
  "name": "Второй завтрак",
  "sortOrder": 5
}
```

**Поля:**

- `name` (string, обязательно) - название типа приема пищи
- `sortOrder` (integer, опционально) - порядок отображения (по умолчанию 0)

**Успешный ответ (201 Created):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174001",
  "code": null,
  "name": "Второй завтрак",
  "sortOrder": 5,
  "isActive": true,
  "isArchived": false,
  "deletedAt": null,
  "deletedBy": null,
  "createdAt": "2026-01-16T10:00:00.000Z",
  "updatedAt": "2026-01-16T10:00:00.000Z"
}
```

**Пример curl:**

```bash
curl -X POST "http://localhost:5000/meal-types" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Второй завтрак",
    "sortOrder": 5
  }'
```

**Возможные ошибки:**

- `400 Bad Request` - ошибка валидации (пустое название, неверный тип данных)
- `401 Unauthorized` - не авторизован (отсутствует или невалидный JWT токен)

---

#### 2. Получить все типы приемов пищи

**GET** `/meal-types`

**Описание:** Возвращает все доступные типы приемов пищи: системные (Завтрак, Обед, Ужин, Перекус) + пользовательские типы текущего пользователя. Типы отсортированы по sortOrder.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Успешный ответ (200 OK):**

```json
[
  {
    "id": "sys-breakfast",
    "userId": null,
    "code": "BREAKFAST",
    "name": "Завтрак",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "id": "sys-lunch",
    "userId": null,
    "code": "LUNCH",
    "name": "Обед",
    "sortOrder": 2,
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "id": "sys-dinner",
    "userId": null,
    "code": "DINNER",
    "name": "Ужин",
    "sortOrder": 3,
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "id": "sys-snack",
    "userId": null,
    "code": "SNACK",
    "name": "Перекус",
    "sortOrder": 4,
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  },
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-id",
    "code": null,
    "name": "Второй завтрак",
    "sortOrder": 5,
    "isActive": true,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:00:00.000Z"
  }
]
```

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-types" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Возможные ошибки:**

- `401 Unauthorized` - не авторизован

---

#### 3. Обновить пользовательский тип приема пищи

**PATCH** `/meal-types/:id`

**Описание:** Обновляет название, порядок или статус активности пользовательского типа. Системные типы обновлять нельзя.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Параметры URL:**

- `id` (string) - ID типа приема пищи

**Тело запроса (все поля опциональны):**

```json
{
  "name": "Второй завтрак (обновлено)",
  "sortOrder": 6,
  "isActive": false
}
```

**Успешный ответ (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id",
  "code": null,
  "name": "Второй завтрак (обновлено)",
  "sortOrder": 6,
  "isActive": false,
  "isArchived": false,
  "deletedAt": null,
  "deletedBy": null,
  "createdAt": "2026-01-16T10:00:00.000Z",
  "updatedAt": "2026-01-16T10:30:00.000Z"
}
```

**Пример curl:**

```bash
curl -X PATCH "http://localhost:5000/meal-types/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Второй завтрак (обновлено)",
    "isActive": false
  }'
```

**Возможные ошибки:**

- `400 Bad Request` - ошибка валидации
- `401 Unauthorized` - не авторизован
- `403 Forbidden` - попытка редактирования системного типа или чужого типа
- `404 Not Found` - тип приема пищи не найден

---

#### 4. Архивировать пользовательский тип

**DELETE** `/meal-types/:id`

**Описание:** Архивирует (мягкое удаление) пользовательский тип приема пищи. Системные типы архивировать нельзя. Архивированные типы не отображаются в списке.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Параметры URL:**

- `id` (string) - ID типа приема пищи

**Успешный ответ (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id",
  "code": null,
  "name": "Второй завтрак",
  "sortOrder": 5,
  "isActive": true,
  "isArchived": true,
  "deletedAt": "2026-01-16T11:00:00.000Z",
  "deletedBy": "user-id",
  "createdAt": "2026-01-16T10:00:00.000Z",
  "updatedAt": "2026-01-16T11:00:00.000Z"
}
```

**Пример curl:**

```bash
curl -X DELETE "http://localhost:5000/meal-types/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Возможные ошибки:**

- `401 Unauthorized` - не авторизован
- `403 Forbidden` - попытка архивирования системного типа или чужого типа
- `404 Not Found` - тип приема пищи не найден

---

#### 5. Изменить порядок отображения

**PATCH** `/meal-types/:id/reorder`

**Описание:** Изменяет порядок отображения пользовательского типа приема пищи в списках. Системные типы переупорядочивать нельзя.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Параметры URL:**

- `id` (string) - ID типа приема пищи

**Тело запроса:**

```json
{
  "sortOrder": 3
}
```

**Успешный ответ (200 OK):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id",
  "code": null,
  "name": "Второй завтрак",
  "sortOrder": 3,
  "isActive": true,
  "isArchived": false,
  "deletedAt": null,
  "deletedBy": null,
  "createdAt": "2026-01-16T10:00:00.000Z",
  "updatedAt": "2026-01-16T11:30:00.000Z"
}
```

**Пример curl:**

```bash
curl -X PATCH "http://localhost:5000/meal-types/123e4567-e89b-12d3-a456-426614174000/reorder" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sortOrder": 3
  }'
```

**Возможные ошибки:**

- `400 Bad Request` - ошибка валидации (sortOrder должен быть неотрицательным числом)
- `401 Unauthorized` - не авторизован
- `403 Forbidden` - попытка переупорядочить системный тип или чужой тип
- `404 Not Found` - тип приема пищи не найден

---

## События питания (MealEvents)

### Описание логики

**Назначение:** Управление событиями питания в календаре - это и есть "график питания". Каждое событие представляет собой запланированное или выполненное потребление блюда в конкретное время.

**Основные концепции:**

1. **Событие питания (MealEvent):**
   - Привязано к конкретному блюду (Dish)
   - Имеет дату-время начала (startAt)
   - Указывается количество порций блюда (portions)
   - Может иметь тип приема пищи (mealTypeId) - например, "Завтрак", "Обед"
   - Имеет статус: PLANNED (запланировано), COMPLETED (выполнено), SKIPPED (пропущено)

2. **Статусы событий:**
   - **PLANNED** - событие создано, но еще не отмечено как выполненное
   - **COMPLETED** - пользователь отметил событие как выполненное (съел блюдо), записывается completedAt
   - **SKIPPED** - пользователь отметил событие как пропущенное (не съел), записывается completedAt

3. **Логика работы:**
   - События хранятся в UTC (поле startAt), но можно указать timezone события
   - При создании события проверяется существование блюда (dishId)
   - При создании события проверяется существование типа приема пищи (mealTypeId), если указан
   - Количество порций (portions) независимо от portions в блюде (можно съесть 1.5 порции омлета)
   - События можно архивировать (мягкое удаление) - isArchived = true
   - Архивированные события не отображаются в календаре и статистике
   - **НЕТ восстановления** - если пользователь удалил, значит удалил навсегда

4. **Расчет КБЖУ и цены:**
   - Рассчитывается динамически на основе блюда и количества порций
   - КБЖУ события = (КБЖУ блюда / portions блюда) × portions события
   - Цена события = (цена блюда / portions блюда) × portions события
   - Расчет происходит при запросе события (не хранится в БД)

5. **Валидация:**
   - Проверка прав: пользователь может управлять только своими событиями
   - Проверка существования блюда при создании/обновлении
   - Проверка существования типа приема пищи (если указан)
   - portions должен быть > 0

---

### API Endpoints

#### 1. Создать событие питания

**POST** `/meal-events`

**Описание:** Создает новое событие питания в календаре пользователя.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Тело запроса:**

```json
{
  "startAt": "2026-01-20T08:00:00.000Z",
  "dishId": "dish-id-123",
  "portions": 1.5,
  "mealTypeId": "breakfast-type-id",
  "note": "С огурцами",
  "timezone": "Europe/Moscow"
}
```

**Поля:**

- `startAt` (string, обязательно) - дата и время начала события в ISO 8601
- `dishId` (string, обязательно) - ID блюда
- `portions` (number, опционально) - количество порций (по умолчанию 1)
- `mealTypeId` (string, опционально) - ID типа приема пищи
- `note` (string, опционально) - комментарий к событию
- `timezone` (string, опционально) - часовой пояс события

**Успешный ответ (201 Created):**

```json
{
  "id": "event-id-123",
  "userId": "user-id",
  "startAt": "2026-01-20T08:00:00.000Z",
  "dishId": "dish-id-123",
  "portions": 1.5,
  "mealTypeId": "breakfast-type-id",
  "note": "С огурцами",
  "status": "PLANNED",
  "timezone": "Europe/Moscow",
  "completedAt": null,
  "isArchived": false,
  "createdAt": "2026-01-16T10:00:00.000Z",
  "updatedAt": "2026-01-16T10:00:00.000Z"
}
```

**Пример curl:**

```bash
curl -X POST "http://localhost:5000/meal-events" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startAt": "2026-01-20T08:00:00.000Z",
    "dishId": "dish-id-123",
    "portions": 1.5,
    "mealTypeId": "breakfast-type-id",
    "note": "С огурцами",
    "timezone": "Europe/Moscow"
  }'
```

---

#### 2. Получить события за период

**GET** `/meal-events/period`

**Описание:** Возвращает список событий питания за указанный период.

**Query параметры:**

- `startDate` (date, опционально) - начало периода (по умолчанию: сегодня)
- `endDate` (date, опционально) - конец периода (по умолчанию: через 7 дней)
- `status` (enum, опционально) - фильтр по статусу: PLANNED, COMPLETED, SKIPPED
- `mealTypeId` (string, опционально) - фильтр по типу приема пищи

**Успешный ответ (200 OK):**

```json
[
  {
    "id": "event-id-123",
    "userId": "user-id",
    "startAt": "2026-01-20T08:00:00.000Z",
    "portions": 1.5,
    "status": "PLANNED",
    "note": "С огурцами",
    "dish": {
      "id": "dish-id-123",
      "name": "Омлет с сыром",
      "servingSize": 200
    },
    "mealType": {
      "id": "breakfast-type-id",
      "name": "Завтрак"
    }
  }
]
```

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-events/period?startDate=2026-01-20&endDate=2026-01-27" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 3. Получить событие по ID

**GET** `/meal-events/:id`

**Описание:** Возвращает детальную информацию о событии с расчетом КБЖУ.

**Успешный ответ (200 OK):**

```json
{
  "id": "event-id-123",
  "userId": "user-id",
  "startAt": "2026-01-20T08:00:00.000Z",
  "portions": 1.5,
  "status": "PLANNED",
  "note": "С огурцами",
  "timezone": "Europe/Moscow",
  "dish": {
    "id": "dish-id-123",
    "name": "Омлет с сыром",
    "servingSize": 200,
    "ingredients": [...]
  },
  "mealType": {
    "id": "breakfast-type-id",
    "name": "Завтрак"
  },
  "nutrition": {
    "calories": 450,
    "proteins": 25.5,
    "fats": 30.2,
    "carbs": 8.5
  }
}
```

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-events/event-id-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 4. Обновить событие

**PATCH** `/meal-events/:id`

**Описание:** Обновляет параметры события питания.

**Тело запроса:**

```json
{
  "startAt": "2026-01-20T09:00:00.000Z",
  "portions": 2,
  "mealTypeId": "lunch-type-id",
  "note": "Увеличил порцию"
}
```

**Пример curl:**

```bash
curl -X PATCH "http://localhost:5000/meal-events/event-id-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portions": 2,
    "note": "Увеличил порцию"
  }'
```

---

#### 5. Изменить статус события

**PATCH** `/meal-events/:id/status`

**Описание:** Изменяет статус события (COMPLETED или SKIPPED). Записывается время выполнения.

**Тело запроса:**

```json
{
  "status": "COMPLETED"
}
```

**Успешный ответ (200 OK):**

```json
{
  "id": "event-id-123",
  "status": "COMPLETED",
  "completedAt": "2026-01-20T08:15:00.000Z",
  ...
}
```

**Пример curl:**

```bash
curl -X PATCH "http://localhost:5000/meal-events/event-id-123/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

---

#### 6. Архивировать событие

**DELETE** `/meal-events/:id`

**Описание:** Архивирует событие (мягкое удаление). Восстановление невозможно.

**Пример curl:**

```bash
curl -X DELETE "http://localhost:5000/meal-events/event-id-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Статистика (MealStatistics)

### Описание логики

**Назначение:** Аналитика и статистика по графику питания - расчет КБЖУ, цен, списков покупок и сравнение с целями пользователя.

**Основные концепции:**

1. **Статистика за период (Period Stats):**
   - Считаются только неархивированные события
   - Учитываются события со статусами PLANNED и COMPLETED (SKIPPED не учитываются в расчетах КБЖУ)
   - Рассчитывается общее КБЖУ за период (сумма всех событий)
   - Рассчитывается общая стоимость питания
   - Рассчитывается среднее КБЖУ в день
   - Подсчитывается количество дней с планом, выполненных дней, пропущенных дней
   - Рассчитывается процент покрытия (сколько дней запланировано из всего периода)
   - Сравнение с активными целями пользователя

2. **Календарь с индикаторами (Calendar Stats):**
   - Для каждого дня периода возвращаются индикаторы:
     - Есть ли события на этот день (hasPlan)
     - Сколько событий выполнено (completedCount)
     - Сколько событий пропущено (skippedCount)
     - Сколько событий запланировано но не выполнено (plannedCount)
   - Полезно для визуализации календаря на фронтенде (зеленые/красные/желтые дни)

3. **Список покупок (Shopping List):**
   - Собирает все ингредиенты из блюд событий за период
   - Группирует по продуктам (один продукт может быть в нескольких блюдах)
   - Суммирует количество каждого продукта (граммы/миллилитры)
   - Рассчитывает стоимость на основе последних покупок продуктов
   - Группирует по категориям продуктов для удобства
   - Указывает, в каких блюдах используется продукт

4. **Дневная статистика КБЖУ (Daily Nutrition):**
   - Для каждого дня периода рассчитывается КБЖУ
   - Разбивка по типам приемов пищи (завтрак, обед, ужин и т.д.)
   - Показывает распределение калорий в течение дня
   - Полезно для анализа паттернов питания

5. **Сравнение с целями (Nutrition Comparison):**
   - Берется активная цель пользователя (targetCalories из таблицы goals)
   - Сравнивается фактическое потребление с целевым
   - Рассчитывается отклонение (дефицит/профицит)
   - Показывается процент выполнения цели
   - Рекомендации по корректировке

**Логика расчетов:**

- КБЖУ события = (КБЖУ блюда ÷ порции блюда) × порции события
- Цена события = (цена блюда ÷ порции блюда) × порции события
- Цена блюда = сумма цен всех ингредиентов (на основе последних покупок)
- КБЖУ блюда = сумма КБЖУ всех ингредиентов
- Среднее КБЖУ в день = общее КБЖУ ÷ количество дней периода
- Процент покрытия = (дни с планом ÷ всего дней) × 100%

**Особенности:**

- Все расчеты динамические (не хранятся в БД)
- Если у продукта нет цены (нет покупок) - цена не учитывается, но КБЖУ считается
- Если у продукта нет КБЖУ - выдается предупреждение, но расчет продолжается
- Архивированные события не участвуют в статистике
- События со статусом SKIPPED не учитываются в расчетах КБЖУ (но учитываются в статусной статистике)

---

### API Endpoints

#### 1. Статистика за период

**GET** `/meal-statistics/period-stats`

**Описание:** Возвращает агрегированную статистику по событиям питания за указанный период.

**Query параметры:**

- `startDate` (date, опционально) - начало периода (по умолчанию: 7 дней назад)
- `endDate` (date, опционально) - конец периода (по умолчанию: сегодня)

**Успешный ответ (200 OK):**

```json
{
  "period": {
    "startDate": "2026-01-08",
    "endDate": "2026-01-15",
    "totalDays": 7
  },
  "events": {
    "total": 21,
    "completed": 18,
    "skipped": 1,
    "planned": 2,
    "completionRate": 86
  },
  "nutrition": {
    "total": {
      "calories": 14000,
      "proteins": 560.5,
      "fats": 420.3,
      "carbs": 1750.8
    },
    "averagePerDay": {
      "calories": 2000,
      "proteins": 80.1,
      "fats": 60.0,
      "carbs": 250.1
    }
  },
  "dishes": {
    "uniqueCount": 12,
    "mostFrequent": [
      { "dishId": "uuid-1", "dishName": "Овсянка с ягодами", "count": 5 },
      { "dishId": "uuid-2", "dishName": "Куриная грудка с рисом", "count": 4 }
    ]
  }
}
```

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-statistics/period-stats?startDate=2026-01-08&endDate=2026-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 2. Календарь с индикаторами

**GET** `/meal-statistics/calendar`

**Описание:** Возвращает статистику по дням для отображения в календаре.

**Query параметры:**

- `startDate` (date, опционально) - начало периода (по умолчанию: 1 число текущего месяца)
- `endDate` (date, опционально) - конец периода (по умолчанию: последний день месяца)

**Успешный ответ (200 OK):**

```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "days": [
    {
      "date": "2026-01-15",
      "events": {
        "total": 3,
        "completed": 2,
        "skipped": 0,
        "planned": 1
      },
      "calories": 1850
    }
  ],
  "summary": {
    "totalDays": 31,
    "daysWithEvents": 28,
    "averageEventsPerDay": 3.2,
    "averageCaloriesPerDay": 1920
  }
}
```

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-statistics/calendar?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 3. Список покупок

**GET** `/meal-statistics/shopping-list`

**Описание:** Генерирует список продуктов для покупки на основе запланированных событий (статус PLANNED). Рассчитывает стоимость каждого продукта и общую стоимость на основе последних покупок.

**Query параметры:**

- `startDate` (date, опционально) - начало периода (по умолчанию: сегодня)
- `endDate` (date, опционально) - конец периода (по умолчанию: через 7 дней)

**Успешный ответ (200 OK):**

```json
{
  "period": {
    "startDate": "2026-01-15",
    "endDate": "2026-01-22"
  },
  "items": [
    {
      "productId": "uuid-1",
      "productName": "Куриная грудка",
      "brandName": "Петелинка",
      "totalGrams": 1200,
      "estimatedPrice": 420.5,
      "pricePerGram": 0.3504,
      "currency": "RUB",
      "events": [
        {
          "eventId": "uuid-event-1",
          "dishName": "Куриная грудка с рисом",
          "date": "2026-01-16",
          "grams": 300
        },
        {
          "eventId": "uuid-event-2",
          "dishName": "Куриный салат",
          "date": "2026-01-18",
          "grams": 200
        }
      ]
    },
    {
      "productId": "uuid-2",
      "productName": "Яйцо куриное",
      "brandName": null,
      "totalGrams": 360,
      "estimatedPrice": 54.0,
      "pricePerGram": 0.15,
      "currency": "RUB",
      "events": [
        {
          "eventId": "uuid-event-3",
          "dishName": "Омлет",
          "date": "2026-01-17",
          "grams": 180
        }
      ]
    },
    {
      "productId": "uuid-3",
      "productName": "Специи",
      "brandName": null,
      "totalGrams": 10,
      "estimatedPrice": null,
      "pricePerGram": null,
      "currency": null,
      "events": [
        {
          "eventId": "uuid-event-1",
          "dishName": "Куриная грудка с рисом",
          "date": "2026-01-16",
          "grams": 5
        }
      ]
    }
  ],
  "summary": {
    "totalProducts": 15,
    "totalEvents": 21,
    "totalEstimatedPrice": 2450.75,
    "currency": "RUB",
    "productsWithoutPrice": 2
  }
}
```

**Поля ответа:**

- `items[].estimatedPrice` - расчётная цена за нужное количество продукта (на основе последней покупки)
- `items[].pricePerGram` - цена за 1 грамм продукта
- `items[].currency` - валюта (из последней покупки)
- `summary.totalEstimatedPrice` - общая расчётная стоимость всех продуктов (только тех, у которых есть цена)
- `summary.productsWithoutPrice` - количество продуктов без информации о цене (нет покупок)

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-statistics/shopping-list?startDate=2026-01-15&endDate=2026-01-22" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### 4. Дневное питание

**GET** `/meal-statistics/daily`

**Описание:** Возвращает детальную информацию о питании за конкретный день с разбивкой по типам приемов пищи.

**Query параметры:**

- `date` (date, опционально) - дата (по умолчанию: сегодня)

**Успешный ответ (200 OK):**

```json
{
  "date": "2026-01-15",
  "meals": [
    {
      "mealTypeId": "uuid-breakfast",
      "mealTypeName": "Завтрак",
      "events": [
        {
          "eventId": "uuid-1",
          "dishId": "uuid-dish-1",
          "dishName": "Овсянка с ягодами",
          "portions": 1,
          "status": "COMPLETED",
          "startAt": "2026-01-15T08:00:00.000Z",
          "nutrition": {
            "calories": 350,
            "proteins": 12.5,
            "fats": 8.2,
            "carbs": 55.3
          }
        }
      ],
      "totals": {
        "calories": 350,
        "proteins": 12.5,
        "fats": 8.2,
        "carbs": 55.3
      }
    }
  ],
  "totals": {
    "consumed": {
      "calories": 1650,
      "proteins": 85.2,
      "fats": 52.1,
      "carbs": 195.8
    },
    "planned": {
      "calories": 450,
      "proteins": 25.0,
      "fats": 15.0,
      "carbs": 60.0
    }
  },
  "goal": { "calories": 2000, "proteins": null, "fats": null, "carbs": null },
  "remaining": {
    "calories": 350,
    "proteins": null,
    "fats": null,
    "carbs": null
  }
}
```

**Пример curl:**

```bash
curl -X GET "http://localhost:5000/meal-statistics/daily?date=2026-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Общие принципы работы API

### Авторизация

Все эндпоинты требуют JWT авторизацию через заголовок:

```
Authorization: Bearer <JWT_TOKEN>
```

### Форматы данных

- **Даты-времени:** ISO 8601 формат в UTC (например, `2026-01-20T08:00:00.000Z`)
- **Даты без времени:** YYYY-MM-DD формат (например, `2026-01-20`)
- **Числа:** Используются float для calories, protein, fat, carbs, price, portions
- **ID:** UUID формат (например, `123e4567-e89b-12d3-a456-426614174000`)

### Коды ответов

- `200 OK` - успешное выполнение запроса
- `201 Created` - успешное создание ресурса
- `400 Bad Request` - ошибка валидации данных
- `401 Unauthorized` - не авторизован (нет или невалидный JWT токен)
- `403 Forbidden` - нет прав доступа (попытка изменить чужой ресурс или системный)
- `404 Not Found` - ресурс не найден
- `500 Internal Server Error` - внутренняя ошибка сервера

### Валидация

- Все обязательные поля проверяются на наличие
- Типы данных проверяются автоматически (class-validator)
- Дополнительные проверки: portions > 0, startDate <= endDate, etc.
- При ошибке валидации возвращается список всех ошибок

### Архивирование (Soft Delete)

- Используется для всех пользовательских данных
- Поля: `isArchived`, `deletedAt`, `deletedBy`
- Архивированные данные не отображаются в обычных списках
- Системные данные (типы приемов пищи) не архивируются

### Расчеты КБЖУ

- Все расчеты динамические (не хранятся в БД)
- Расчет на момент запроса на основе текущих данных о блюдах и продуктах
- Если у продукта нет КБЖУ - возвращается warning в поле `issues`
- Если у продукта нет цены - цена не учитывается

---

## Дальнейшее развитие

### Планируется в будущем:

1. **Уведомления в Telegram:**
   - Напоминания о приемах пищи за 15 минут до события
   - Подтверждение выполнения события через бота
   - Еженедельная статистика

2. **Рецепты и рекомендации:**
   - AI-рекомендации блюд на основе целей и предпочтений
   - Автоматическая генерация плана питания на неделю
   - Рекомендации по корректировке рациона

3. **Интеграция с другими сервисами:**
   - Синхронизация с фитнес-трекерами
   - Импорт/экспорт данных
   - Публичные рецепты и планы питания

4. **Расширенная аналитика:**
   - Графики изменения КБЖУ по неделям/месяцам
   - Анализ паттернов питания
   - Сравнение с другими пользователями (анонимно)

---

**Версия документации:** 1.0  
**Дата обновления:** 16 января 2026 г.  
**Статус реализации:**

- ✅ **MealTypes** - модуль реализован (CRUD, Swagger)
- ✅ **MealEvents** - модуль реализован (CRUD, изменение статуса, Swagger)
- ✅ **MealStatistics** - модуль реализован (period-stats, calendar, shopping-list, daily, Swagger)
