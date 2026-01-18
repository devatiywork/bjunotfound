# Moderation Services - Документация

## ApproveBrandService

**Файл:** `approve-brand.service.ts`

**Назначение:** Одобрение бренда администратором

### Метод: `execute(id, adminId)`

**Описание:**
Одобряет бренд, созданный пользователем. Устанавливает флаг `isApproved: true`, записывает ID одобрителя и время одобрения. Сбрасывает предыдущее отклонение (если было).

**Параметры:**

- `id` (string) - ID бренда
- `adminId` (string) - ID администратора, одобряющего бренд

**Возвращаемое значение:**
Объект одобренного бренда с информацией о создателе и одобрителе:

```typescript
{
  id: string;
  name: string;
  // ... остальные поля
  isApproved: true;
  approvedBy: string; // adminId
  approvedAt: Date; // текущее время
  rejectedAt: null; // сброшено
  rejectionReason: null; // сброшено
  creator: {
    id: string;
    email: string;
  }
  approver: {
    id: string;
    email: string;
  }
}
```

**Исключения:**

- `NotFoundException` - если бренд не найден
- `BadRequestException` - если бренд уже одобрен

**Особенности:**

- Сбрасывает `rejectedAt` и `rejectionReason` (бренд может быть одобрен после отклонения)
- Записывает аудит: кто и когда одобрил
- Идемпотентность НЕ соблюдается - повторное одобрение вызывает ошибку

**Пример использования:**

```typescript
const approved = await approveBrandService.execute('brand-id', 'admin-id');
// isApproved: true, approvedBy: 'admin-id', approvedAt: new Date()
```

## RejectBrandService

**Файл:** `reject-brand.service.ts`

**Назначение:** Отклонение бренда администратором с указанием причины

### Метод: `execute(id, dto)`

**Описание:**
Отклоняет бренд, созданный пользователем. Устанавливает время отклонения и причину. НЕ меняет флаг `isApproved` (он остается `false`).

**Параметры:**

- `id` (string) - ID бренда
- `dto` (RejectBrandDto) - Объект с причиной отклонения (`reason`: string, 10-500 символов)

**Возвращаемое значение:**
Объект отклоненного бренда с информацией о создателе:

```typescript
{
  id: string;
  name: string;
  // ... остальные поля
  isApproved: false; // не изменено
  rejectedAt: Date; // текущее время
  rejectionReason: string; // из dto
  creator: {
    id: string;
    email: string;
  }
}
```

**Исключения:**

- `NotFoundException` - если бренд не найден
- `BadRequestException` - если пытаются отклонить одобренный бренд (isApproved === true)

**Особенности:**

- Невозможно отклонить одобренный бренд (защита от случайной ошибки)
- Причина обязательна и валидируется (10-500 символов)
- Отклоненный бренд можно одобрить через ApproveBrandService
- Не включает информацию об одобрителе (approver не задан)

**Пример использования:**

```typescript
const rejected = await rejectBrandService.execute('brand-id', {
  reason: 'Название бренда не соответствует реальному продукту',
});
// rejectedAt: new Date(), rejectionReason: '...'
```

## ListBrandGroupsService

**Файл:** `list-brand-groups.service.ts`

**Назначение:** Группировка похожих брендов для удобной модерации и объединения

### Метод: `execute()`

**Описание:**
Возвращает группы похожих брендов. Каждая группа содержит бренды с похожими названиями, которые можно объединить в один. Включает информацию о количестве продуктов для каждого бренда.

**Параметры:**
Нет

**Возвращаемое значение:**

```typescript
Array<{
  groupId: string; // Уникальный ID группы
  hasApproved: boolean; // Есть ли одобренный бренд в группе
  totalProducts: number; // Общее количество продуктов в группе
  brands: Array<{
    id: string;
    name: string;
    normalizedName: string;
    country: string | null;
    photos: string[];
    isApproved: boolean;
    rejectedAt: Date | null;
    status: 'approved' | 'pending' | 'rejected';
    createdAt: Date;
    createdBy: string;
    creator: { id: string; email: string };
    productsCount: number; // Количество продуктов у бренда
  }>;
}>;
```

