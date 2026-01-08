# Административная панель - Руководство разработчика

## Обзор реализации

Административная панель реализована как вкладка в профиле пользователя, доступная только для пользователей с ролью `admin`.

## Архитектура

### Структура файлов

```
src/
├── api/
│   ├── types/
│   │   └── admin.ts          # Типы для админ API
│   └── services/
│       └── admin.ts          # API функции для админки
├── components/
│   ├── tabs/                 # Компонент табов
│   └── toast/                # Система уведомлений
└── pages/
    ├── admin/                # Главная страница админки
    │   ├── ui/
    │   │   └── admin.tsx     # Основной компонент
    │   └── components/
    │       ├── users-management/    # Управление пользователями
    │       │   └── ui/
    │       │       ├── users-management.tsx
    │       │       ├── users-table.tsx
    │       │       ├── user-stats-cards.tsx
    │       │       ├── user-detail-modal.tsx
    │       │       ├── change-role-modal.tsx
    │       │       └── delete-user-modal.tsx
    │       └── system-settings/     # Системные настройки
    │           └── ui/
    │               └── system-settings.tsx
    └── profile/
        └── ui/
            └── profile.tsx   # Обновлен для поддержки табов
```

## Компоненты

### 1. Tabs (Система табов)

**Расположение:** `src/components/tabs/`

**Назначение:** Переиспользуемый компонент для создания вкладок

**Пропсы:**

```typescript
interface TabsProps {
	tabs: Tab[] // Массив вкладок
	activeTab: string // ID активной вкладки
	onTabChange: (tabId: string) => void
	className?: string
}

interface Tab {
	id: string
	label: string
	content: ReactNode
	icon?: ReactNode // Опциональная иконка
}
```

**Использование:**

```tsx
<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
```

### 2. ToastProvider (Система уведомлений)

**Расположение:** `src/components/toast/`

**Назначение:** Контекст для отображения уведомлений

**API:**

```typescript
const { showToast } = useToast()

showToast('Сообщение', 'success' | 'error' | 'warning' | 'info')
```

**Интеграция:** Добавлен в `main.tsx` на уровне всего приложения

### 3. AdminPage

**Расположение:** `src/pages/admin/`

**Назначение:** Главная страница административной панели с двумя вкладками:

- Управление пользователями
- Настройки системы

### 4. UsersManagement

**Функциональность:**

- Статистика пользователей (карточки)
- Поиск по email
- Таблица пользователей с пагинацией
- Действия: просмотр, изменение роли, удаление

**Модальные окна:**

#### UserDetailModal

- Полная информация о пользователе
- История веса (последние 5 записей)
- Активные цели
- Статистика использования

#### ChangeRoleModal

- Выбор новой роли из списка
- Предупреждение при понижении прав админа
- Валидация изменений

#### DeleteUserModal

- Подтверждение через ввод email
- Предупреждение о безвозвратном удалении
- Отображение статистики данных для удаления

### 5. SystemSettings

**Функциональность:**

- Группировка настроек по категориям (через CollapsibleSection)
- Редактирование значений с валидацией
- Сброс всех настроек к значениям по умолчанию
- Автоматическая инвалидация кэша при изменении

**Категории настроек:**

- Границы безопасности (min_calories, max_deficit, etc.)
- Темпы похудения
- Темпы набора массы
- Константы (calories_per_kg_fat)

## API Сервисы

### Проверка роли

```typescript
checkRole(): Promise<CheckRoleResponse>
```

### Управление пользователями

```typescript
getUsers(page?, limit?): Promise<GetUsersResponse>
getUserStats(): Promise<UserStatsResponse>
getUserDetail(userId): Promise<AdminUserDetail>
updateUserRole(userId, data): Promise<UpdateUserRoleResponse>
updateUserProfileByAdmin(userId, data): Promise<AdminUser>
deleteUser(userId): Promise<DeleteUserResponse>
```

### Управление ролями

```typescript
getRoles(): Promise<RoleWithCount[]>
createRole(data): Promise<RoleWithCount>
```

### Управление настройками

```typescript
getSettings(): Promise<SettingsGrouped>
getSetting(key): Promise<CalorieSetting>
updateSetting(key, data): Promise<UpdateSettingResponse>
resetSettings(): Promise<ResetSettingsResponse>
```

## Интеграция с профилем

### ProfilePage

**Логика отображения:**

1. При загрузке страницы вызывается `checkRole()`
2. Если пользователь **не админ**:
   - Отображается старый интерфейс без табов
   - Две колонки: ProfileEditSection и WeightHistorySection
3. Если пользователь **админ**:
   - Отображается интерфейс с табами
   - Доступны вкладки: Профиль и Администрирование

**Код проверки:**

```tsx
useEffect(() => {
	checkUserRole()
}, [])

async function checkUserRole() {
	try {
		const response = await AdminAPI.checkRole()
		setIsAdmin(response.roleId === 'admin')
	} catch (error) {
		// Не админ или не авторизован
	}
}
```

## Безопасность

### Frontend проверки

- Проверка роли при загрузке страницы профиля
- Условный рендеринг админских компонентов
- Скрытие вкладки администрирования для обычных пользователей

### Обработка ошибок

- 401: Перенаправление на страницу логина
- 403: Скрытие админской вкладки + уведомление
- 404: Отображение сообщения "Не найдено"
- 409: Обработка конфликтов (дубликаты)

## Стилизация

### Темная тема

Все компоненты полностью поддерживают темную тему через Tailwind `dark:` модификатор.

### Адаптивность

- Таблицы с горизонтальной прокруткой на мобильных
- Адаптивная сетка для статистических карточек
- Корректное отображение модальных окон на всех устройствах

## Расширение функционала

### Добавление новой вкладки в админку

1. Создайте новый компонент в `pages/admin/components/`
2. Добавьте вкладку в `AdminPage`:

```tsx
const tabs: Tab[] = [
	// ... existing tabs
	{
		id: 'new-tab',
		label: 'Новая вкладка',
		icon: <NewIcon />,
		content: <NewComponent />,
	},
]
```

### Добавление нового API эндпоинта

1. Добавьте типы в `src/api/types/admin.ts`
2. Реализуйте функцию в `src/api/services/admin.ts`
3. Используйте в компонентах через `import * as AdminAPI`

## Известные ограничения

1. **Пагинация:** Клиентская фильтрация применяется только к текущей странице
2. **Поиск:** Работает только по email, не по имени или другим полям
3. **История веса:** В детальном просмотре показываются только последние 5 записей
4. **Настройки:** Нет истории изменений настроек

## TODO для будущих улучшений

- [ ] Добавить управление ролями (создание новых ролей)
- [ ] Реализовать продвинутую фильтрацию пользователей
- [ ] Добавить экспорт данных пользователей в CSV
- [ ] Логи изменений настроек
- [ ] Графики и диаграммы для статистики
- [ ] Bulk operations (массовое изменение ролей, удаление)
