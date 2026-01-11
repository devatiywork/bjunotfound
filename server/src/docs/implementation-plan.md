# План реализации модулей

## ✅ Реализованные модули

- Auth (регистрация, логин, JWT, refresh tokens)
- Users (профиль, веса, цели)
- Goals (расчет калорий, темп достижения)
- Admin (управление пользователями, настройки калорий)
- Activities (уровни активности)
- Categories (дерево категорий, slug, фото)
- Brands (модерация, фото)
- FileUpload (Cloudinary)

## 📋 Модули к реализации

### 1. Tags (Теги для блюд)

**Endpoints:**

- GET /tags
- GET /tags/:id
- POST /tags (admin)
- PATCH /tags/:id (admin)
- DELETE /tags/:id (admin)

**Функционал:**

- CRUD операции
- Проверка использования в блюдах перед удалением

---

### 2. ProductGlobal (Глобальные продукты)

**Endpoints:**

- GET /products-global
- GET /products-global/search (поиск по названию)
- GET /products-global/:id
- POST /products-global (admin)
- PATCH /products-global/:id (admin)
- DELETE /products-global/:id (admin)
- POST /products-global/:id/photos (admin)
- DELETE /products-global/:id/photos (admin)

**Функционал:**

- CRUD с i18n (название, описание на разных языках)
- Связь с Brand, Category
- Nutrition facts (калории, белки, жиры, углеводы, порция)
- Массив фото через Cloudinary
- Фильтрация по категории, бренду
- Поиск по i18n названию

**Специализированные сервисы:**

- CreateProductGlobalService
- UpdateProductGlobalService
- DeleteProductGlobalService
- GetProductGlobalService
- ListProductsGlobalService
- SearchProductsGlobalService
- UploadProductGlobalPhotoService
- DeleteProductGlobalPhotoService

---

### 3. ProductUser (Пользовательские продукты)

**Endpoints:**

- GET /products-user
- GET /products-user/my
- GET /products-user/:id
- POST /products-user
- PATCH /products-user/:id
- DELETE /products-user/:id
- POST /products-user/:id/photos
- DELETE /products-user/:id/photos
- POST /products-user/:id/packages (добавить упаковку)
- PATCH /products-user/:id/packages/:packageId (обновить упаковку)
- DELETE /products-user/:id/packages/:packageId (удалить упаковку)
- POST /products-user/:id/servings (добавить порцию)
- PATCH /products-user/:id/servings/:servingId (обновить порцию)
- DELETE /products-user/:id/servings/:servingId (удалить порцию)
- POST /products-user/:id/prices (добавить цену)
- PATCH /products-user/:id/prices/:priceId (обновить цену)
- DELETE /products-user/:id/prices/:priceId (удалить цену)

**Функционал:**

- CRUD с i18n
- Связь с Brand, Category
- Nutrition facts
- Packages (упаковки: название, вес, цена)
- Servings (порции: название, вес, цена)
- UserProductPrices (история цен пользователя)
- Массив фото
- Доступ: создатель видит свои, админ видит все

**Специализированные сервисы:**

- CreateProductUserService
- UpdateProductUserService
- DeleteProductUserService
- GetProductUserService
- ListProductsUserService
- ListMyProductsUserService
- UploadProductUserPhotoService
- DeleteProductUserPhotoService
- AddPackageService
- UpdatePackageService
- DeletePackageService
- AddServingService
- UpdateServingService
- DeleteServingService
- AddPriceService
- UpdatePriceService
- DeletePriceService

---

### 4. Dishes (Блюда)

**Endpoints:**

- GET /dishes
- GET /dishes/my
- GET /dishes/:id
- POST /dishes
- PATCH /dishes/:id
- DELETE /dishes/:id
- POST /dishes/:id/photos
- DELETE /dishes/:id/photos
- POST /dishes/:id/ingredients (добавить ингредиент)
- PATCH /dishes/:id/ingredients/:ingredientId (обновить ингредиент)
- DELETE /dishes/:id/ingredients/:ingredientId (удалить ингредиент)
- POST /dishes/:id/tags (привязать тег)
- DELETE /dishes/:id/tags/:tagId (отвязать тег)

**Функционал:**

- CRUD с i18n (название, описание, инструкции)
- DishIngredients (продукты + количество + единица измерения)
- Автоматический расчет КБЖУ на основе ингредиентов
- Связь с тегами (многие-ко-многим через DishTags)
- Массив фото
- Доступ: создатель видит свои, админ видит все

**Специализированные сервисы:**

- CreateDishService
- UpdateDishService
- DeleteDishService
- GetDishService
- ListDishesService
- ListMyDishesService
- UploadDishPhotoService
- DeleteDishPhotoService
- AddIngredientService
- UpdateIngredientService
- DeleteIngredientService
- CalculateDishNutritionService (автоматический подсчет)
- AttachTagService
- DetachTagService

---

### 5. MealPlan (Планирование питания)

**Endpoints:**

- GET /meal-plans
- GET /meal-plans/:date (план на день)
- GET /meal-plans/week (план на неделю)
- GET /meal-plans/:id
- POST /meal-plans (добавить продукт/блюдо в план)
- PATCH /meal-plans/:id (обновить количество, отметить съеденным)
- DELETE /meal-plans/:id
- POST /meal-plans/copy (копировать день в другую дату)
- GET /meal-plans/stats/:date (КБЖУ за день)
- GET /meal-plans/stats/week (КБЖУ за неделю)

**Функционал:**

- Добавление продуктов/блюд в план (дата + прием пищи)
- Указание количества (граммы, порции)
- Флаг isEaten (съедено)
- Автоматический подсчет КБЖУ за день/неделю/период
- Копирование плана питания
- Фильтрация по дате, приему пищи
- Сравнение с целевыми калориями

**Специализированные сервисы:**

- AddMealPlanItemService
- UpdateMealPlanItemService
- DeleteMealPlanItemService
- GetMealPlanService
- GetDayMealPlanService
- GetWeekMealPlanService
- MarkAsEatenService
- CopyDayMealPlanService
- CalculateDayStatsService
- CalculateWeekStatsService
- CompareToDailyGoalService

---

## Порядок реализации

1. **Tags** (самый простой - базовый CRUD)
2. **ProductGlobal** (база для пользовательских продуктов)
3. **ProductUser** (расширенный функционал с packages/servings/prices)
4. **Dishes** (зависит от продуктов)
5. **MealPlan** (финальный модуль, использует все остальное)

---

## Общие требования

**Для каждого модуля:**

- ✅ Специализированные сервисы (1 операция = 1 сервис)
- ✅ Главный сервис-координатор
- ✅ Контроллер с guards
- ✅ DTOs с валидацией
- ✅ Swagger документация (inline в контроллере)
- ✅ doc.md для каждой группы сервисов
- ✅ MD документация в src/docs/ с curl примерами
- ✅ Регистрация в AppModule
- ✅ npm run build без ошибок

**I18n структура:**

```json
{
  "en": "Product Name",
  "ru": "Название продукта"
}
```

**Nutrition структура:**

```json
{
  "calories": 100,
  "protein": 5,
  "fat": 3,
  "carbs": 12,
  "servingSize": 100,
  "servingUnit": "g"
}
```
