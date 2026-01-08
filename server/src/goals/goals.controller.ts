import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalculateCaloriesDto } from './dto/calculate-calories.dto';
import { CalculateGoalPaceDto } from './dto/calculate-goal-pace.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  /**
   * POST /goals/calculate-calories
   * Расчет калорий для достижения цели
   */
  @Post('calculate-calories')
  async calculateCalories(
    @Request() req,
    @Body() calculateCaloriesDto: CalculateCaloriesDto,
  ) {
    return this.goalsService.calculateCalories(
      req.user.userId,
      calculateCaloriesDto,
    );
  }

  /**
   * POST /goals/calculate-pace
   * Генерация вариантов темпа достижения цели
   */
  @Post('calculate-pace')
  async calculateGoalPaceOptions(
    @Request() req,
    @Body() calculateGoalPaceDto: CalculateGoalPaceDto,
  ) {
    return this.goalsService.calculateGoalPaceOptions(
      req.user.userId,
      calculateGoalPaceDto,
    );
  }

  /**
   * GET /goals
   * Получить все цели пользователя
   */
  @Get()
  async getUserGoals(@Request() req) {
    return this.goalsService.getUserGoals(req.user.userId);
  }

  /**
   * GET /goals/active
   * Получить активные цели пользователя
   */
  @Get('active')
  async getActiveGoals(@Request() req) {
    return this.goalsService.getActiveGoals(req.user.userId);
  }

  /**
   * GET /goals/archived
   * Получить архивированные цели пользователя
   */
  @Get('archived')
  async getArchivedGoals(@Request() req) {
    return this.goalsService.getArchivedGoals(req.user.userId);
  }

  /**
   * GET /goals/:id
   * Получить цель по ID
   */
  @Get(':id')
  async getGoalById(@Request() req, @Param('id') goalId: string) {
    return this.goalsService.getGoalById(req.user.userId, goalId);
  }

  /**
   * GET /goals/:id/progress
   * Получить прогресс по цели
   */
  @Get(':id/progress')
  async getGoalProgress(@Request() req, @Param('id') goalId: string) {
    return this.goalsService.getGoalProgress(req.user.userId, goalId);
  }

  /**
   * POST /goals/:id/recalculate
   * Получить рекомендацию по пересчету калорий (не изменяет цель)
   */
  @Post(':id/recalculate')
  async recalculateGoalRecommendation(
    @Request() req,
    @Param('id') goalId: string,
  ) {
    return this.goalsService.recalculateGoalRecommendation(
      req.user.userId,
      goalId,
    );
  }

  /**
   * PATCH /goals/:id
   * Обновить цель
   */
  @Patch(':id')
  async updateGoal(
    @Request() req,
    @Param('id') goalId: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.updateGoal(req.user.userId, goalId, updateGoalDto);
  }

  /**
   * DELETE /goals/:id
   * Архивировать цель (мягкое удаление)
   */
  @Delete(':id')
  async archiveGoal(@Request() req, @Param('id') goalId: string) {
    return this.goalsService.archiveGoal(goalId, req.user.userId);
  }

  /**
   * POST /goals/:id/restore
   * Восстановить архивированную цель
   */
  @Post(':id/restore')
  async restoreGoal(@Request() req, @Param('id') goalId: string) {
    return this.goalsService.restoreGoal(goalId, req.user.userId);
  }
}
