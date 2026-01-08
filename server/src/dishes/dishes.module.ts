import { Module } from '@nestjs/common';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DishesController } from './dishes.controller';
import { DishesService } from './dishes.service';
import {
  AddToFavoritesService,
  CalculateNutritionService,
  CreateDishService,
  FindAllDishesService,
  FindOneDishService,
  GetFavoritesService,
  RecalculateDishService,
  RemoveDishService,
  RemoveFromFavoritesService,
  UpdateDishService,
} from './services';

@Module({
  imports: [PrismaModule, FileUploadModule],
  providers: [
    DishesService,
    CreateDishService,
    FindAllDishesService,
    FindOneDishService,
    UpdateDishService,
    RemoveDishService,
    RecalculateDishService,
    AddToFavoritesService,
    RemoveFromFavoritesService,
    GetFavoritesService,
    CalculateNutritionService,
  ],
  controllers: [DishesController],
  exports: [DishesService],
})
export class DishesModule {}
