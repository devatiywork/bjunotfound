# Weight Services - Документация

## AddWeightService

**Файл:** `add-weight.service.ts`

**Назначение:** Добавление новой записи веса пользователя.

### Метод: `execute(userId: string, addWeightDto: AddWeightDto)`

**Описание:**
Создает новую запись веса для пользователя. Если дата не указана, используется текущая дата.

**Параметры:**

- `userId` (string) - ID пользователя
- `addWeightDto` (AddWeightDto):
  - `weight` (number) - Вес в кг (20-500 кг)
  - `date?` (string) - Дата измерения (опционально, по умолчанию - текущая)

**Возвращаемое значение:**
Созданная запись веса (id, userId, weight, date).

**Пример:**

```typescript
const weight = await addWeightService.execute('user-id', {
  weight: 75.5,
  date: '2026-01-06',
});
```

---

## GetWeightHistoryService

**Файл:** `get-weight-history.service.ts`

**Назначение:** Получение истории измерений веса пользователя.

### Метод: `execute(userId: string)`

**Описание:**
Возвращает последние 50 записей веса пользователя, отсортированные по дате (от новых к старым).

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Массив записей веса, максимум 50 элементов.

**Особенности:**

- Сортировка: сначала по дате (desc), затем по ID (desc) для записей с одинаковой датой
- Ограничение: 50 последних записей

**Пример:**

```typescript
const history = await getWeightHistoryService.execute('user-id');
```

---

## DeleteWeightService

**Файл:** `delete-weight.service.ts`

**Назначение:** Удаление записи веса.

### Метод: `execute(weightId: string, userId: string)`

**Описание:**
Удаляет запись веса с проверкой прав доступа (пользователь может удалять только свои записи).

**Параметры:**

- `weightId` (string) - ID записи веса
- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Объект с сообщением: `{ message: 'Запись веса успешно удалена' }`

**Исключения:**

- `NotFoundException` - если запись веса не найдена
- `NotFoundException` - если запись принадлежит другому пользователю

**Пример:**

```typescript
await deleteWeightService.execute('weight-id', 'user-id');
```

---

## GetLatestWeightService

**Файл:** `get-latest-weight.service.ts`

**Назначение:** Получение последнего измерения веса пользователя.

### Метод: `execute(userId: string)`

**Описание:**
Возвращает самую свежую запись веса пользователя по дате измерения.

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Запись веса или `null`, если записей нет.

**Пример:**

```typescript
const latestWeight = await getLatestWeightService.execute('user-id');
// { id, userId, weight: 75.5, date: Date }
```

---

## GetWeightByPeriodService

**Файл:** `get-weight-by-period.service.ts`

**Назначение:** Получение веса за указанный период с расчетом разницы.

### Метод: `execute(userId: string, startDate: Date, endDate: Date)`

**Описание:**
Возвращает все записи веса за период и автоматически рассчитывает начальный вес, конечный вес и разницу.

**Параметры:**

- `userId` (string) - ID пользователя
- `startDate` (Date) - Начало периода
- `endDate` (Date) - Конец периода

**Возвращаемое значение:**
Объект с полями:

- `weights` - Массив записей веса (отсортирован по возрастанию даты)
- `startWeight` - Вес в начале периода (число или null)
- `endWeight` - Вес в конце периода (число или null)
- `difference` - Разница между конечным и начальным весом (число или null)
- `period` - Объект с `start` и `end` датами

**Особенности:**

- Если за период нет записей, возвращает `null` для всех весовых значений
- Разница положительная при наборе веса, отрицательная при похудении

**Пример:**

```typescript
const periodData = await getWeightByPeriodService.execute(
  'user-id',
  new Date('2026-01-01'),
  new Date('2026-01-06'),
);
// {
//   weights: [...],
//   startWeight: 78,
//   endWeight: 75.5,
//   difference: -2.5,
//   period: { start: Date, end: Date }
// }
```

---

## GetAvailablePeriodService

**Файл:** `get-available-period.service.ts`

**Назначение:** Получение доступного периода данных о весе пользователя.

### Метод: `execute(userId: string)`

**Описание:**
Определяет временной диапазон, за который у пользователя есть данные о весе (от первой записи до текущей даты).

**Параметры:**

- `userId` (string) - ID пользователя

**Возвращаемое значение:**
Объект с полями:

- `start` - Дата первого измерения (Date или null)
- `end` - Текущая дата (Date или null)
- `hasData` - Булево значение, есть ли данные

**Особенности:**

- Если у пользователя нет записей веса, возвращает `hasData: false` и `null` для дат
- `end` всегда текущая дата, если есть хотя бы одна запись

**Пример:**

```typescript
const period = await getAvailablePeriodService.execute('user-id');
// { start: Date('2025-06-15'), end: Date('2026-01-06'), hasData: true }
```
