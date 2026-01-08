# Calculate Nutrition Service - Документация

## CalculateNutritionService

**Файл:** `calculate-nutrition.service.ts`

**Назначение:** Расчет суммарных КБЖУ, веса и цены блюда из ингредиентов.

### Метод: `execute(ingredients: any[], products: any[], userId: string)`

**Описание:**
Рассчитывает общие питательные значения блюда на основе ингредиентов и их количества. Суммирует калории, белки, жиры, углеводы, клетчатку, сахар и вес. Также рассчитывает цену на основе персональных цен пользователя (UserProductPrice). Это вспомогательный сервис, используемый в CreateDishService, UpdateDishService и RecalculateDishService.

**Параметры:**

- `ingredients` (any[]) - Массив ингредиентов:
  - `productId` (string) - UUID продукта
  - `amount` (number) - Количество ингредиента (в граммах или мл)
  - `unit` (UnitType) - Единица измерения (не используется в расчетах, только для отображения)
- `products` (any[]) - Массив объектов продуктов из БД с полями:
  - `id` (string)
  - `calories` (number) - калории на 100г
  - `proteins` (number) - белки на 100г
  - `fats` (number) - жиры на 100г
  - `carbs` (number) - углеводы на 100г
  - `fiber?` (number) - клетчатка на 100г
  - `sugar?` (number) - сахар на 100г
- `userId` (string) - ID пользователя (для получения персональных цен)

**Возвращаемое значение:**
Объект с рассчитанными значениями:

```typescript
{
  totalCalories: number,      // Округлено до 2 знаков
  totalProteins: number,      // Округлено до 2 знаков
  totalFats: number,          // Округлено до 2 знаков
  totalCarbs: number,         // Округлено до 2 знаков
  totalFiber: number | null,  // Округлено до 2 знаков или null
  totalSugar: number | null,  // Округлено до 2 знаков или null
  totalWeight: number,        // Округлено до 2 знаков
  totalPrice: number | null   // Округлено до 2 знаков или null
}
```

**Логика работы:**

1. **Инициализация аккумуляторов:**
   - totalCalories, totalProteins, totalFats, totalCarbs, totalFiber, totalSugar, totalWeight = 0
   - totalPrice = 0
   - canCalculatePrice = true (флаг для отслеживания доступности цен)

2. **Итерация по ингредиентам:**
   Для каждого ингредиента:

   a. **Поиск продукта:**
   - Находит продукт в массиве products по productId
   - Если не найден - пропускает (continue)

   b. **Расчет КБЖУ:**
   - Вычисляет коэффициент: `ratio = amount / 100` (т.к. КБЖУ продуктов на 100г)
   - Суммирует: `totalCalories += product.calories * ratio`
   - Аналогично для proteins, fats, carbs, fiber (опционально), sugar (опционально)

   c. **Суммирование веса:**
   - `totalWeight += amount`

   d. **Расчет цены (если возможно):**
   - Ищет персональную цену пользователя: `UserProductPrice.findUnique({ userId, productId })`
   - Если не найдена:
     - `canCalculatePrice = false`
     - `totalPrice = null`
   - Если найдена:
     - Вычисляет цену ингредиента: `(userPrice.price / 100) * amount`
     - Суммирует: `totalPrice += ingredientPrice`

3. **Округление результатов:**
   - Все значения округляются до 2 знаков: `Math.round(value * 100) / 100`
   - totalFiber и totalSugar: возвращают null если 0, иначе округленное значение

**Исключения:**
Метод не выбрасывает исключений, работает с доступными данными.

**Особенности:**

- **КБЖУ на 100г:** Все расчеты базируются на том, что КБЖУ продуктов указаны на 100г
- **Персональные цены:** Цены берутся из UserProductPrice, специфичны для пользователя
- **Null для цены:** Если хотя бы у одного ингредиента нет цены - totalPrice = null
- **Округление:** Все значения округляются до 2 знаков после запятой
- **Пропуск несуществующих:** Если продукт не найден в массиве - пропускается без ошибки

