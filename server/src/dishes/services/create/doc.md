# Create Dish Service - Документация

## CreateDishService

**Файл:** `create-dish.service.ts`

**Назначение:** Создание нового блюда с автоматическим расчетом КБЖУ и цены из ингредиентов.

### Метод: `execute(dto: CreateDishDto, userId: string, isAdmin: boolean)`

**Описание:**
Создает новое блюдо в системе. Валидирует ингредиенты и теги, рассчитывает КБЖУ и цену, сохраняет в БД. Админы создают верифицированные блюда с source='ADMIN', обычные пользователи - с source='USER'.

**Параметры:**

- `dto` (CreateDishDto) - Данные блюда:
  - `name` (string) - Название блюда
  - `description?` (string) - Описание
  - `servings` (number) - Количество порций
  - `servingSize?` (number) - Размер порции (г)
  - `cookingTimeMinutes?` (number) - Время приготовления (минуты)
  - `difficulty?` (DifficultyLevel) - Сложность (EASY/MEDIUM/HARD)
  - `mealType?` (MealType) - Тип приема пищи
  - `cuisineType?` (CuisineType) - Тип кухни
  - `dishCategory?` (DishCategory) - Категория блюда
  - `instructions?` (string) - Инструкции по приготовлению
  - `photo?` (string) - URL фото из Cloudinary
  - `isPublic` (boolean) - Публичное или личное
  - `ingredients` (AddIngredientDto[]) - Массив ингредиентов (мин. 1):
    - `productId` (string) - ID продукта
    - `amount` (number) - Количество
    - `unit` (UnitType) - Единица измерения
  - `tagIds?` (string[]) - Массив ID тегов
- `userId` (string) - ID создателя
- `isAdmin` (boolean) - Является ли создатель админом

**Возвращаемое значение:**
Созданное блюдо со всеми связями:

- Включает creator (id, email)
- Включает ingredients с полными данными продуктов
- Включает tags с полными данными тегов
- Автоматически рассчитанные поля:
  - `totalCalories`, `totalProteins`, `totalFats`, `totalCarbs` - Суммарные значения
  - `totalFiber`, `totalSugar` - Суммарные доп. макросы (если есть)
  - `totalWeight` - Общий вес ингредиентов
  - `totalPrice` - Суммарная цена (или null если нет цен)
  - `caloriesPerServing`, `proteinsPerServing`, etc. - Значения на порцию
  - `pricePerServing` - Цена за порцию (или null)

**Логика работы:**

1. **Валидация ингредиентов:**
   - Проверяет наличие минимум 1 ингредиента
   - Проверяет существование всех продуктов в БД

2. **Валидация тегов (опционально):**
   - Если указаны tagIds, проверяет их существование

3. **Расчет КБЖУ и цены:**
   - Вызывает CalculateNutritionService для расчета суммарных значений
   - Рассчитывает значения на порцию (делением на servings)

4. **Сохранение в БД:**
   - Создает блюдо с рассчитанными значениями
   - Создает связи с ингредиентами (DishIngredient)
   - Создает связи с тегами (DishTagRelation)
   - Устанавливает isVerified=true для админов
   - Устанавливает source='ADMIN' или 'USER'

**Исключения:**

- `BadRequestException` - блюдо без ингредиентов
- `BadRequestException` - один или несколько продуктов не найдены
- `BadRequestException` - один или несколько тегов не найдены

**Особенности:**

- **Автоматический расчет:** Все КБЖУ и цена рассчитываются автоматически
- **Персональные цены:** Использует UserProductPrice для расчета стоимости
- **Модерация:** Админ-блюда автоматически верифицированы
- **Гибкая видимость:** isPublic определяет доступность для других пользователей

**Пример использования:**

```typescript
const dish = await createDishService.execute(
  {
    name: 'Куриный салат Цезарь',
    description: 'Классический салат с курицей и соусом',
    servings: 2,
    servingSize: 350,
    cookingTimeMinutes: 20,
    difficulty: 'EASY',
    mealType: 'LUNCH',
    cuisineType: 'ITALIAN',
    isPublic: true,
    ingredients: [
      { productId: 'chicken-breast-id', amount: 200, unit: 'G' },
      { productId: 'lettuce-id', amount: 100, unit: 'G' },
      { productId: 'caesar-dressing-id', amount: 50, unit: 'ML' },
    ],
    tagIds: ['high-protein-tag-id', 'quick-meal-tag-id'],
  },
  'user-uuid',
  false,
);

// Результат:
// {
//   id: 'dish-uuid',
//   name: 'Куриный салат Цезарь',
//   totalCalories: 450,
//   totalProteins: 45,
//   caloriesPerServing: 225,
//   proteinsPerServing: 22.5,
//   totalPrice: 150.50,
//   pricePerServing: 75.25,
//   isVerified: false,
//   source: 'USER',
//   creator: { id: 'user-uuid', email: 'user@example.com' },
//   ingredients: [...],
//   tags: [...]
// }
```

**Применение:**

- Создание блюд через UI
- Импорт рецептов из внешних источников
- Быстрое добавление блюд через API
