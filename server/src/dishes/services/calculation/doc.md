# Calculation Services - Документация

Сервисы для расчета КБЖУ и цены блюд на основе их ингредиентов.

---

## ResolveIngredientGramsService

**Файл:** `resolve-ingredient-grams.service.ts`

**Назначение:** Конвертирует любой тип измерения ингредиента (граммы, миллилитры, порции) в граммы. Это ключевой сервис, т.к. вся пищевая ценность указывается на 100 грамм.

### Метод: `execute(item: DishItemForCalculation): ResolvedGramsResult`

**Описание:**
Анализирует тип измерения ингредиента и конвертирует количество в граммы. Возвращает результат с возможными предупреждениями.

**Параметры:**

- `item.measureType` (MeasureType) - тип измерения: GRAMS, MILLILITERS или SERVINGS
- `item.amountG` (number | null) - количество в граммах (для GRAMS)
- `item.amountMl` (number | null) - количество в миллилитрах (для MILLILITERS)
- `item.servingId` (string | null) - ID порции (для SERVINGS)
- `item.servingsCount` (number | null) - количество порций (для SERVINGS)
- `item.serving` (object | null) - данные порции с весом или объемом

**Возвращаемое значение:**

```typescript
{
  resolvedGrams: number | null,    // Количество в граммах
  resolvedMl?: number | null,      // Количество в мл (если применимо)
  issues: DishIssue[]              // Список проблем/предупреждений
}
```

**Логика конвертации:**

1. **GRAMS:** `resolvedGrams = amountG`
   - Самый простой случай, прямое использование

2. **MILLILITERS:** `resolvedGrams = amountMl` (1 мл = 1 г)
   - Используется приближение 1:1
   - Не генерирует warning (это нормальное приближение)

3. **SERVINGS:**
   - Если `serving.weightG`: `resolvedGrams = servingsCount * weightG`
   - Если `serving.volumeMl`:
     - `resolvedMl = servingsCount * volumeMl`
     - `resolvedGrams = resolvedMl` (1 мл = 1 г)
     - Генерирует warning: VOLUME_APPROXIMATION

**Исключения/Issues:**

- `SERVING_INVALID` (error) - порция не найдена, нет веса/объема, или некорректные данные
- `VOLUME_APPROXIMATION` (warning) - порция задана в мл, расчет приблизительный

**Особенности:**

- Всегда валидирует, что количество > 0
- Для SERVINGS проверяет, что порция существует и содержит данные
- Не использует плотность - только приближение 1:1

**Пример использования:**

```typescript
const result = await resolveGramsService.execute({
  id: 'uuid',
  measureType: MeasureType.SERVINGS,
  servingId: 'uuid',
  servingsCount: 4,
  serving: { weightG: 60, volumeMl: null },
});
// result.resolvedGrams = 240 (4 * 60)
```

---

## CalculateDishNutritionService

**Файл:** `calculate-dish-nutrition.service.ts`

**Назначение:** Рассчитывает КБЖУ блюда: итоговые значения, на порцию и на 100г готового блюда.

### Метод: `execute(input: CalculateNutritionInput): CalculateNutritionResult`

**Описание:**
Проходит по всем ингредиентам блюда, конвертирует их в граммы, рассчитывает КБЖУ для каждого и суммирует. Возвращает итоги, значения на порцию и на 100г (от суммы веса ингредиентов).

**Параметры:**

- `input.items` (DishItemWithNutrition[]) - массив ингредиентов с продуктами
- `input.portions` (number) - количество порций блюда (> 0)

**Возвращаемое значение:**

```typescript
{
  nutrition: {
    totals: { kcal, proteins, fats, carbs },
    perPortion: { kcal, proteins, fats, carbs },
    per100g?: { kcal, proteins, fats, carbs }
  },
  totalIngredientsWeight: number,  // суммарный вес всех ингредиентов
  issues: DishIssue[]
}
```

**Логика расчета:**

1. **Валидация:** проверка `portions > 0`

2. **Для каждого ингредиента:**
   - Вызов `ResolveIngredientGramsService` для конвертации в граммы
   - Проверка наличия `nutrition` у продукта
   - Расчет: `coefficient = resolvedGrams / 100`
   - КБЖУ ингредиента = КБЖУ_на_100г \* coefficient
   - Накопление `totalGrams` (сумма веса всех ингредиентов)

3. **Суммирование:** сложение КБЖУ всех ингредиентов

4. **Расчет на порцию:** `perPortion = totals / portions`

5. **Расчет на 100г блюда:**
   - Формула: `per100g = (totals * 100) / totalGrams`
   - Всегда от суммы веса ингредиентов

**Исключения/Issues:**

