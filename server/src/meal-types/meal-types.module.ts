import { Module } from '@nestjs/common';
import { MealTypesController } from './meal-types.controller';
import { MealTypesService } from './meal-types.service';
import {
  ArchiveMealTypeService,
  CreateMealTypeService,
  GetAllMealTypesService,
  ReorderMealTypeService,
  UpdateMealTypeService,
} from './services';

@Module({
  controllers: [MealTypesController],
  providers: [
    MealTypesService,
    CreateMealTypeService,
    GetAllMealTypesService,
    UpdateMealTypeService,
    ArchiveMealTypeService,
    ReorderMealTypeService,
  ],
  exports: [MealTypesService],
})
export class MealTypesModule {}
