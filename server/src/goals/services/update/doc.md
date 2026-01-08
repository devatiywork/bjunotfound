# Update Goal Service - Документация

## UpdateGoalService

**Файл:** `update-goal.service.ts`

**Назначение:** Обновление параметров существующей цели.

### Метод: `execute(userId: string, goalId: string, updateGoalDto: UpdateGoalDto)`

**Описание:**
Обновляет данные цели (целевой вес, калории, даты, статус). Проверяет существование цели и права доступа. Нельзя обновлять архивированные цели.

**Параметры:**

- `userId` (string) - ID пользователя
- `goalId` (string) - UUID цели для обновления
- `updateGoalDto` (UpdateGoalDto) - Данные для обновления (все поля опциональны):
  - `targetWeight?` (number) - Новый целевой вес
  - `targetCalories?` (number) - Новые целевые калории
  - `startDate?` (Date) - Новая дата начала
  - `endDate?` (Date) - Новая дата окончания
  - `isActive?` (boolean) - Активна ли цель
  - `status?` (GoalStatus) - Новый статус (IN_PROGRESS/COMPLETED/FAILED)

**Возвращаемое значение:**
Обновленная цель со всеми полями.

**Логика работы:**

1. **Проверка существования:**
   - Ищет цель с фильтром: `id = goalId AND userId = userId AND isArchived = false`
   - Выбрасывает `NotFoundException` если не найдена

2. **Обновление цели:**
   - Применяет изменения из DTO
   - Возвращает обновленную цель

**Исключения:**

- `NotFoundException` - цель не найдена, архивирована или принадлежит другому пользователю

**Особенности:**

- **Частичное обновление:** Можно передать только измененные поля
- **Защита архивированных:** Нельзя обновить архивированную цель
- **Проверка владельца:** Пользователь может обновлять только свои цели
- **Гибкость:** Можно изменить любые параметры цели

**Пример использования:**

```typescript
// Продление срока цели
const updated = await updateGoalService.execute('user-uuid', 'goal-uuid', {
  endDate: new Date('2026-03-01'),
});

// Изменение целевых калорий
const updated = await updateGoalService.execute('user-uuid', 'goal-uuid', {
  targetCalories: 1950,
});

// Активация/деактивация цели
const updated = await updateGoalService.execute('user-uuid', 'goal-uuid', {
  isActive: false,
});

// Изменение нескольких параметров
const updated = await updateGoalService.execute('user-uuid', 'goal-uuid', {
  targetWeight: 76,
  targetCalories: 2000,
  endDate: new Date('2026-04-01'),
});
```

**Применение:**

- Корректировка целевого веса
- Пересчет калорий при изменении активности
- Продление или сокращение срока цели
- Ручное изменение статуса цели
- Активация/деактивация цели

**Важно:**

- Статусы `COMPLETED` и `FAILED` обычно устанавливаются автоматически (lazy evaluation)
- Ручное изменение статуса может понадобиться для корректировки системных ошибок
- После обновления `endDate` цель не будет помечена как просроченная до следующего запроса
- Обновление `targetWeight` не пересчитывает автоматически `targetCalories` - используйте RecalculateGoalRecommendationService
