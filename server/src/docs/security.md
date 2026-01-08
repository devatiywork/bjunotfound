# Безопасность проекта

## Обзор

Проект использует многоуровневую систему безопасности для защиты пользовательских данных и предотвращения несанкционированного доступа.

## Аутентификация и авторизация

### JWT токены (Access + Refresh)

**Двухтокенная система:**

- **Access Token** (по умолчанию 15 минут) - короткоживущий токен для авторизации запросов
- **Refresh Token** (по умолчанию 7 дней) - долгоживущий токен для обновления access токена

**Конфигурация в .env:**

```env
# Секреты для подписи токенов
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Время жизни токенов (можно настроить под ваши требования)
JWT_ACCESS_EXPIRATION=15m   # 15 минут
JWT_REFRESH_EXPIRATION=7d   # 7 дней
```

**Форматы времени:**

- `s` - секунды (например, `30s`)
- `m` - минуты (например, `15m`)
- `h` - часы (например, `2h`)
- `d` - дни (например, `7d`)

**Рекомендации:**

- Access token: 15-30 минут для баланса между безопасностью и удобством
- Refresh token: 7-30 дней в зависимости от требований безопасности
- Для критичных приложений используйте более короткие сроки

**Алгоритм:** HS256 (HMAC with SHA-256)

### Token Rotation

При каждом обновлении токенов:

1. Проверяется валидность refresh токена в БД
2. Старый refresh токен удаляется
3. Генерируется новая пара токенов
4. Новый refresh токен сохраняется в БД

**Преимущества:**

- Защита от повторного использования украденных токенов
- Ограниченное время жизни сессии
- Возможность отозвать токены (logout)

### Хранение токенов

**База данных:**

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(...)
}
```

**Что хранится:**

- Хеш refresh токена
- ID пользователя
- Дата истечения
- Дата создания

**Не хранятся:**

- Access токены (проверяются только по подписи)
- Пароли в открытом виде

## Хеширование паролей

### Bcrypt

**Параметры:**

- Алгоритм: bcrypt
- Cost factor (rounds): 10
- Автоматическое добавление salt

**Пример:**

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Преимущества:**

- Устойчивость к rainbow table атакам
- Адаптивное хеширование (можно увеличить rounds)
- Встроенное добавление соли

## Rate Limiting

### Глобальное ограничение

**Настройки по умолчанию:**

- Максимум: **10 запросов**
- Временное окно: **60 секунд** (60000 миллисекунд)
- Применяется: ко всем endpoints
- Идентификация: по IP адресу

**Конфигурация в .env:**

```env
THROTTLE_TTL=60000   # Временное окно в миллисекундах
THROTTLE_LIMIT=10    # Максимум запросов за окно
```

**Примеры настройки:**

```env
# Строгий режим (для критичных endpoints)
THROTTLE_TTL=60000
THROTTLE_LIMIT=5

# Обычный режим
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Расслабленный режим (для разработки)
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

**Конфигурация в коде в коде:**

```typescript
ThrottlerModule.forRoot([
  {
    ttl: parseInt(process.env.THROTTLE_TTL) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT) || 10,
  },
]);
```

**Защита от:**

- Brute force атак на login/register
- DDoS атак
- Автоматизированного перебора

**Ответ при превышении лимита:**

```
HTTP 429 Too Many Requests
```

## HTTP Security Headers (Helmet)

### Защита от XSS

**Content-Security-Policy:**

- Ограничение источников скриптов
- Запрет inline скриптов
- Защита от загрузки вредоносного контента

### Защита от Clickjacking

**X-Frame-Options:**

- Запрет встраивания сайта в iframe
- Защита от UI redressing атак

### Другие заголовки

**X-Content-Type-Options:** nosniff

- Запрет MIME-sniffing

**Strict-Transport-Security:**

- Принудительное использование HTTPS

**X-Download-Options:** noopen

- Защита от автоматического открытия файлов

## CORS (Cross-Origin Resource Sharing)

### Настройка

**Разрешенные источники:**

```env
FRONTEND_URL=http://localhost:3000
```

**Конфигурация:**

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

**Что контролируется:**

- Источник запросов (origin)
- Методы HTTP (GET, POST, etc.)
- Заголовки
- Передача cookies (credentials)

## Валидация входных данных

### Class Validator

**Глобальный pipe:**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Удаляет неописанные поля
    forbidNonWhitelisted: true, // Ошибка при неописанных полях
    transform: true, // Преобразует типы
  }),
);
```

**Примеры валидации:**

```typescript
@IsEmail()
email: string;

@IsString()
@MinLength(6)
password: string;

@IsEnum(Gender)
gender: Gender;

@IsInt()
@Min(50)
height: number;
```

## Best Practices

### 1. Переменные окружения

**Обязательно изменить в production:**

- `JWT_ACCESS_SECRET` - случайная строка минимум 32 символа
- `JWT_REFRESH_SECRET` - другая случайная строка минимум 32 символа
- `JWT_ACCESS_EXPIRATION` - время жизни access токена (например, `15m`, `30m`)
- `JWT_REFRESH_EXPIRATION` - время жизни refresh токена (например, `7d`, `14d`, `30d`)
- `THROTTLE_TTL` - временное окно rate limiting в миллисекундах (по умолчанию `60000`)
- `THROTTLE_LIMIT` - максимум запросов за окно (по умолчанию `10`, для production рекомендуется `5-10`)
- `DATABASE_URL` - безопасное подключение к БД
- `FRONTEND_URL` - URL вашего фронтенда для CORS

**Генерация секретов:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. HTTPS в production

**Всегда используйте HTTPS:**

- Шифрование данных в транзите
- Защита токенов от перехвата
- Защита паролей при передаче

### 3. Регулярное обновление зависимостей

```bash
npm audit
npm audit fix
npm update
```

### 4. Логирование

**Что логировать:**

- Попытки входа (успешные и неудачные)
- Создание/обновление/удаление токенов
- Подозрительная активность (превышение rate limit)

**Что НЕ логировать:**

- Пароли
- Токены в открытом виде
- Личные данные пользователей

## Возможные улучшения

### 1. Двухфакторная аутентификация (2FA)

- TOTP (Time-based One-Time Password)
- SMS коды
- Email коды

### 2. Логирование попыток входа

```prisma
model LoginAttempt {
  id        String   @id @default(uuid())
  email     String
  ip        String
  success   Boolean
  createdAt DateTime @default(now())
}
```

### 3. Блокировка аккаунта

- После N неудачных попыток входа
- Временная блокировка (15-30 минут)
- Email уведомление о подозрительной активности

### 4. Сессии устройств

- Отслеживание активных сессий
- Возможность выйти со всех устройств
- Информация о последней активности

### 5. IP Whitelist/Blacklist

- Ограничение доступа по IP
- Блокировка подозрительных IP
- Геолокация запросов

## Чек-лист безопасности

### Перед деплоем в production:

- [ ] Изменены все секреты в `.env`
- [ ] Настроен HTTPS
- [ ] Настроен CORS с конкретными доменами
- [ ] Включено логирование
- [ ] Настроен мониторинг
- [ ] Регулярные бэкапы БД
- [ ] Обновлены все зависимости
- [ ] Проведен security audit (`npm audit`)
- [ ] Настроен firewall
- [ ] Ограничен доступ к БД

### Регулярное обслуживание:

- [ ] Еженедельная проверка логов
- [ ] Ежемесячное обновление зависимостей
- [ ] Квартальный пересмотр политик безопасности
- [ ] Годовой security audit

## Ссылки и документация

- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Helmet Documentation](https://helmetjs.github.io/)
