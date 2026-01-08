# Recalculate Goal Recommendation Service - Документация

## RecalculateGoalRecommendationService

**Файл:** `recalculate-goal-recommendation.service.ts`

**Назначение:** Расчет рекомендации по пересчету калорий для текущей цели без изменения самой цели.

### Метод: `execute(userId: string, goalId: string)`

**Описание:**
Рассчитывает рекомендуемые калории для достижения оставшейся части цели в оставшееся время. НЕ изменяет цель автоматически - только предоставляет рекомендацию. Пользователь может принять рекомендацию и обновить цель вручную через UpdateGoalService.

**Параметры:**

- `userId` (string) - ID пользователя
- `goalId` (string) - UUID цели

**Возвращаемое значение:**
Объект с рекомендацией:

```typescript
{
  goalId: string,
  currentCalories: number,      // Текущие целевые калории
  recommendedCalories: number,  // Рекомендуемые калории
  currentWeight: number,        // Текущий вес
  targetWeight: number,         // Целевой вес
  remainingDays: number,        // Осталось дней до endDate
  isRealistic: boolean,         // Реалистична ли цель
  warning?: string,            // Предупреждение (если нереалистична)
  message: string              // Текстовое сообщение о рекомендации
}
```

**Логика работы:**

1. **Проверка существования:**
   - Ищет цель: `id = goalId AND userId = userId AND isArchived = false`
   - Выбрасывает `NotFoundException` если не найдена

2. **Проверка статуса:**
   - Проверяет `status === IN_PROGRESS`
   - Выбрасывает `BadRequestException` для завершенных/проваленных целей

3. **Валидация данных:**
   - Проверяет наличие targetWeight и endDate
   - Выбрасывает `BadRequestException` если отсутствуют

4. **Получение текущего веса:**
   - Ищет последнюю запись веса
   - Выбрасывает `BadRequestException` если не найдена

5. **Получение профиля пользователя:**
   - Загружает данные с уровнем активности
   - Выбрасывает `NotFoundException` если не найден

6. **Расчет оставшихся дней:**
   - `remainingDays` = (endDate - today) / (1000 _ 60 _ 60 \* 24)
   - Выбрасывает `BadRequestException` если remainingDays <= 0

7. **Расчет рекомендуемых калорий:**
   - Использует текущий вес (не начальный!)
   - Рассчитывает для оставшегося периода
   - Проверяет реалистичность и безопасность

8. **Формирование сообщения:**
   - Если калории совпадают: "оптимальны, изменение не требуется"
   - Если нужно увеличить: "увеличить на X ккал/день"
   - Если нужно снизить: "снизить на X ккал/день"

**Исключения:**

- `NotFoundException` - цель не найдена
- `BadRequestException` - пересчет доступен только для IN_PROGRESS целей
- `BadRequestException` - у цели отсутствует targetWeight или endDate
- `BadRequestException` - не найдена запись веса
- `NotFoundException` - пользователь не найден
- `BadRequestException` - срок цели истек

**Особенности:**

- **Иммутабельность:** НЕ изменяет цель, только рекомендация
- **Актуальный расчет:** Использует текущий вес, а не начальный
- **Оставшееся время:** Рассчитывает для оставшегося периода
- **Безопасность:** Проверяет минимальные калории и максимальный дефицит

**Пример использования (похудение с отставанием):**

```typescript
// Цель: 80 → 75 кг, осталось 30 дней, текущие калории 2000
// Текущий вес: 78 кг (нужно сбросить еще 3 кг)

const rec = await recalculateGoalRecommendationService.execute(
  'user-uuid',
  'goal-uuid',
);

// Результат:
// {
//   goalId: 'goal-uuid',
//   currentCalories: 2000,
//   recommendedCalories: 1850,  // нужно снизить для догона
//   currentWeight: 78,
//   targetWeight: 75,
//   remainingDays: 30,
//   isRealistic: true,
//   message: 'Рекомендуем снизить калории на 150 ккал/день'
// }
```

**Пример (калории оптимальны):**

```typescript
// Прогресс идет точно по графику

const rec = await recalculateGoalRecommendationService.execute(
  'user-uuid',
  'goal-uuid',
);

// Результат:
// {
//   ...
//   currentCalories: 1900,
//   recommendedCalories: 1900,
//   message: 'Текущие калории оптимальны, изменение не требуется.'
// }
```

**Пример (опережение графика):**

```typescript
// Цель: 80 → 75 кг, осталось 40 дней
// Текущий вес: 76 кг (впереди графика, можно расслабиться)

const rec = await recalculateGoalRecommendationService.execute(
  'user-uuid',
  'goal-uuid',
);

// Результат:
// {
//   ...
//   currentCalories: 1800,
//   recommendedCalories: 1950,  // можно немного увеличить
//   message: 'Рекомендуем увеличить калории на 150 ккал/день'
// }
```

**Пример (нереалистичная цель):**

```typescript
// Цель: 80 → 70 кг, осталось 10 дней
// Текущий вес: 79 кг (нужно сбросить 9 кг за 10 дней - нереально)

const rec = await recalculateGoalRecommendationService.execute(
  'user-uuid',
  'goal-uuid',
);

// Результат:
// {
//   ...
//   recommendedCalories: 1200,  // минимально безопасные
//   isRealistic: false,
//   warning: 'Для достижения цели требуется дефицит 900 ккал/день, что небезопасно. Рекомендуем продлить срок цели.',
//   message: 'Рекомендуем снизить калории на 600 ккал/день'
// }
```

**Попытка пересчитать завершенную цель:**

```typescript
try {
  await recalculateGoalRecommendationService.execute(
    'user-uuid',
    'completed-goal-uuid',
  );
} catch (error) {
  // BadRequestException: Пересчет доступен только для целей в процессе выполнения
}
```

**Применение:**

- Регулярные пересчеты (например, раз в неделю)
- Корректировка при изменении активности
- Уведомления "Обновите калории для лучших результатов"
- Предложение пользователю оптимизировать план

**Workflow применения рекомендации:**

```typescript
// 1. Получить рекомендацию
const rec = await recalculateGoalRecommendationService.execute(
  'user-uuid',
  'goal-uuid',
);

// 2. Показать пользователю в UI
console.log(rec.message);
console.log(
  `Текущие: ${rec.currentCalories}, Рекомендуемые: ${rec.recommendedCalories}`,
);

// 3. Если пользователь принял рекомендацию - обновить цель
if (userAccepted) {
  await updateGoalService.execute('user-uuid', 'goal-uuid', {
    targetCalories: rec.recommendedCalories,
  });
}
```

**Важно:**

- Этот метод НЕ изменяет цель автоматически
- Пользователь всегда принимает решение о применении рекомендации
- Рекомендация актуальна только на момент расчета (вес может измениться)
- Для завершенных/проваленных целей пересчет недоступен
