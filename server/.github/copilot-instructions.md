# Инструкции для разработки бекенда планировщика питания

**ВАЖНО:** Всегда отвечай на русском языке.

**КРИТИЧЕСКИ ВАЖНО:** При добавлении нового функционала, модулей или изменении архитектуры - **обязательно обновляй этот файл инструкций**. Инструкции должны всегда отражать текущее состояние проекта.

## О проекте

Это персональный бекенд-проект BjuNotFound для планирования питания, расчета калорий и достижения целей по весу. Приложение помогает пользователю отслеживать потребление пищи, планировать рацион и контролировать КБЖУ (Калории, Белки, Жиры, Углеводы).

## Архитектура

Проект использует **NestJS** с **Prisma ORM** для PostgreSQL и кастомный адаптер `@prisma/adapter-pg`. Следует модульной архитектуре NestJS с dependency injection.

**Ключевые архитектурные решения:**

- Используется `nodenext` разрешение модулей и таргет ES2023 ([tsconfig.json](tsconfig.json#L3-L4))
- Переменные окружения загружаются через `dotenv` в [prisma.config.ts](prisma.config.ts#L3)
- Порт сервера указывается в .env(5000) ([main.ts](main.ts#L6))

## Основной функционал

### 1. Аутентификация и профиль пользователя ✅ РЕАЛИЗОВАНО

**Реализованный функционал:**

- Регистрация и логин через JWT с двойной токен-системой (access + refresh)
- Access token: 15 минут (JWT_ACCESS_EXPIRATION в .env)
- Refresh token: 7 дней (JWT_REFRESH_EXPIRATION в .env), хранится в БД
- Token rotation: при обновлении старый refresh токен удаляется, выдается новый
- Logout с удалением refresh токена из БД
- Защищенный endpoint для получения профиля текущего пользователя
- Хеширование паролей через bcrypt (cost factor = 10)
- Валидация всех входящих данных через class-validator

**Структура:**

- `src/auth/` - модуль аутентификации
- `src/auth/requests.md` - документация API с примерами curl
- `src/prisma/` - глобальный PrismaService модуль
- `prisma/migrations/20251221082221_add_refresh_tokens/` - миграция для таблицы RefreshToken

**Профиль пользователя:**

- Профиль: email, пол, дата рождения, рост, формула расчета, уровень активности
- Отдельная таблица `weights` для истории веса (вес меняется со временем) ✅ РЕАЛИЗОВАНО
- Таблица `goals` для хранения целей (целевой вес, целевые калории) ✅ РЕАЛИЗОВАНО
- Автоматический перерасчет целей при добавлении нового веса ✅ РЕАЛИЗОВАНО
- **Архивирование данных:** Soft delete для `weights` и `goals` (поля `isArchived`, `deletedAt`, `deletedBy`) ✅ РЕАЛИЗОВАНО

### 2. Система расчета калорий и целей ✅ РЕАЛИЗОВАНО

**Реализованный функционал:**

- Расчет базального метаболизма (BMR) по двум формулам:
  - Миффлина-Сан Жеора (MIFFLIN_ST_JEOR) - рекомендуемая
  - Харриса-Бенедикта (HARRIS_BENEDICT) - классическая
- Расчет калорий для поддержания веса (TDEE) с учетом уровня активности
- Расчет целевых калорий для достижения цели по весу
- Расчет базального метаболизма (BMR) по двум формулам:
  - Миффлина-Сан Жеора (MIFFLIN_ST_JEOR) - рекомендуемая
  - Харриса-Бенедикта (HARRIS_BENEDICT) - классическая
- Расчет калорий для поддержания веса (TDEE) с учетом уровня активности
- Расчет целевых калорий для достижения цели по весу
- Генерация вариантов темпа достижения цели (быстрый, средний, комфортный)
- Валидация реалистичности целей с предупреждениями
- **Lazy evaluation:** статусы целей обновляются только при запросе данных (GET endpoints)

**Структура:**

- `src/utils/calorie-calculator.ts` - утилиты для расчетов BMR, TDEE, целевых калорий
- `src/utils/calorie-settings.service.ts` - сервис для работы с настройками калорий из БД (с кэшированием)
- `src/goals/` - модуль для работы с целями
- `src/goals/requests.md` - документация API с примерами
- `src/users/users.service.ts` - создание целей с сохранением initialWeight
- `prisma/schema.prisma` - модель `CalorieSetting` для хранения настроек

**Настройки калорий в БД:**

Все константы (границы безопасности, варианты темпа) вынесены в таблицу `calorie_settings`:

- `min_calories_female / min_calories_male` - минимальные калории
- `max_deficit / max_surplus` - максимальный дефицит/профицит
- `pace_very_fast / pace_fast / pace_moderate / pace_comfortable` - темпы похудения
- `pace_gain_fast / pace_gain_moderate / pace_gain_comfortable` - темпы набора
- `calories_per_kg_fat` - калорийность 1 кг жира (7700 ккал)

Преимущества: гибкость настроек без деплоя, возможность A/B тестирования, кэширование (TTL 1 час).

**Логика обновления статусов целей (Lazy Evaluation):**

✅ **Калории НЕ пересчитываются автоматически** - устанавливаются один раз при создании цели.

✅ **Статусы обновляются ТОЛЬКО при запросе данных:**

- `GET /goals` - получение всех целей
- `GET /goals/active` - получение активных целей
- `GET /goals/:id` - получение конкретной цели
- `GET /goals/:id/progress` - получение прогресса по цели
- `POST /goals/:id/recalculate` - получение рекомендации по калориям

✅ **Проверки статусов:**

1. **Просроченные цели:** `status: IN_PROGRESS` + `endDate < today` → `status: FAILED`, `isActive: false`
2. **Достигнутые цели:** `status: IN_PROGRESS` + вес достиг цели (±0.5 кг) → `status: COMPLETED`, `isActive: false`

✅ **Иммутабельность финальных статусов:**

- `COMPLETED` и `FAILED` никогда не меняются
- Проверяются только цели со `status: IN_PROGRESS`

✅ **Новые поля:**

- `initialWeight` в модели Goal - вес на момент создания цели (для расчета прогресса)

✅ **Операции с весом НЕ влияют на цели:**

- `POST /users/weight` - просто добавляет вес, статусы НЕ обновляются
- `DELETE /users/weight/:id` - просто удаляет вес, статусы НЕ обновляются

### 3. Планирование питания - TODO

- Планирование на неделю/месяц
- Привязка к конкретным датам и приемам пищи (завтрак, обед, ужин, перекус)
- Отслеживание фактического потребления (флаг `isEaten`)
- Автоматический подсчет КБЖУ за день/неделю

**Полная схема базы данных:** см. [prisma/schema.prisma](prisma/schema.prisma)

## Реализованные модули

### Auth Module (src/auth/)

**Эндпоинты:**

- `POST /auth/register` - регистрация нового пользователя
- `POST /auth/login` - вход в систему
- `POST /auth/refresh` - обновление access токена
- `POST /auth/logout` - выход из системы (удаление refresh токена)
- `GET /auth/profile` - получение профиля (требует авторизации)

**Компоненты:**

- `AuthService` - бизнес-логика (generateTokens, register, login, refresh, logout)
- `AuthController` - REST endpoints
- `JwtStrategy` - стратегия валидации access токенов
- `JwtAuthGuard` - guard для защиты endpoints
- DTOs: `RegisterDto`, `LoginDto`, `RefreshTokenDto` с валидацией

**Переменные окружения:**

```env
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Goals Module (src/goals/)

**Эндпоинты:**

- `POST /goals/calculate-calories` - расчет калорий для достижения цели
- `POST /goals/calculate-pace` - генерация вариантов темпа достижения цели
- `GET /goals` - получить все цели пользователя
- `GET /goals/active` - получить активные цели
- `GET /goals/archived` - получить архивированные цели ✅ НОВОЕ
- `GET /goals/:id` - получить цель по ID
- `PATCH /goals/:id` - обновить цель
- `DELETE /goals/:id` - архивировать цель (мягкое удаление) ✅ ОБНОВЛЕНО
- `POST /goals/:id/restore` - восстановить архивированную цель ✅ НОВОЕ
- `DELETE /goals/:id/permanent` - удалить цель навсегда (только админ) ✅ НОВОЕ
- `POST /goals/recalculate` - пересчитать активные цели (обычно автоматически)

**Компоненты:**

- `GoalsService` - бизнес-логика (расчеты, перерасчет целей, CRUD, архивирование)
- `GoalsController` - REST endpoints
- DTOs: `CalculateCaloriesDto`, `CalculateGoalPaceDto`, `UpdateGoalDto`
- Утилиты: `calorie-calculator.ts` (BMR, TDEE, целевые калории)
- Архивирование: archiveGoal, restoreGoal, getArchivedGoals, permanentDeleteGoal ✅ НОВОЕ

**Документация:** см. [src/goals/requests.md](src/goals/requests.md)

### Users Module (src/users/)

**Эндпоинты управления весом:**

- `POST /users/weight` - добавить запись веса
- `GET /users/weight` - получить историю веса
- `GET /users/weight/latest` - получить последний вес
- `GET /users/weight/period` - получить вес за период
- `GET /users/weight/available-period` - получить доступный период данных
- `GET /users/weight/archived` - получить архивированные записи веса ✅ НОВОЕ
- `DELETE /users/weight/:id` - архивировать запись веса (мягкое удаление) ✅ НОВОЕ
- `POST /users/weight/:id/restore` - восстановить архивированную запись ✅ НОВОЕ
- `DELETE /users/weight/:id/permanent` - удалить запись навсегда (только админ) ✅ НОВОЕ

**Компоненты:**

- `UsersService` - бизнес-логика управления профилем, весом, архивирование
- `UsersController` - REST endpoints
- DTOs: `AddWeightDto`, `UpdateProfileDto`, `CreateGoalDto`
- Архивирование: archiveWeight, restoreWeight, getArchivedWeights, permanentDeleteWeight ✅ НОВОЕ

**Документация:** см. [src/users/requests.md](src/users/requests.md)

### FileUpload Module (src/file-upload/) ✅ РЕАЛИЗОВАНО

**Модуль для работы с загрузкой изображений через Cloudinary:**

**Компоненты:**

- `CloudinaryService` - загрузка/удаление изображений, валидация формата и размера
- `cloudinary.config.ts` - конфигурация подключения к Cloudinary
- `FileUploadModule` - глобальный модуль для использования в других модулях

**Функциональность:**

- Загрузка изображений в Cloudinary (настраиваемая папка)
- Валидация формата: JPEG, PNG, WebP
- Валидация размера: макс 5MB
- Автоматическая оптимизация: resize до 800x800px, quality auto, format auto (WebP)
- Удаление изображений по URL
- Извлечение public_id из Cloudinary URL

**Переменные окружения:**

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Использование:**

1. Загрузка через upload endpoint с `multipart/form-data`
2. Получение URL из ответа
3. Использование URL в поле `photo` соответствующей модели

### Admin Module (src/admin/) ✅ РЕАЛИЗОВАНО

**Модуль для административного управления системой:**

**Эндпоинты управления пользователями:**

- `GET /admin/users` - список всех пользователей с пагинацией
- `GET /admin/users/stats` - статистика по пользователям
- `GET /admin/users/:id` - детальная информация о пользователе
- `PATCH /admin/users/:id/role` - изменить роль пользователя
- `PATCH /admin/users/:id` - обновить профиль пользователя
- `DELETE /admin/users/:id` - удалить пользователя (каскадно удаляет связанные данные)
- `GET /admin/roles` - список всех ролей

**Эндпоинты управления настройками калорий:**

- `GET /admin/settings` - получить все настройки по категориям
- `GET /admin/settings/:key` - получить конкретную настройку
- `PATCH /admin/settings/:key` - обновить настройку (инвалидирует кэш)
- `POST /admin/settings/reset` - сбросить все настройки к умолчанию

**Компоненты:**

- `AdminService` - бизнес-логика управления пользователями
- `AdminController` - REST endpoints для управления пользователями
- `CalorieSettingsController` - REST endpoints для управления настройками
- `CalorieSettingsService` - сервис с кэшированием (TTL 1 час)
- DTOs: `UpdateUserRoleDto`, `UpdateUserDto`, `UpdateCalorieSettingDto`
- Guards: Все эндпоинты защищены `@Roles('admin')`

**Функциональность:**

- Пагинация списка пользователей (page, limit)
- Получение статистики (общее кол-во, по ролям, недавние пользователи)
- Детальная информация с включением весов, целей, подсчетом планов питания
- Изменение ролей с валидацией существования роли
- Обновление профиля пользователя (пол, рост, дата рождения, формула, активность)
- Каскадное удаление пользователя со всеми данными (веса, цели, планы)
- CRUD для настроек калорий с автоматической инвалидацией кэша

**Документация:**

- [src/admin/admin-users-api.md](src/admin/admin-users-api.md) - документация по управлению пользователями
- [src/admin/calorie-settings-api.md](src/admin/calorie-settings-api.md) - документация по настройкам калорий

### Prisma Module (src/prisma/)

**Глобальный модуль** для доступа к БД из любого места:

- `PrismaService` - расширяет PrismaClient с NestJS lifecycle hooks
- Автоматическое подключение/отключение от БД
- Экспортируется глобально через `@Global()` декоратор

## База данных и Prisma

**Критически важно:** Путь генерации Prisma Client настроен нестандартно:

```prisma
generator client {
  provider = "prisma-client"
}
```

**Импорт Prisma Client:**

```typescript
import { PrismaClient } from '@prisma/client';
```

**Команды Prisma:**

```bash
# Генерация клиента после изменения схемы
npx prisma generate

# Создание и применение миграций
npx prisma migrate dev --name <название_миграции>

# Открыть Prisma Studio для просмотра данных
npx prisma studio
```

## Рабочие процессы разработки

**Запуск сервера разработки:**

```bash
npm run start:dev  # Режим watch с автоперезагрузкой
```

**Тестирование:**

```bash
npm run test         # Юнит-тесты
npm run test:e2e     # E2E тесты
npm run test:cov     # Покрытие тестами
```

**Линтинг и форматирование:**

```bash
npm run lint         # ESLint с автоисправлением
npm run format       # Форматирование Prettier
```

## Конвенции NestJS

**Структура модуля:** Следуй паттерну NestJS:

1. Создание модуля: `nest g module <название>`
2. Создание контроллера: `nest g controller <название>`
3. Создание сервиса: `nest g service <название>`

**Инъекция зависимостей:** Используй constructor-based DI:

```typescript
@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async calculateTargetCalories(userId: string) {
    // Логика расчета целевых калорий
  }
}
```

**Доступ к БД:** Создай `PrismaService`, который расширяет `PrismaClient` с NestJS lifecycle hooks (`OnModuleInit`, `OnModuleDestroy`).

### Архитектура сервисов (Service Layer Architecture) ✅ ОБЯЗАТЕЛЬНО

**КРИТИЧЕСКИ ВАЖНО:** Все новые модули должны следовать этой архитектуре с разделением сервисов по операциям.

**Принцип Single Responsibility:** Каждый метод сервиса выносится в отдельный специализированный сервис в своей папке.

**Структура модуля:**

```
src/
  users/                              ← Модуль
    services/                         ← Папка всех сервисов
      profile/
        get-profile.service.ts        ← Сервис получения профиля
      weight/
        add-weight.service.ts         ← Сервис добавления веса
        get-weight-history.service.ts ← Сервис истории веса
      index.ts                        ← Экспорт всех сервисов
    dto/                              ← DTO
    swagger/                          ← Swagger документация
    users.service.ts                  ← Главный сервис-координатор
    users.controller.ts               ← REST endpoints
    users.module.ts                   ← Модуль с регистрацией
```

**Главный сервис (координатор):**

```typescript
import { Injectable } from '@nestjs/common';
import {
  AddWeightService,
  GetWeightHistoryService,
  GetLatestWeightService,
} from './services';

@Injectable()
export class UsersService {
  constructor(
    private addWeightService: AddWeightService,
    private getWeightHistoryService: GetWeightHistoryService,
    private getLatestWeightService: GetLatestWeightService,
  ) {}

  async addWeight(userId: string, dto: AddWeightDto) {
    return this.addWeightService.execute(userId, dto);
  }

  async getWeightHistory(userId: string) {
    return this.getWeightHistoryService.execute(userId);
  }

  async getLatestWeight(userId: string) {
    return this.getLatestWeightService.execute(userId);
  }
}
```

**Специализированный сервис:**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AddWeightService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, dto: AddWeightDto) {
    // Вся логика добавления веса
    return this.prisma.weight.create({
      data: { userId, ...dto },
    });
  }
}
```

**services/index.ts (экспорт):**

```typescript
export { AddWeightService } from './weight/add-weight.service';
export { GetWeightHistoryService } from './weight/get-weight-history.service';
export { GetLatestWeightService } from './weight/get-latest-weight.service';
```

**Регистрация в модуле:**

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  AddWeightService,
  GetWeightHistoryService,
  GetLatestWeightService,
} from './services';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AddWeightService,
    GetWeightHistoryService,
    GetLatestWeightService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
```

**Преимущества архитектуры:**

- ✅ **Single Responsibility** - каждый сервис отвечает за одну операцию
- ✅ **Легкое тестирование** - можно тестировать каждый сервис отдельно
- ✅ **Упрощенная навигация** - легко найти нужную логику по имени папки
- ✅ **Масштабируемость** - легко добавлять новые операции без раздувания файлов
- ✅ **Переиспользование** - сервисы можно инжектить напрямую в другие модули
- ✅ **Изоляция изменений** - изменения в одной операции не влияют на другие

**Реализованные примеры:**

- ✅ `src/users/` - полностью переведен на новую архитектуру (13 сервисов)

**При создании нового модуля:**

1. Создай структуру `services/` с подпапками для каждой операции
2. Напиши специализированные сервисы с методом `execute()`
3. Создай `services/index.ts` для экспорта
4. Главный сервис делегирует вызовы специализированным
5. Зарегистрируй все сервисы в модуле
6. **Создай документацию `doc.md` в каждой папке группы сервисов** ✅ ОБЯЗАТЕЛЬНО

### Документация сервисов (doc.md)

**КРИТИЧЕСКИ ВАЖНО:** Для каждой группы сервисов (папки внутри `services/`) необходимо создавать файл `doc.md` с подробным описанием работы методов.

**Структура документации сервиса:**

```
src/
  users/
    services/
      profile/
        get-profile.service.ts
        update-profile.service.ts
        doc.md                      ← Документация для профиля
      weight/
        add-weight.service.ts
        get-weight-history.service.ts
        doc.md                      ← Документация для веса
      goal/
        set-goal.service.ts
        doc.md                      ← Документация для целей
```

**Формат doc.md:**

````markdown
# [Group Name] Services - Документация

## ServiceName

**Файл:** `service-name.service.ts`

**Назначение:** Краткое описание назначения сервиса

### Метод: `execute(params)`

**Описание:**
Подробное описание того, что делает метод.

**Параметры:**

- `param1` (type) - Описание параметра
- `param2` (type) - Описание параметра

**Возвращаемое значение:**
Описание структуры возвращаемых данных

**Исключения:**

- `ExceptionType` - когда выбрасывается

**Особенности:**

- Важные детали реализации
- Побочные эффекты
- Зависимости

**Пример использования:**
\```typescript
const result = await serviceName.execute(params);
\```
````

**Что должно быть в doc.md:**

1. **Название группы сервисов** (заголовок H1)
2. **Для каждого сервиса:**
   - Имя класса сервиса (H2)
   - Путь к файлу
   - Назначение сервиса (одно предложение)
   - Метод `execute()` с полным описанием:
     - Параметры с типами и описанием
     - Возвращаемое значение со структурой
     - Возможные исключения
     - Особенности работы (side effects, dependencies)
     - Примеры использования
3. **Логика работы** (если сложная)
4. **Связанные методы** (если есть приватные вспомогательные методы)

**Пример реализованных документаций:**

- `src/users/services/profile/doc.md` - GetProfileService, UpdateProfileService
- `src/users/services/weight/doc.md` - 6 сервисов работы с весом
- `src/users/services/goal/doc.md` - 4 сервиса работы с целями
- `src/users/services/activity/doc.md` - GetActivityLevelsService

**Преимущества doc.md:**

- ✅ **Контекст для разработчиков** - легко понять логику без чтения кода
- ✅ **Документация параметров** - типы, валидация, ограничения
- ✅ **Примеры использования** - готовые сниппеты для копирования
- ✅ **Особенности реализации** - важные детали, которые не видны из сигнатуры
- ✅ **История изменений** - можно отследить эволюцию логики

## Специфичные паттерны проекта

- **TypeScript strict mode:** `strictNullChecks: true`, но `noImplicitAny: false` ([tsconfig.json](tsconfig.json#L18-L19))
- **Декораторы включены:** Необходимы для metadata reflection в NestJS
- **Переменные окружения:** Определи `DATABASE_URL` в `.env` для Prisma
- **Конфигурация порта:** Используй переменную `PORT` или по умолчанию 5000 (изменено с 3000)
- **Хеширование паролей:** Используй bcrypt для безопасного хранения паролей
- **Валидация:** Используй `class-validator` и `class-transformer` для DTO
- **Переменные окружения для parseInt:** Всегда предоставляй строковый fallback перед parseInt: `parseInt(process.env.VAR || 'default')`

## Документирование модулей

**КРИТИЧЕСКИ ВАЖНО:** Используем **Swagger/OpenAPI** для документации API. Markdown файлы (requests.md) больше не используются.

### Swagger документация

**Основная конфигурация:**

- Swagger UI доступен по адресу: `http://localhost:5000/api/docs`
- Bearer авторизация настроена как 'JWT-auth'
- Кастомный функционал: кнопка "📋 Копировать всё" для каждого endpoint (копирует описание, параметры, примеры запросов/ответов, curl команду)
- Скрипт кастомизации: [public/swagger-custom.js](public/swagger-custom.js)

**Структура документации по модулям:**

Каждый модуль должен иметь отдельный файл с Swagger документацией:

```
src/
  users/
    users.controller.ts
    users.service.ts
    swagger/
      users.swagger.ts    ← Документация и примеры для Swagger
    dto/
      add-weight.dto.ts   ← С @ApiProperty декораторами
```

**Паттерн документации:**

1. **Создай `swagger/[module].swagger.ts`** с двумя объектами:
   - `[Module]SwaggerDocs` - описания операций (summary, description)
   - `[Module]SwaggerResponses` - примеры ответов с кодами статуса

Пример структуры:

```typescript
import { ApiOperationOptions, ApiResponseOptions } from '@nestjs/swagger';

export const UsersSwaggerDocs = {
  getProfile: {
    summary: 'Получить профиль',
    description: 'Возвращает профиль текущего пользователя',
  } as ApiOperationOptions,

  addWeight: {
    summary: 'Добавить запись веса',
    description: 'Добавляет новую запись веса с автоперерасчетом целей',
  } as ApiOperationOptions,
};

export const UsersSwaggerResponses = {
  profile: {
    status: 200,
    description: 'Профиль успешно получен',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        // ... полный пример
      },
    },
  } as ApiResponseOptions,

  unauthorized: {
    status: 401,
    description: 'Не авторизован',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  } as ApiResponseOptions,
};
```

2. **Обнови все DTOs с `@ApiProperty`:**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class AddWeightDto {
  @ApiProperty({
    description: 'Вес в килограммах',
    example: 75.5,
    minimum: 20,
    maximum: 500,
  })
  @IsNumber()
  @Min(20)
  @Max(500)
  weight: number;
}
```

3. **Примени декораторы в контроллере:**

```typescript
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  UsersSwaggerDocs,
  UsersSwaggerResponses,
} from './swagger/users.swagger';

@ApiTags('Пользователи')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  @ApiOperation(UsersSwaggerDocs.getProfile)
  @ApiResponse(UsersSwaggerResponses.profile)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('profile')
  async getProfile(@Request() req) {
    // ...
  }

  @ApiOperation(UsersSwaggerDocs.addWeight)
  @ApiResponse(UsersSwaggerResponses.weightCreated)
  @ApiResponse(UsersSwaggerResponses.badRequest)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Post('weight')
  async addWeight(@Request() req, @Body() dto: AddWeightDto) {
    // ...
  }
}
```

**Дополнительные декораторы:**

- `@ApiParam()` - для path параметров (`:id`)
- `@ApiQuery()` - для query параметров (`?startDate=...`)
- `@ApiBody()` - для тела запроса (если нужна кастомизация)

**Реализованные модули:**

- ✅ `src/users/swagger/users.swagger.ts` - полностью задокументирован
- ⏳ `src/auth/swagger/auth.swagger.ts` - требуется создать
- ⏳ `src/goals/swagger/goals.swagger.ts` - требуется создать
- ⏳ `src/admin/swagger/admin.swagger.ts` - требуется создать

**При создании нового модуля:**

1. Создай `swagger/[module].swagger.ts` с описаниями и примерами
2. Добавь `@ApiProperty` ко всем DTO
3. Примени `@ApiOperation` и `@ApiResponse` к endpoints
4. Используй `@ApiTags` для группировки в Swagger UI
5. Добавь `@ApiBearerAuth('JWT-auth')` для защищенных роутов
6. **ВАЖНО: Все MD документации создавать ТОЛЬКО в `src/docs/`!** Создай файл `src/docs/[module]-api.md` с примерами запросов для быстрого тестирования (curl команды, примеры JSON). Никогда не создавай MD файлы в папках модулей (например, `src/users/docs/`).

**Структура документации:**

```
src/
  users/
    users.controller.ts
    swagger/
      users.swagger.ts    ← Swagger документация для UI (постоянная)
    dto/
      add-weight.dto.ts
  docs/
    users-api.md          ← MD документация для тестирования (постоянная)
    activities-api.md     ← MD документация для нового модуля
```

**Формат MD документации (src/docs/[module]-api.md):**

```markdown
# [Module] API - Документация и примеры запросов

## Получить профиль

\`\`\`bash
curl -X GET "http://localhost:5000/api/users/profile" \
 -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

## Добавить вес

\`\`\`bash
curl -X POST "http://localhost:5000/api/users/weight" \
 -H "Authorization: Bearer YOUR_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"weight": 75.5}'
\`\`\`
```

**Важно:**

- Swagger документация - основная и используется в production
- MD файлы в `src/docs/` - для разработчиков, тестирования и быстрого копирования curl команд
- Оба типа документации постоянные и хранятся в репозитории

## Документирование модулей (УСТАРЕЛО - не использовать)

**ВАЖНО:** Markdown файлы (requests.md) больше не используются. Вся документация через Swagger.

**Правила (СТАРЫЕ - только для справки):**

- Файл должен называться `requests.md` или `api-examples.md`
- Располагается в папке модуля (например, `src/auth/requests.md`, `src/products/requests.md`)
- Содержит примеры всех endpoints с curl/httpie командами или JSON примерами
- Включает примеры успешных ответов и ошибок
- **НЕ плодить множество файлов** - только один файл с запросами на модуль
- context7 для библиотек и фреймворков перед написанием кода.

**Формат документации использовать:**
**Пример структуры:**

```
src/
  auth/
    auth.controller.ts
    auth.service.ts
    auth.module.ts
    requests.md          ← ОДИН файл с документацией
  products/
    products.controller.ts
    products.service.ts
    requests.md          ← ОДИН файл с документацией
```

## Ключевые файлы

- [src/main.ts](src/main.ts) - Точка входа приложения, конфигурация Swagger
- [src/app.module.ts](src/app.module.ts) - Корневой модуль
- [prisma/schema.prisma](prisma/schema.prisma) - Схема базы данных
- [prisma.config.ts](prisma.config.ts) - Конфигурация Prisma с загрузкой env
- [public/swagger-custom.js](public/swagger-custom.js) - Кастомный функционал для Swagger UI (кнопка "Копировать всё")

## Дополнительные библиотеки

Можно использовать сторонние библиотеки для:

- Аутентификации: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- Валидации: `class-validator`, `class-transformer`
- Хеширования: `bcrypt`
- Загрузки файлов: `@nestjs/platform-express` (multer)
- Документации API: `@nestjs/swagger` ✅ **ИСПОЛЬЗУЕТСЯ**

## Меры безопасности

Проект использует следующие меры безопасности на уровне приложения:

### 1. Token Rotation (Ротация токенов)

- При каждом обновлении через `/auth/refresh` старый refresh токен удаляется из БД и выдается новый
- Защищает от повторного использования украденных токенов
- Refresh токены хранятся в таблице `RefreshToken` с привязкой к пользователю

### 2. Rate Limiting (Ограничение частоты запросов)

- Настраивается через `@nestjs/throttler` в `app.module.ts`
- **По умолчанию**: 10 запросов за 60 секунд с одного IP
- **Настройка**: переменные `THROTTLE_LIMIT` и `THROTTLE_TTL` в `.env`
- **Ответ при превышении**: HTTP 429 Too Many Requests

### 3. Helmet (Безопасные HTTP заголовки)

- Автоматически настраиваются в `main.ts` через `helmet()`
- Защитные заголовки: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`
- Защита от XSS, clickjacking, MIME-sniffing

### 4. CORS (Контроль доступа)

- Настраивается в `main.ts` через `enableCors()`
- **Origin**: определяется через `FRONTEND_URL` в `.env`
- **Credentials**: включено для отправки cookies/headers
- **Методы**: GET, POST, PUT, DELETE, PATCH

### 5. Валидация данных

- Глобальный `ValidationPipe` в `main.ts`
- Используется `class-validator` и `class-transformer` для DTO
- **Настройки**: `whitelist: true` (удаление лишних полей), `forbidNonWhitelisted: true` (ошибка при лишних полях)
- Все входящие данные проверяются перед обработкой

### 6. Безопасное хранение паролей

- Хеширование через `bcrypt` с cost factor = 10
- Пароли никогда не возвращаются в API ответах
- Проверка паролей через `bcrypt.compare()`

### 7. Контроль доступа на основе ролей (RBAC)

- **Модель ролей**: Таблица `UserRole` с двумя ролями по умолчанию (`user`, `admin`)
- **Хранение роли**: Поле `roleId` в таблице `users` (строка, по умолчанию `'user'`)
- **Guards**: `JwtAuthGuard` для аутентификации + `RolesGuard` для авторизации
- **Декоратор**: `@Roles('admin')` для защиты эндпоинтов
- **Применение**: Все эндпоинты Admin модуля требуют роль `admin`
- **Расширяемость**: Роли хранятся в БД, легко добавить новые (moderator, editor и т.д.)

**Пример использования:**

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  // Все методы доступны только администраторам
}
```

**Детальная документация безопасности:** см. [src/docs/security.md](src/docs/security.md)
