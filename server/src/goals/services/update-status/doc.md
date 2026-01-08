# Update Status Services - Документация

## UpdateExpiredGoalsService

**Файл:** `update-expired-goals.service.ts`

**Назначение:** Автоматическое обновление статусов просроченных целей (lazy evaluation).

### Метод: `execute(userId: string)`

**Описание:**
Находит все цели пользователя со статусом IN_PROGRESS, у которых дата окончания уже прошла, и обновляет их статус на FAILED. Это вспомогательный сервис, вызываемый перед получением списка целей для обеспечения актуальности статусов.

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
`Promise<void>` - метод не возвращает данных, только обновляет БД.

**Логика работы:**

1. **Получение текущей даты:**
   - `today = new Date()`

2. **Массовое обновление:**
   - Фильтр: `userId = userId AND status = IN_PROGRESS AND isArchived = false AND endDate < today`
   - Обновление: `status = FAILED, isActive = false`

**Особенности:**

- **Lazy evaluation:** Выполняется только при запросе данных, не в фоне
- **Только IN_PROGRESS:** Не трогает COMPLETED и FAILED цели (иммутабельность финальных статусов)
- **Массовое обновление:** Использует `updateMany` для эффективности
- **Не возвращает данные:** Метод void, только side effect в БД

**Когда вызывается:**

- Перед `getUserGoals()`
- Перед `getActiveGoals()`
- Перед `getAllGoals()`
- Перед `getGoalById()`
- Перед `getGoalProgress()`

**Пример логики:**

```typescript
// До вызова (endDate: 2026-01-01, сегодня: 2026-01-06):
// Goal { id: '123', status: 'IN_PROGRESS', endDate: '2026-01-01', isActive: true }

await updateExpiredGoalsService.execute('user-uuid');

// После вызова:
// Goal { id: '123', status: 'FAILED', endDate: '2026-01-01', isActive: false }
```

**Применение:**

- Обеспечение актуальности статусов без cron-задач
- Автоматическая обработка просроченных целей
- Часть паттерна lazy evaluation в системе

---

## UpdateGoalStatusesService

**Файл:** `update-goal-statuses.service.ts`

**Назначение:** Автоматическое обновление статусов целей на основе текущего веса (lazy evaluation).

### Метод: `execute(userId: string, currentWeight: number)`

**Описание:**
Проверяет все цели пользователя со статусом IN_PROGRESS и обновляет статус на COMPLETED, если текущий вес достиг целевого (с допуском ±0.5 кг). Поддерживает как похудение, так и набор веса.

**Параметры:**

- `userId` (string) - ID пользователя
- `currentWeight` (number) - Текущий вес пользователя (кг)

**Возвращаемое значение:**
`Promise<void>` - метод не возвращает данных, только обновляет БД.

**Логика работы:**

1. **Получение целей:**
   - Фильтр: `userId = userId AND status = IN_PROGRESS AND isArchived = false AND targetWeight != null`

2. **Проверка каждой цели:**
   - Пропускает цели без targetWeight
   - Определяет направление (похудение/набор):
     - Использует `initialWeight` если есть
     - Иначе сравнивает currentWeight с targetWeight
   - Проверяет достижение с допуском ±0.5 кг:
     - Похудение: `currentWeight <= targetWeight + 0.5`
     - Набор: `currentWeight >= targetWeight - 0.5`

3. **Обновление достигнутых:**
   - Если цель достигнута:
     - `status = COMPLETED`
     - `isActive = false`

**Особенности:**

- **Lazy evaluation:** Вызывается при запросе данных, не в фоне
- **Только IN_PROGRESS:** Не трогает COMPLETED и FAILED (иммутабельность)
- **Допуск ±0.5 кг:** Учитывает естественные колебания веса
- **Двунаправленность:** Корректно работает для похудения и набора
- **Цикл по целям:** Индивидуальное обновление каждой достигнутой цели

**Когда вызывается:**

- После получения последнего веса в `getUserGoals()`
- После получения последнего веса в `getActiveGoals()`
- После получения последнего веса в `getAllGoals()`
- После получения последнего веса в `getGoalById()`
- В `getGoalProgress()` для актуализации статуса

**Пример логики (похудение):**

```typescript
// До вызова:
// Goal { targetWeight: 75, initialWeight: 80, status: 'IN_PROGRESS' }
// currentWeight: 75.3

await updateGoalStatusesService.execute('user-uuid', 75.3);

// После вызова:
// Goal { targetWeight: 75, initialWeight: 80, status: 'COMPLETED', isActive: false }
// Достигнута: 75.3 <= 75 + 0.5 (true)
```

**Пример логики (набор):**

```typescript
// До вызова:
// Goal { targetWeight: 75, initialWeight: 70, status: 'IN_PROGRESS' }
// currentWeight: 74.7

await updateGoalStatusesService.execute('user-uuid', 74.7);

// После вызова:
// Goal { targetWeight: 75, initialWeight: 70, status: 'COMPLETED', isActive: false }
// Достигнута: 74.7 >= 75 - 0.5 (true)
```

**Пример (цель не достигнута):**

```typescript
// Goal { targetWeight: 75, initialWeight: 80, status: 'IN_PROGRESS' }
// currentWeight: 77

await updateGoalStatusesService.execute('user-uuid', 77);

// После вызова:
// Goal { targetWeight: 75, initialWeight: 80, status: 'IN_PROGRESS' }
// Не достигнута: 77 > 75.5
```

**Применение:**

- Автоматическая фиксация достижения цели
- Обновление статусов без ручного вмешательства
- Часть паттерна lazy evaluation

**Важно:**

- Допуск ±0.5 кг учитывает естественные колебания веса (вода, время суток)
- Если initialWeight не сохранен (старые цели), направление определяется по currentWeight vs targetWeight
- Множественные цели могут быть отмечены как завершенные одновременно
- Обновление происходит индивидуально для каждой цели (не массовое)

**Взаимодействие двух сервисов:**

```typescript
// Типичный workflow в GetActiveGoalsService:

// 1. Проверить просроченные
await updateExpiredGoalsService.execute(userId);
// Все просроченные IN_PROGRESS → FAILED

// 2. Получить текущий вес
const latestWeight = await prisma.weight.findFirst(...);

// 3. Проверить достигнутые
if (latestWeight) {
  await updateGoalStatusesService.execute(userId, latestWeight.weight);
  // Все достигнутые IN_PROGRESS → COMPLETED
}

// 4. Получить цели с актуальными статусами
const goals = await prisma.goal.findMany(...);
```
