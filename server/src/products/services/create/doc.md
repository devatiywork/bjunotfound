# Create Product Service - Документация

## CreateProductService

**Файл:** `create-product.service.ts`

**Назначение:** Создание нового продукта питания с валидацией данных и поддержкой персональных цен.

### Метод: `execute(userId: string | null, dto: CreateProductDto, isAdmin: boolean)`

**Описание:**
Создает новый продукт с полной валидацией входных данных (категория, теги, штрих-код). Автоматически устанавливает флаги `source` и `isVerified` в зависимости от роли пользователя. Поддерживает систему персональных цен через таблицу `UserProductPrice`.

**Параметры:**

- `userId` (string | null) - ID пользователя-создателя (null для неавторизованных запросов)
- `dto` (CreateProductDto) - Данные продукта:
  - `name` (string) - Название продукта
  - `description?` (string) - Описание
  - `categoryId` (string) - ID категории (обязательно)
  - `tagIds?` (string[]) - Массив ID тегов
  - `calories` (number) - Калорийность на 100г/мл
  - `proteins` (number) - Белки на 100г/мл
  - `fats` (number) - Жиры на 100г/мл
  - `carbs` (number) - Углеводы на 100г/мл
  - `fiber?` (number) - Клетчатка
  - `sugar?` (number) - Сахар
  - `saturatedFats?` (number) - Насыщенные жиры
  - `sodium?` (number) - Натрий
  - `servingSize` (number) - Размер порции
  - `unit` (UnitType) - Единица измерения (G/ML/PIECE/PORTION)
  - `barcode?` (string) - Штрих-код (уникальный, EAN-13/UPC)
  - `brand?` (string) - Бренд
  - `photo?` (string) - URL фото
  - `price?` (number) - Персональная цена пользователя
  - `isPublic?` (boolean) - Публичный ли продукт (по умолчанию true)
- `isAdmin` (boolean) - Флаг администратора

**Возвращаемое значение:**
Созданный продукт со всеми связями:

- Основные поля продукта
- `category` - Объект категории
- `tags` - Массив связей тегов с полными объектами тегов
- `creator` - Объект создателя (id, email)
- `price` - Персональная цена пользователя (number или null)
- `source` - Источник данных (ADMIN/USER)
- `isVerified` - Флаг верификации

**Логика работы:**

1. **Валидация категории:**
   - Проверяет существование категории по `categoryId`
   - Выбрасывает `BadRequestException` если категория не найдена

2. **Валидация тегов (опционально):**
   - Если переданы `tagIds`, проверяет существование всех тегов
   - Выбрасывает `BadRequestException` если хотя бы один тег не найден

3. **Валидация штрих-кода (опционально):**
   - Если передан `barcode`, проверяет уникальность
   - Выбрасывает `BadRequestException` если продукт с таким штрих-кодом уже существует

4. **Создание продукта:**
   - Извлекает `tagIds` и `price` из DTO (не сохраняются в модели Product)
   - Устанавливает `source`:
     - `ADMIN` - если isAdmin = true
     - `USER` - если isAdmin = false
   - Устанавливает `isVerified` = isAdmin
   - Создает связи с тегами через промежуточную таблицу

5. **Создание персональной цены:**
   - Если `price` указана И userId не null, создает запись в `UserProductPrice`
   - Связывает цену с пользователем и продуктом

6. **Формирование ответа:**
   - Добавляет поле `price` в ответ (из параметра или null)
   - Возвращает продукт со всеми включенными связями

**Исключения:**

- `BadRequestException` - категория не найдена
- `BadRequestException` - один или несколько тегов не найдены
- `BadRequestException` - продукт с таким штрих-кодом уже существует

**Особенности:**

- **Модерация контента:** Админские продукты автоматически верифицированы
- **Персональные цены:** Каждый пользователь может установить свою цену
- **Уникальность штрих-кода:** Глобальная проверка на уровне БД
- **Автоматические связи:** Теги и категория включаются в ответ

**Пример использования:**

```typescript
const product = await createProductService.execute(
  'user-uuid',
  {
    name: 'Куриная грудка',
    description: 'Без кожи и костей',
    categoryId: 'meat-category-id',
    tagIds: ['high-protein-tag', 'low-fat-tag'],
    calories: 165,
    proteins: 31,
    fats: 3.6,
    carbs: 0,
    fiber: 0,
    servingSize: 100,
    unit: 'G',
    barcode: '1234567890123',
    brand: 'Мираторг',
    price: 450, // 450 руб/кг
    isPublic: true,
  },
  false, // не админ
);

// Результат:
// {
//   id: 'uuid',
//   name: 'Куриная грудка',
//   source: 'USER',
//   isVerified: false,
//   category: { id, name, ... },
//   tags: [{ tag: { id, name, ... } }, ...],
//   creator: { id: 'user-uuid', email: 'user@example.com' },
//   price: 450,
//   ...
// }
```
