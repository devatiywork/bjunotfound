# Get Goal Progress Service - Документация

## GetGoalProgressService

**Файл:** `get-goal-progress.service.ts`

**Назначение:** Расчет подробного прогресса выполнения цели с рекомендациями.

### Метод: `execute(userId: string, goalId: string)`

**Описание:**
Рассчитывает детальный прогресс по цели: прогресс по весу, прогресс по времени, соответствие графику, рекомендации. Перед расчетом обновляет статусы целей. Поддерживает как похудение, так и набор веса.

**Параметры:**

- `userId` (string) - ID пользователя
- `goalId` (string) - UUID цели

**Возвращаемое значение:**
Объект с детальным прогрессом:

```typescript
{
  goalId: string,
  status: GoalStatus,           // COMPLETED | FAILED | IN_PROGRESS
  initialWeight: number,        // Начальный вес
  currentWeight: number,        // Текущий вес
  targetWeight: number,         // Целевой вес
  daysTotal: number,           // Общее кол-во дней
  daysPassed: number,          // Прошло дней
  daysRemaining: number,       // Осталось дней
  weightToChange: number,      // Сколько нужно изменить (всегда положительное)
  weightChanged: number,       // Сколько изменено (может быть отрицательным!)
  weightRemaining: number,     // Сколько осталось (всегда положительное)
  progressPercent: number,     // Прогресс по весу (%)
  timeProgressPercent: number, // Прогресс по времени (%)
  onTrack: boolean,           // Соответствие графику
  recommendation: string,      // Текстовая рекомендация
  targetCalories: number      // Целевые калории
}
```

**Логика работы:**

1. **Обновление статусов:**
   - Вызывает UpdateExpiredGoalsService
   - Получает последний вес
   - Вызывает UpdateGoalStatusesService для обновления на основе веса

2. **Проверка существования:**
   - Ищет цель: `id = goalId AND userId = userId AND isArchived = false`
   - Выбрасывает `NotFoundException` если не найдена

3. **Валидация данных:**
   - Проверяет наличие targetWeight и endDate
   - Выбрасывает `BadRequestException` если отсутствуют
   - Проверяет наличие записи веса

4. **Обновление статуса:**
   - Повторно вызывает UpdateGoalStatusesService с текущим весом
   - Перечитывает цель с обновленным статусом

5. **Расчет временных метрик:**
   - `totalDays` - от startDate до endDate
   - `daysPassed` - от startDate до сегодня (мин. 0)
   - `daysRemaining` - от сегодня до endDate (мин. 0)

6. **Расчет прогресса по весу:**
   - Определяет начальный вес (из `initialWeight` или первой записи веса)
   - Определяет направление: похудение или набор
   - Для похудения: `weightChanged = initialWeight - currentWeight`
   - Для набора: `weightChanged = currentWeight - initialWeight`
   - `progressPercent` = (weightChanged / weightToChange) \* 100

7. **Расчет соответствия графику:**
   - `timeProgressPercent` = (daysPassed / totalDays) \* 100
   - `onTrack` = progressPercent >= timeProgressPercent AND progressPercent >= 0
   - `progressDiff` = progressPercent - timeProgressPercent

8. **Генерация рекомендации:**
   - COMPLETED: "Поздравляем! Цель достигнута! 🎉"
   - FAILED: "Цель не выполнена в срок."
   - Негативный прогресс: "Внимание! Вы набрали/сбросили вес..."
   - Опережение (>10%): "Отлично! Вы опережаете график на X%"
   - Отставание (<-10%): "Вы отстаёте от графика на X%..."
   - Иначе: "Вы идёте по графику!"

**Исключения:**

- `NotFoundException` - цель не найдена или архивирована
- `BadRequestException` - у цели отсутствует targetWeight или endDate
- `BadRequestException` - не найдена запись веса

**Особенности:**

- **Двунаправленность:** Корректно работает для похудения и набора
- **Отрицательный прогресс:** weightChanged может быть отрицательным если вес идет в неправильную сторону
- **Актуальность:** Гарантированно актуальный статус после обновления
- **Fallback для initialWeight:** Если не сохранен, использует первую запись веса

**Пример использования (похудение):**

```typescript
const progress = await getGoalProgressService.execute('user-uuid', 'goal-uuid');

// Результат:
// {
//   goalId: 'goal-uuid',
//   status: 'IN_PROGRESS',
//   initialWeight: 80,
//   currentWeight: 77,
//   targetWeight: 75,
//   daysTotal: 60,
//   daysPassed: 30,
//   daysRemaining: 30,
//   weightToChange: 5,        // |80 - 75|
//   weightChanged: 3,         // 80 - 77
//   weightRemaining: 2,       // |77 - 75|
//   progressPercent: 60,      // (3 / 5) * 100
//   timeProgressPercent: 50,  // (30 / 60) * 100
//   onTrack: true,           // 60% >= 50%
//   recommendation: 'Отлично! Вы опережаете график на 10%',
//   targetCalories: 1900
// }
```

**Пример (набор веса с отставанием):**

```typescript
// Цель: набрать с 70 до 75 кг за 90 дней
// Текущий вес: 71 кг, прошло 45 дней

const progress = await getGoalProgressService.execute('user-uuid', 'goal-uuid');

// Результат:
// {
//   ...
//   initialWeight: 70,
//   currentWeight: 71,
//   targetWeight: 75,
//   weightToChange: 5,       // |75 - 70|
//   weightChanged: 1,        // 71 - 70
//   weightRemaining: 4,      // |75 - 71|
//   progressPercent: 20,     // (1 / 5) * 100
//   timeProgressPercent: 50, // (45 / 90) * 100
//   onTrack: false,         // 20% < 50%
//   recommendation: 'Вы отстаёте от графика на 30%. Рекомендуем пересмотреть план питания.'
// }
```

**Пример (вес идет в обратную сторону):**

```typescript
// Цель: похудеть с 80 до 75 кг
// Текущий вес: 82 кг (набрал вместо похудения!)

const progress = await getGoalProgressService.execute('user-uuid', 'goal-uuid');

// Результат:
// {
//   ...
//   initialWeight: 80,
//   currentWeight: 82,
//   weightChanged: -2,       // 80 - 82 (отрицательное!)
//   progressPercent: -40,    // (-2 / 5) * 100
//   onTrack: false,
//   recommendation: 'Внимание! Вы набрали вес вместо достижения цели. Рекомендуем пересмотреть план питания.'
// }
```

**Применение:**

- Дашборд с прогрессом по активной цели
- Графики изменения веса с целевой линией
- Автоматические уведомления при отставании от графика
- Мотивационные сообщения при опережении
