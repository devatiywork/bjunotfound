import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetDailyNutritionDto, GetPeriodStatsDto } from './dto/index.js';
import { MealStatisticsService } from './meal-statistics.service.js';
import {
  CalendarStats,
  DailyNutrition,
  PeriodStats,
  ShoppingList,
} from './services/index.js';
import {
  MealStatisticsSwaggerDocs,
  MealStatisticsSwaggerResponses,
} from './swagger/meal-statistics.swagger.js';

@ApiTags('Статистика питания')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('meal-statistics')
export class MealStatisticsController {
  constructor(private mealStatisticsService: MealStatisticsService) {}

  @Get('period-stats')
  @ApiOperation(MealStatisticsSwaggerDocs.getPeriodStats)
  @ApiResponse(MealStatisticsSwaggerResponses.periodStats)
  @ApiResponse(MealStatisticsSwaggerResponses.unauthorized)
  async getPeriodStats(
    @Request() req: { user: { userId: string } },
    @Query() dto: GetPeriodStatsDto,
  ): Promise<PeriodStats> {
    return this.mealStatisticsService.getPeriodStats(req.user.userId, dto);
  }

  @Get('calendar')
  @ApiOperation(MealStatisticsSwaggerDocs.getCalendarStats)
  @ApiResponse(MealStatisticsSwaggerResponses.calendarStats)
  @ApiResponse(MealStatisticsSwaggerResponses.unauthorized)
  async getCalendarStats(
    @Request() req: { user: { userId: string } },
    @Query() dto: GetPeriodStatsDto,
  ): Promise<CalendarStats> {
    return this.mealStatisticsService.getCalendarStats(req.user.userId, dto);
  }

  @Get('shopping-list')
  @ApiOperation(MealStatisticsSwaggerDocs.getShoppingList)
  @ApiResponse(MealStatisticsSwaggerResponses.shoppingList)
  @ApiResponse(MealStatisticsSwaggerResponses.unauthorized)
  async getShoppingList(
    @Request() req: { user: { userId: string } },
    @Query() dto: GetPeriodStatsDto,
  ): Promise<ShoppingList> {
    return this.mealStatisticsService.getShoppingList(req.user.userId, dto);
  }

  @Get('daily')
  @ApiOperation(MealStatisticsSwaggerDocs.getDailyNutrition)
  @ApiResponse(MealStatisticsSwaggerResponses.dailyNutrition)
  @ApiResponse(MealStatisticsSwaggerResponses.unauthorized)
  async getDailyNutrition(
    @Request() req: { user: { userId: string } },
    @Query() dto: GetDailyNutritionDto,
  ): Promise<DailyNutrition> {
    return this.mealStatisticsService.getDailyNutrition(req.user.userId, dto);
  }
}
