import { Injectable } from '@nestjs/common';
import { CalculateCaloriesDto } from './dto/calculate-calories.dto';
import { CalculateGoalPaceDto } from './dto/calculate-goal-pace.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import {
  ArchiveGoalService,
  CalculateCaloriesService,
  CalculateGoalPaceService,
  GetActiveGoalsService,
  GetAllGoalsService,
  GetArchivedGoalsService,
  GetGoalByIdService,
  GetGoalProgressService,
  GetUserGoalsService,
  RecalculateGoalRecommendationService,
  RestoreGoalService,
  UpdateGoalService,
} from './services';

@Injectable()
export class GoalsService {
  constructor(
    private calculateCaloriesService: CalculateCaloriesService,
    private calculateGoalPaceService: CalculateGoalPaceService,
    private getUserGoalsService: GetUserGoalsService,
    private getActiveGoalsService: GetActiveGoalsService,
    private getAllGoalsService: GetAllGoalsService,
    private getArchivedGoalsService: GetArchivedGoalsService,
    private getGoalByIdService: GetGoalByIdService,
    private updateGoalService: UpdateGoalService,
    private archiveGoalService: ArchiveGoalService,
    private restoreGoalService: RestoreGoalService,
    private getGoalProgressService: GetGoalProgressService,
    private recalculateGoalRecommendationService: RecalculateGoalRecommendationService,
  ) {}

  /**
   * Расчет калорий для достижения цели
   */
  async calculateCalories(
    userId: string,
    calculateCaloriesDto: CalculateCaloriesDto,
  ) {
    return this.calculateCaloriesService.execute(userId, calculateCaloriesDto);
  }

  /**
   * Генерация вариантов темпа достижения цели
   */
  async calculateGoalPaceOptions(
    userId: string,
    calculateGoalPaceDto: CalculateGoalPaceDto,
  ) {
    return this.calculateGoalPaceService.execute(userId, calculateGoalPaceDto);
  }

  /**
   * Получить все цели пользователя
   */
  async getUserGoals(userId: string) {
    return this.getUserGoalsService.execute(userId);
  }

  /**
   * Получить активные цели пользователя
   */
  async getActiveGoals(userId: string) {
    return this.getActiveGoalsService.execute(userId);
  }

  /**
   * Получить все цели пользователя (кроме архивированных)
   */
  async getAllGoals(userId: string) {
    return this.getAllGoalsService.execute(userId);
  }

  /**
   * Получить архивированные цели пользователя
   */
  async getArchivedGoals(userId: string) {
    return this.getArchivedGoalsService.execute(userId);
  }

  /**
   * Получить цель по ID
   */
  async getGoalById(userId: string, goalId: string) {
    return this.getGoalByIdService.execute(userId, goalId);
  }

  /**
   * Обновить цель
   */
  async updateGoal(
    userId: string,
    goalId: string,
    updateGoalDto: UpdateGoalDto,
  ) {
    return this.updateGoalService.execute(userId, goalId, updateGoalDto);
  }

  /**
   * Архивирование цели (мягкое удаление)
   */
  async archiveGoal(goalId: string, userId: string) {
    return this.archiveGoalService.execute(goalId, userId);
  }

  /**
   * Восстановление архивированной цели
   */
  async restoreGoal(goalId: string, userId: string) {
    return this.restoreGoalService.execute(goalId, userId);
  }

  /**
   * Удалить цель (старый метод - теперь вызывает архивирование)
   * @deprecated Используйте archiveGoal вместо этого метода
   */
  async deleteGoal(userId: string, goalId: string) {
    return this.archiveGoal(goalId, userId);
  }

  /**
   * Получить прогресс по цели
   */
  async getGoalProgress(userId: string, goalId: string) {
    return this.getGoalProgressService.execute(userId, goalId);
  }

  /**
   * Получить рекомендацию по пересчету калорий для цели
   * НЕ изменяет цель, только возвращает рекомендацию
   */
  async recalculateGoalRecommendation(userId: string, goalId: string) {
    return this.recalculateGoalRecommendationService.execute(userId, goalId);
  }
}
