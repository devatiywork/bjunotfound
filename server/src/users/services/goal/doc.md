# Goal Services - Документация

## SetGoalService

**Файл:** `set-goal.service.ts`

**Назначение:** Создание новой цели для пользователя.

### Метод: `execute(userId: string, createGoalDto: CreateGoalDto)`

**Описание:**
Создает новую цель для пользователя. Автоматически деактивирует предыдущую активную цель и сохраняет начальный вес (initialWeight) на момент создания цели.

**Параметры:**

- `userId` (string) - ID пользователя
- `createGoalDto` (CreateGoalDto):
  - `targetWeight?` (number) - Целевой вес в кг
  - `targetCalories?` (number) - Целевые калории в день
  - `targetSteps?` (number) - Целевое количество шагов в день
  - `targetBurnedCalories?` (number) - Целевые сожженные калории в день
  - `startDate?` (string) - Дата начала (опционально)
  - `endDate?` (string) - Дата окончания (опционально)

**Возвращаемое значение:**
Созданная цель со всеми полями (id, userId, targetWeight, targetCalories, initialWeight, status, isActive, и т.д.)

**Логика работы:**

1. Проверяет наличие активной цели и деактивирует её
2. Получает последний вес пользователя для поля `initialWeight`
3. Создает новую цель со статусом `IN_PROGRESS` и `isActive: true`

**Особенности:**

- Автоматически деактивирует старую активную цель
- Сохраняет `initialWeight` для отслеживания прогресса
- Конвертирует строковые даты в объекты Date

**Пример:**

```typescript
const goal = await setGoalService.execute('user-id', {
  targetWeight: 70,
  targetCalories: 1800,
  endDate: '2026-03-01',
});
```

---

## GetGoalService

**Файл:** `get-goal.service.ts`

**Назначение:** Получение активной цели пользователя.

### Метод: `execute(userId: string)`

**Описание:**
Возвращает текущую активную цель пользователя (с флагом `isActive: true`).

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Активная цель или `null`, если активной цели нет.

**Особенности:**

- Фильтрует только активные цели (`isActive: true`)
- Сортирует по дате начала (desc), берет самую свежую

**Пример:**

```typescript
const activeGoal = await getGoalService.execute('user-id');
// { id, userId, targetWeight: 70, status: 'IN_PROGRESS', isActive: true, ... }
```

---

## GetGoalsHistoryService

**Файл:** `get-goals-history.service.ts`

**Назначение:** Получение истории всех целей пользователя с автоматическим обновлением статусов.

### Метод: `execute(userId: string)`

**Описание:**
Возвращает все цели пользователя (активные и завершенные) с автоматической проверкой и обновлением статусов для активных целей со статусом `IN_PROGRESS`.

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Массив целей, отсортированных по дате начала (от новых к старым).

**Логика работы:**

1. Получает все цели пользователя
2. Для каждой активной цели со статусом `IN_PROGRESS` выполняет проверку:
   - Если `endDate` прошла, проверяет достижение цели
   - Обновляет статус на `COMPLETED` или `FAILED`
   - Деактивирует цель (`isActive: false`)

**Приватный метод: `updateGoalStatus(goal)`**

Проверяет и обновляет статус цели:

- Если цель без `endDate` или дата не наступила - возвращает без изменений
- Если нет `targetWeight` - автоматически `COMPLETED`
- Иначе:
  - Находит последний вес до `endDate`
  - Сравнивает с целевым весом (допуск ±2 кг)
  - Устанавливает статус `COMPLETED` или `FAILED`

**Особенности:**

- Lazy evaluation: статусы обновляются только при запросе истории
- Допуск достижения цели: ±2 кг от целевого веса
- Цели со статусом `COMPLETED` или `FAILED` не обновляются

**Пример:**

```typescript
const history = await getGoalsHistoryService.execute('user-id');
// [
//   { id, status: 'IN_PROGRESS', isActive: true, ... },
//   { id, status: 'COMPLETED', isActive: false, ... },
//   { id, status: 'FAILED', isActive: false, ... }
// ]
```

---

## DeactivateGoalService

**Файл:** `deactivate-goal.service.ts`

**Назначение:** Ручная деактивация активной цели пользователя.

### Метод: `execute(userId: string)`

**Описание:**
Деактивирует текущую активную цель пользователя без изменения статуса.

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Деактивированная цель с `isActive: false`.

**Исключения:**

- `NotFoundException` - если активная цель не найдена

**Особенности:**

- Не изменяет статус цели (остается `IN_PROGRESS`, `COMPLETED` или `FAILED`)
- Просто устанавливает `isActive: false`

**Пример:**

```typescript
const deactivatedGoal = await deactivateGoalService.execute('user-id');
// { id, status: 'IN_PROGRESS', isActive: false, ... }
```