**Алгоритм группировки:**

1. Точное совпадение `normalizedName`
2. Одно название содержит другое как подстроку
3. Расстояние Левенштейна ≥ 70%

**Сортировка:**

- Группы: сначала БЕЗ одобренного (требуют решения)
- Внутри группы: одобренные первыми, потом по количеству продуктов

**Пример использования:**

```typescript
const groups = await listBrandGroupsService.execute();
// [
//   {
//     groupId: 'group-uuid-1',
//     hasApproved: false,
//     totalProducts: 5,
//     brands: [
//       { name: 'Данон', status: 'pending', productsCount: 3 },
//       { name: 'Danone', status: 'pending', productsCount: 2 }
//     ]
//   }
// ]
```

## MergeBrandsService

**Файл:** `merge-brands.service.ts`

**Назначение:** Объединение нескольких похожих брендов в один с переносом продуктов

### Метод: `execute(targetBrandId, brandIdsToMerge, adminId)`

**Описание:**
Объединяет несколько брендов в один:

1. Одобряет целевой бренд (если ещё не одобрен)
2. Переносит все продукты (user + global) с других брендов на целевой
3. Отклоняет остальные бренды с причиной "Объединён с..."

**Параметры:**

- `targetBrandId` (string) - ID бренда, который будет одобрен
- `brandIdsToMerge` (string[]) - Массив ID брендов для объединения (включая targetBrandId)
- `adminId` (string) - ID администратора

**Возвращаемое значение:**

```typescript
{
  approvedBrand: {
    id: string;
    name: string;
  }
  rejectedBrands: Array<{
    id: string;
    name: string;
    productsUserMigrated: number;
    productsGlobalMigrated: number;
  }>;
  totalProductsMigrated: number;
}
```

**Исключения:**

- `BadRequestException` - если targetBrandId не в списке brandIdsToMerge
- `BadRequestException` - если целевой бренд отклонён
- `NotFoundException` - если один или несколько брендов не найдены

**Особенности:**

- Выполняется в транзакции (атомарность)
- Продукты переносятся через `updateMany` (эффективно)
- Причина отклонения автоматически: "Объединён с брендом X (ID: ...)"
- Если целевой бренд уже одобрен — просто переносит продукты и отклоняет остальные

**Пример использования:**

```typescript
const result = await mergeBrandsService.execute(
  'target-brand-id',
  ['target-brand-id', 'brand-2', 'brand-3'],
  'admin-id',
);
// {
//   approvedBrand: { id: 'target-brand-id', name: 'Danone' },
//   rejectedBrands: [
//     { id: 'brand-2', name: 'Данон', productsUserMigrated: 3, productsGlobalMigrated: 0 },
//     { id: 'brand-3', name: 'Danon', productsUserMigrated: 2, productsGlobalMigrated: 1 }
//   ],
//   totalProductsMigrated: 6
// }
```

## Логика модерации

### Статусы бренда

1. **На модерации** (Pending):
   - `isApproved: false`
   - `rejectedAt: null`
   - Отображается в `/brands/pending` для админов
   - Видны только создателю и админам

2. **Одобрен** (Approved):
   - `isApproved: true`
   - `approvedBy: <admin-id>`
   - `approvedAt: <timestamp>`
   - Видны всем пользователям

3. **Отклонен** (Rejected):
   - `isApproved: false`
   - `rejectedAt: <timestamp>`
   - `rejectionReason: <string>`
   - Видны только создателю и админам

### Переходы между статусами

- **Создание (админ)**: сразу Approved
- **Создание (пользователь)**: Pending
- **Pending → Approved**: через ApproveBrandService
- **Pending → Rejected**: через RejectBrandService
- **Rejected → Approved**: через ApproveBrandService (сбрасывает rejectedAt)
- **Approved → Rejected**: ЗАПРЕЩЕНО (выбрасывает BadRequestException)

### Аудит

Для каждого изменения статуса записывается:

- `approvedBy` - кто одобрил
- `approvedAt` - когда одобрил
- `rejectedAt` - когда отклонил
- `rejectionReason` - почему отклонил

Это позволяет отследить историю модерации.