**Формулы:**

```
ratio = amount / 100
totalCalories = Σ(product.calories * ratio)
totalProteins = Σ(product.proteins * ratio)
totalFats = Σ(product.fats * ratio)
totalCarbs = Σ(product.carbs * ratio)
totalWeight = Σ(amount)
totalPrice = Σ((userPrice.price / 100) * amount)  // или null
```

**Пример использования:**

```typescript
const ingredients = [
  { productId: 'chicken-breast-id', amount: 200, unit: 'G' },
  { productId: 'lettuce-id', amount: 100, unit: 'G' },
  { productId: 'caesar-dressing-id', amount: 50, unit: 'ML' },
];

const products = [
  {
    id: 'chicken-breast-id',
    calories: 165,
    proteins: 31,
    fats: 3.6,
    carbs: 0,
    fiber: null,
    sugar: null,
  },
  {
    id: 'lettuce-id',
    calories: 15,
    proteins: 1.4,
    fats: 0.2,
    carbs: 2.9,
    fiber: 1.3,
    sugar: 0.8,
  },
  {
    id: 'caesar-dressing-id',
    calories: 500,
    proteins: 2,
    fats: 50,
    carbs: 10,
    fiber: null,
    sugar: 5,
  },
];

// UserProductPrice для пользователя:
// chicken-breast-id: 300 руб/100г
// lettuce-id: 80 руб/100г
// caesar-dressing-id: НЕТ ЦЕНЫ

const nutrition = await calculateNutritionService.execute(
  ingredients,
  products,
  'user-uuid',
);

// Расчет:
// Курица (200г):
//   calories: 165 * 2 = 330
//   proteins: 31 * 2 = 62
//   fats: 3.6 * 2 = 7.2
//   carbs: 0 * 2 = 0
//   price: (300 / 100) * 200 = 600

// Салат (100г):
//   calories: 15 * 1 = 15
//   proteins: 1.4 * 1 = 1.4
//   fats: 0.2 * 1 = 0.2
//   carbs: 2.9 * 1 = 2.9
//   fiber: 1.3 * 1 = 1.3
//   sugar: 0.8 * 1 = 0.8
//   price: (80 / 100) * 100 = 80

// Соус (50мл):
//   calories: 500 * 0.5 = 250
//   proteins: 2 * 0.5 = 1
//   fats: 50 * 0.5 = 25
//   carbs: 10 * 0.5 = 5
//   sugar: 5 * 0.5 = 2.5
//   price: НЕТ → totalPrice = null

// Результат:
// {
//   totalCalories: 595,        // 330 + 15 + 250
//   totalProteins: 64.4,       // 62 + 1.4 + 1
//   totalFats: 32.4,           // 7.2 + 0.2 + 25
//   totalCarbs: 7.9,           // 0 + 2.9 + 5
//   totalFiber: 1.3,           // 0 + 1.3 + 0
//   totalSugar: 3.3,           // 0 + 0.8 + 2.5
//   totalWeight: 350,          // 200 + 100 + 50
//   totalPrice: null           // нет цены на соус
// }
```

**Применение:**

- Автоматический расчет при создании блюда (CreateDishService)
- Пересчет при обновлении ингредиентов (UpdateDishService)
- Пересчет при обновлении данных продуктов (RecalculateDishService)

**Важно:**

- **Персональность цен:** Цены специфичны для userId, не для создателя блюда
- **Null для цены:** Если хотя бы одного ингредиента нет в UserProductPrice - вся цена null
- **Не сохраняет:** Сервис только рассчитывает, не сохраняет в БД
- **Единицы измерения:** amount всегда интерпретируется как граммы/мл (на 100 единиц)
- **Округление:** 2 знака после запятой для точности и консистентности
