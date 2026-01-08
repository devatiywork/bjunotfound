# Инструкции для разработки бекенда планировщика питания

**ВАЖНО:** Всегда отвечай на русском языке.

**КРИТИЧЕСКИ ВАЖНО:** При добавлении нового функционала, модулей или изменении архитектуры - **обязательно обновляй этот файл инструкций**. Инструкции должны всегда отражать текущее состояние проекта.

## О проекте

Это персональный бекенд-проект BjuNotFound для планирования питания, расчета калорий и достижения целей по весу. Приложение помогает пользователю отслеживать потребление пищи, планировать рацион и контролировать КБЖУ (Калории, Белки, Жиры, Углеводы).

## Архитектура

Проект использует **NestJS** с **Prisma ORM** для PostgreSQL и кастомный адаптер `@prisma/adapter-pg`. Следует модульной архитектуре NestJS с dependency injection.

**Ключевые архитектурные решения:**

- Используется `nodenext` разрешение модулей и таргет ES2023 (tsconfig.json:3-4)
- Переменные окружения загружаются через `dotenv` в prisma.config.ts:3
- Порт сервера указывается в .env(5000) (main.ts:6)

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

- Базовая информация: email, пол, дата рождения, рост
- **Уровень активности** (`activityLevelId`): связь с таблицей `activity_levels`
  - Доступные уровни: sedentary (по умолчанию), light, moderate, active, very_active
  - Каждый уровень содержит название, описание и коэффициент для расчета TDEE
  - Endpoint GET /users/activity-levels возвращает полный список
- **Формула расчета калорий** (`formulaType`): enum FormulaType
  - MIFFLIN_ST_JEOR (рекомендуется, по умолчанию)
  - HARRIS_BENEDICT (классическая формула)
- Отдельная таблица `weights` для истории веса (вес меняется со временем) ✅ РЕАЛИЗОВАНО
- Таблица `goals` для хранения целей (целевой вес, целевые калории) ✅ РЕАЛИЗОВАНО

### 2. Система продуктов и блюд - TODO

**Продукты питания:**

- Название, описание, КБЖУ (калории, белки, жиры, углеводы на 100г)
- Фото, категория, метки/теги, цена

**Блюда:**

- Формируются из продуктов с указанием количества
- КБЖУ рассчитывается автоматически на основе входящих продуктов

### 3. Планирование питания - TODO

- Планирование на неделю/месяц
- Привязка блюд/продуктов к конкретным датам и приемам пищи (завтрак, обед, ужин, перекус)
- Отслеживание фактического потребления (флаг `isEaten`)
- Автоматический подсчет КБЖУ за день/неделю

**Полная схема базы данных:** см. prisma/schema.prisma

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

### Prisma Module (src/prisma/)

**Глобальный модуль** для доступа к БД из любого места:

- `PrismaService` - расширяет PrismaClient с NestJS lifecycle hooks
- Автоматическое подключение/отключение от БД
- Экспортируется глобально через `@Global()` декоратор

### Users Module (src/users/) ✅ РЕАЛИЗОВАНО

**Эндпоинты:**

- `GET /users/profile` - получение профиля пользователя
- `PATCH /users/profile` - обновление профиля (gender, birthDate, height, formulaType, activityLevelId)
- `POST /users/weight` - добавление записи веса
- `GET /users/weight` - получение истории веса (последние 50 записей)
- `GET /users/weight/latest` - получение последнего веса
- `GET /users/weight/period` - получение веса за период с расчетом разницы
- `GET /users/weight/available-period` - доступный период данных
- `POST /users/goal` - создание/обновление цели
- `GET /users/goal` - получение активной цели
- `GET /users/goal/history` - история всех целей
- `DELETE /users/goal` - деактивация текущей цели
- `GET /users/activity-levels` - список всех уровней активности

**Компоненты:**

- `UsersService` - управление профилем, весом, целями, уровнями активности
- `UsersController` - REST endpoints (защищены JwtAuthGuard)
- DTOs: `UpdateProfileDto`, `AddWeightDto`, `CreateGoalDto`, `WeightPeriodDto`

**Документация:** `src/users/requests.md`

**Ключевые особенности:**

- При регистрации автоматически устанавливаются значения по умолчанию:
  - `formulaType`: MIFFLIN_ST_JEOR
  - `activityLevelId`: "sedentary"
- Таблица `activity_levels` заполняется через seed скрипт (`prisma/seed.ts`)
- Автоматическое обновление статуса целей при запросе истории
- Цель считается достигнутой если вес в пределах ±2 кг от целевого

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

# Заполнение БД начальными данными (activity_levels)
npx prisma db seed

# Сброс БД (удаляет все данные и применяет миграции заново)
npx prisma migrate reset

# Открыть Prisma Studio для просмотра данных
npx prisma studio
```

**Seed конфигурация:**

Seed скрипт настроен в `prisma.config.ts`:

```typescript
migrations: {
  path: 'prisma/migrations',
  seed: 'ts-node prisma/seed.ts',
}
```

Скрипт `prisma/seed.ts` заполняет таблицу `activity_levels` пятью уровнями активности с коэффициентами для расчета TDEE.

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
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async calculateDishNutrition(dishId: string) {
    // Логика расчета КБЖУ блюда
  }
}
```

**Доступ к БД:** Создай `PrismaService`, который расширяет `PrismaClient` с NestJS lifecycle hooks (`OnModuleInit`, `OnModuleDestroy`).

## Специфичные паттерны проекта

- **TypeScript strict mode:** `strictNullChecks: true`, но `noImplicitAny: false` (tsconfig.json:18-19)
- **Декораторы включены:** Необходимы для metadata reflection в NestJS
- **Переменные окружения:** Определи `DATABASE_URL` в `.env` для Prisma
- **Конфигурация порта:** Используй переменную `PORT` или по умолчанию 5000 (изменено с 3000)
- **Хеширование паролей:** Используй bcrypt для безопасного хранения паролей
- **Валидация:** Используй `class-validator` и `class-transformer` для DTO
- **Переменные окружения для parseInt:** Всегда предоставляй строковый fallback перед parseInt: `parseInt(process.env.VAR || 'default')`

## Документирование модулей

**ВАЖНО:** Для каждого модуля (сущности) создавай **один файл документации** с примерами запросов.

**Правила:**

- Файл должен называться `requests.md` или `api-examples.md`
- Располагается в папке модуля (например, `src/auth/requests.md`, `src/products/requests.md`)
- Содержит примеры всех endpoints с curl/httpie командами или JSON примерами
- Включает примеры успешных ответов и ошибок
- **НЕ плодить множество файлов** - только один файл с запросами на модуль

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

- src/main.ts - Точка входа приложения
- src/app.module.ts - Корневой модуль
- prisma/schema.prisma - Схема базы данных
- prisma.config.ts - Конфигурация Prisma с загрузкой env

## Дополнительные библиотеки

Можно использовать сторонние библиотеки для:

- Аутентификации: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- Валидации: `class-validator`, `class-transformer`
- Хеширования: `bcrypt`
- Загрузки файлов: `@nestjs/platform-express` (multer)
- Документации API: `@nestjs/swagger`

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

**Детальная документация безопасности:** см. src/docs/security.md
