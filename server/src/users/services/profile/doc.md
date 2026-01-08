# Profile Services - Документация

## GetProfileService

**Файл:** `get-profile.service.ts`

**Назначение:** Получение профиля пользователя с полной информацией о роли и уровне активности.

### Метод: `execute(userId: string)`

**Описание:**
Возвращает полный профиль пользователя по его ID, включая связанные данные о роли и уровне активности.

**Параметры:**

- `userId` (string) - Уникальный идентификатор пользователя

**Возвращаемое значение:**
Объект пользователя со следующими полями:

- `id` - UUID пользователя
- `email` - Email пользователя
- `roleId` - ID роли пользователя
- `gender` - Пол (MALE/FEMALE)
- `birthDate` - Дата рождения
- `height` - Рост в см
- `formulaType` - Тип формулы расчета (MIFFLIN_ST_JEOR/HARRIS_BENEDICT)
- `activityLevelId` - ID уровня активности
- `role` - Объект роли (id, name, description)
- `activityLevel` - Объект уровня активности (id, name, description, coefficient)
- `createdAt` - Дата создания аккаунта

**Исключения:**

- `NotFoundException` - если пользователь с указанным ID не найден

**Пример использования:**

```typescript
const profile = await getProfileService.execute('user-uuid-here');
```

---

## UpdateProfileService

**Файл:** `update-profile.service.ts`

**Назначение:** Обновление профиля пользователя (email изменить нельзя).

### Метод: `execute(userId: string, updateProfileDto: UpdateProfileDto)`

**Описание:**
Обновляет данные профиля пользователя. Email не может быть изменен через этот метод.

**Параметры:**

- `userId` (string) - Уникальный идентификатор пользователя
- `updateProfileDto` (UpdateProfileDto) - Данные для обновления:
  - `gender?` - Пол
  - `birthDate?` - Дата рождения (строка, конвертируется в Date)
  - `height?` - Рост в см
  - `formulaType?` - Тип формулы расчета
  - `activityLevelId?` - ID уровня активности

**Возвращаемое значение:**
Обновленный профиль пользователя с теми же полями, что и в GetProfileService (без roleId).

**Особенности:**

- Автоматически конвертирует строку `birthDate` в объект Date для Prisma
- Возвращает обновленные данные вместе со связанным объектом `activityLevel`

**Пример использования:**

```typescript
const updatedProfile = await updateProfileService.execute('user-uuid', {
  height: 175,
  activityLevelId: 'moderate-activity-id',
});
```