- `INVALID_PORTIONS` (error) - количество порций <= 0
- `MISSING_NUTRITION` (error) - у продукта нет информации о КБЖУ
- Все issues из `ResolveIngredientGramsService`

**Особенности:**

- Пропускает ингредиенты без nutrition (но добавляет issue)
- Все значения округляются до 2 знаков после запятой
- per100g рассчитывается только если `totalYieldG > 0`

**Пример использования:**

```typescript
const result = await calculateNutritionService.execute({
  items: [
    {
      productUser: {
        nutrition: {
          caloriesKcal: 150,
          proteinsG: 12,
          fatsG: 10,
          carbohydratesG: 1,
        },
      },
      measureType: 'GRAMS',
      amountG: 200,
    },
  ],
  portions: 2,
  totalYieldG: 400,
});
// totals: { kcal: 300, proteins: 24, fats: 20, carbs: 2 }
// perPortion: { kcal: 150, proteins: 12, fats: 10, carbs: 1 }
// per100g: { kcal: 75, proteins: 6, fats: 5, carbs: 0.5 }
```

---

## CalculateDishPriceService

**Файл:** `calculate-dish-price.service.ts`

**Назначение:** Рассчитывает цену блюда на основе последних покупок продуктов.

### Метод: `execute(input: CalculatePriceInput): CalculatePriceResult`

**Описание:**
Проходит по всем ингредиентам, получает последнюю покупку для каждого продукта, рассчитывает цену на основе веса/объема и суммирует. Цена всегда актуальная (динамический расчет).

**Параметры:**

- `input.items` (DishItemWithPackages[]) - массив ингредиентов с покупками
- `input.portions` (number) - количество порций блюда (> 0)

**Возвращаемое значение:**

```typescript
{
  totalPrice: number | null,        // Общая цена
  perPortionPrice: number | null,   // Цена порции
  currency: string | null,          // Валюта (из первой покупки)
  issues: DishIssue[]
}
```

**Логика расчета:**

1. **Валидация:** проверка `portions > 0`

2. **Для каждого ингредиента:**
   - Вызов `ResolveIngredientGramsService` для конвертации в граммы/мл
   - Получение последней покупки (сортировка по `purchasedAt || createdAt`)
   - Расчет цены:
     - Если покупка в граммах: `price = (priceTotal / totalWeightG) * resolvedGrams`
     - Если покупка в мл: `price = (priceTotal / totalVolumeMl) * resolvedMl`

3. **Суммирование:** сложение цен всех ингредиентов

4. **Расчет на порцию:** `perPortionPrice = totalPrice / portions`

**Правило "последняя покупка":**

- Сортировка по `purchasedAt DESC NULLS LAST, createdAt DESC`
- Берется первая запись из отсортированного списка

**Исключения/Issues:**

- `INVALID_PORTIONS` (error) - количество порций <= 0
- `MISSING_PURCHASE` (warning) - нет покупок для продукта
- `MISSING_PURCHASE` (warning) - покупка без веса/объема
- `VOLUME_APPROXIMATION` (warning) - покупка в мл, ингредиент в граммах
- Все issues из `ResolveIngredientGramsService`

**Особенности:**

- Пропускает ингредиенты без покупок (но добавляет warning)
- Валюта берется из первого ингредиента с ценой
- Если разные валюты - не выполняется конвертация (TODO на будущее)
- Все значения округляются до 2 знаков после запятой
- Если нет ни одной цены - возвращает `null`

**Пример использования:**

```typescript
const result = await calculatePriceService.execute({
  items: [
    {
      productUser: {
        packages: [
          {
            priceTotal: 150,
            totalWeightG: 400,
            currency: 'RUB',
            purchasedAt: new Date(),
          },
        ],
      },
      measureType: 'GRAMS',
      amountG: 200,
    },
  ],
  portions: 2,
});
// totalPrice: 75 (150/400*200)
// perPortionPrice: 37.5
// currency: 'RUB'
```

---

## Связи между сервисами

```
CalculateDishNutritionService
    └─> использует ResolveIngredientGramsService

CalculateDishPriceService
    └─> использует ResolveIngredientGramsService
```

**ResolveIngredientGramsService** - базовый сервис, используется обоими расчетными сервисами.

---

## Общие принципы

1. **Динамические расчеты:** ничего не хранится в БД, все пересчитывается при запросе
2. **Обработка ошибок:** сервисы не бросают исключения, а возвращают issues
3. **Пропуск проблемных данных:** если у ингредиента проблема - он пропускается, но issue добавляется
4. **Округление:** все числовые значения округляются до 2 знаков после запятой
5. **Валидация входных данных:** проверка portions > 0, наличие обязательных полей
