import { Injectable } from '@nestjs/common';
import { GetDailyNutritionDto, GetPeriodStatsDto } from './dto/index.js';
import {
  CalendarStats,
  DailyNutrition,
  GetCalendarStatsService,
  GetDailyNutritionService,
  GetPeriodStatsService,
  GetShoppingListService,
  PeriodStats,
  ShoppingList,
} from './services/index.js';

@Injectable()
export class MealStatisticsService {
  constructor(
    private getPeriodStatsService: GetPeriodStatsService,
    private getCalendarStatsService: GetCalendarStatsService,
    private getShoppingListService: GetShoppingListService,
    private getDailyNutritionService: GetDailyNutritionService,
  ) {}

  async getPeriodStats(
    userId: string,
    dto: GetPeriodStatsDto,
  ): Promise<PeriodStats> {
    return this.getPeriodStatsService.execute(userId, dto);
  }

  async getCalendarStats(
    userId: string,
    dto: GetPeriodStatsDto,
  ): Promise<CalendarStats> {
    return this.getCalendarStatsService.execute(userId, dto);
  }

  async getShoppingList(
    userId: string,
    dto: GetPeriodStatsDto,
  ): Promise<ShoppingList> {
    return this.getShoppingListService.execute(userId, dto);
  }

  async getDailyNutrition(
    userId: string,
    dto: GetDailyNutritionDto,
  ): Promise<DailyNutrition> {
    return this.getDailyNutritionService.execute(userId, dto);
  }
}
