import { Module } from '@nestjs/common';
import { MealStatisticsController } from './meal-statistics.controller.js';
import { MealStatisticsService } from './meal-statistics.service.js';
import {
  GetCalendarStatsService,
  GetDailyNutritionService,
  GetPeriodStatsService,
  GetShoppingListService,
} from './services/index.js';

@Module({
  controllers: [MealStatisticsController],
  providers: [
    MealStatisticsService,
    GetPeriodStatsService,
    GetCalendarStatsService,
    GetShoppingListService,
    GetDailyNutritionService,
  ],
  exports: [MealStatisticsService],
})
export class MealStatisticsModule {}
