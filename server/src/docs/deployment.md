# Деплой BjuNotFound Backend - Руководство

## 🚀 Последовательность запуска на продакшене с нуля

### Шаг 1: Клонирование репозитория

```bash
git clone <url-репозитория>
cd server
```

---

### Шаг 2: Установка зависимостей

```bash
npm install
```

---

### Шаг 3: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
touch .env
```

Заполните `.env` следующими переменными:

```env
# ====== БАЗА ДАННЫХ ======
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# ====== JWT ТОКЕНЫ ======
JWT_ACCESS_SECRET=ваш-супер-секретный-ключ-для-access-токена-минимум-32-символа
JWT_REFRESH_SECRET=ваш-супер-секретный-ключ-для-refresh-токена-минимум-32-символа
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ====== СЕРВЕР ======
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://ваш-фронтенд-домен.com

# ====== RATE LIMITING ======
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# ====== CLOUDINARY (загрузка изображений) ======
CLOUDINARY_CLOUD_NAME=ваш-cloud-name
CLOUDINARY_API_KEY=ваш-api-key
CLOUDINARY_API_SECRET=ваш-api-secret
```

#### Описание переменных:

| Переменная               | Описание                                     | Пример                                                       |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`           | URL подключения к PostgreSQL                 | `postgresql://admin:pass123@db.example.com:5432/bjunotfound` |
| `JWT_ACCESS_SECRET`      | Секрет для access токенов (мин. 32 символа)  | Сгенерируйте: `openssl rand -hex 32`                         |
| `JWT_REFRESH_SECRET`     | Секрет для refresh токенов (мин. 32 символа) | Сгенерируйте: `openssl rand -hex 32`                         |
| `JWT_ACCESS_EXPIRATION`  | Срок жизни access токена                     | `15m`, `1h`, `30m`                                           |
| `JWT_REFRESH_EXPIRATION` | Срок жизни refresh токена                    | `7d`, `30d`                                                  |
| `PORT`                   | Порт сервера                                 | `5000`                                                       |
| `NODE_ENV`               | Режим работы                                 | `production`                                                 |
| `FRONTEND_URL`           | URL фронтенда для CORS                       | `https://app.example.com`                                    |
| `THROTTLE_TTL`           | Окно rate limiting (мс)                      | `60000` (60 сек)                                             |
| `THROTTLE_LIMIT`         | Макс. запросов за окно                       | `10`                                                         |
| `CLOUDINARY_*`           | Креды Cloudinary для загрузки фото           | Получить на cloudinary.com                                   |

---

### Шаг 4: Настройка базы данных PostgreSQL

#### 4.1 Создание базы данных (если ещё нет)

```sql
CREATE DATABASE bjunotfound;
```

#### 4.2 Генерация Prisma Client

```bash
npx prisma generate
```

#### 4.3 Применение миграций

```bash
npx prisma migrate deploy
```

> ⚠️ **Важно:** Используйте `migrate deploy` на продакшене (не `migrate dev`!)

#### 4.4 Заполнение начальных данных (seed)

```bash
npm run prisma:seed
```

Это создаст:

- Роли пользователей (`user`, `admin`)
- Уровни активности (sedentary, light, moderate, active, very_active)
- Настройки калорий (min_calories, pace_options и т.д.)
- Системные типы приемов пищи (завтрак, обед, ужин, перекус)
- Базовые категории продуктов

---

### Шаг 5: Сборка приложения

```bash
npm run build
```

Это создаст папку `dist/` с скомпилированным кодом.

---

### Шаг 6: Запуск приложения

#### Вариант A: Прямой запуск

```bash
npm run start:prod
```

#### Вариант B: Через PM2 (рекомендуется для продакшена)

```bash
# Установка PM2 глобально
npm install -g pm2

# Запуск приложения через ecosystem файл (загружает .env автоматически)
pm2 start ecosystem.config.js

# ИЛИ запуск с явной загрузкой .env (альтернатива)
# Сначала экспортировать переменные:
export $(grep -v '^#' .env | xargs)
pm2 start dist/main.js --name timenofat-api

# Сохранение конфигурации для автозапуска
pm2 save
pm2 startup
```

> ⚠️ **Важно:** PM2 НЕ загружает `.env` файл автоматически!  
> Используйте `ecosystem.config.js` или экспортируйте переменные вручную.

#### Вариант C: Docker (если используется)

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 5000
CMD ["node", "dist/main.js"]
```

```bash
docker build -t bjunotfound-api .
docker run -d -p 5000:5000 --env-file .env bjunotfound-api
```

---

### Шаг 7: Проверка работоспособности

#### Health check:

```bash
curl http://localhost:5000/api
```

#### Swagger документация:

> ⚠️ **Swagger отключен на продакшене** (`NODE_ENV=production`).  
> Для тестирования API используйте локальную среду или Postman.

#### Проверка подключения к БД:

```bash
curl http://localhost:5000/api/activities
```

Должен вернуть список уровней активности.

---

## 📋 Чек-лист деплоя

- [ ] Создан `.env` файл с всеми переменными
- [ ] `npm install` выполнен
- [ ] `npx prisma generate` выполнен
- [ ] `npx prisma migrate deploy` выполнен
- [ ] `npm run prisma:seed` выполнен
- [ ] `npm run build` выполнен
- [ ] Сервер запущен (`npm run start:prod` или PM2)
- [ ] Health check прошёл (`curl http://localhost:5000/api`)
- [ ] Swagger отключен (проверить что `/api/docs` возвращает 404)

---

## 🔧 Полная команда (Quick Start)

```bash
# Одной командой (после настройки .env)
npm install && npx prisma generate && npx prisma migrate deploy && npm run prisma:seed && npm run build && npm run start:prod
```

---

## 🐛 Troubleshooting

### Ошибка подключения к БД

```
Error: P1001: Can't reach database server
```

**Решение:** Проверьте `DATABASE_URL` в `.env`, убедитесь что PostgreSQL запущен и доступен.

### Ошибка миграций

```
Error: P3009: migrate found failed migrations
```

**Решение:**

```bash
npx prisma migrate resolve --applied <имя_миграции>
# или сбросить (⚠️ УДАЛИТ ДАННЫЕ):
npx prisma migrate reset --force
```

### Порт занят

```
Error: listen EADDRINUSE :::5000
```

**Решение:** Измените `PORT` в `.env` или остановите процесс на этом порту.

### Cloudinary не работает

Проверьте что все три переменные заполнены:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 📚 Полезные команды

```bash
# Просмотр логов PM2
pm2 logs bjunotfound-api

# Перезапуск
pm2 restart bjunotfound-api

# Просмотр данных в БД
npx prisma studio

# Проверка статуса миграций
npx prisma migrate status
```
