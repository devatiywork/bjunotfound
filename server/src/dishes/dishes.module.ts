import { Module } from '@nestjs/common';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';
import {
  AddDishItemService,
  AddDishPhotoService,
  ArchiveDishService,
  CalculateDishNutritionService,
  CalculateDishPriceService,
  CreateDishService,
  GetDishService,
  GetUserDishesService,
  RemoveDishItemService,
  RemoveDishPhotoService,
  ReorderDishItemsService,
  ResolveIngredientGramsService,
  RestoreDishService,
  UpdateDishItemService,
  UpdateDishService,
  UpdateDishStatusService,
} from './services';

@Module({
  imports: [FileUploadModule],
  controllers: [DishesController],
  providers: [
    DishesService,
    // Calculation services
    ResolveIngredientGramsService,
    CalculateDishNutritionService,
    CalculateDishPriceService,
    // Dish services
    CreateDishService,
    GetDishService,
    GetUserDishesService,
    UpdateDishService,
    UpdateDishStatusService,
    ArchiveDishService,
    RestoreDishService,
    // DishItem services
    AddDishItemService,
    UpdateDishItemService,
    RemoveDishItemService,
    ReorderDishItemsService,
    AddDishPhotoService,
    RemoveDishPhotoService,
  ],
  exports: [DishesService],
})
export class DishesModule {}
