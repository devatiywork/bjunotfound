/**
 * Централизованный экспорт всех специализированных сервисов модуля Dishes.
 * Следует архитектуре Service Layer с разделением по операциям.
 */

// Calculation services
export { CalculateDishNutritionService } from './calculation/calculate-dish-nutrition.service';
export { CalculateDishPriceService } from './calculation/calculate-dish-price.service';
export { ResolveIngredientGramsService } from './calculation/resolve-ingredient-grams.service';

// Dish services
export { ArchiveDishService } from './dish/archive-dish.service';
export { CreateDishService } from './dish/create-dish.service';
export { GetDishService } from './dish/get-dish.service';
export { GetUserDishesService } from './dish/get-user-dishes.service';
export type { GetUserDishesFilters } from './dish/get-user-dishes.service';
export { RestoreDishService } from './dish/restore-dish.service';
export { UpdateDishStatusService } from './dish/update-dish-status.service';
export { UpdateDishService } from './dish/update-dish.service';

// DishItem services
export { AddDishItemService } from './dish-item/add-dish-item.service';
export { RemoveDishItemService } from './dish-item/remove-dish-item.service';
export { ReorderDishItemsService } from './dish-item/reorder-dish-items.service';
export { UpdateDishItemService } from './dish-item/update-dish-item.service';
// Photo services
export { AddDishPhotoService } from './photo/add-dish-photo.service';
export { RemoveDishPhotoService } from './photo/remove-dish-photo.service';
