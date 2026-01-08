import { Injectable } from '@nestjs/common';
import { AddWeightDto } from './dto/add-weight.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  AddWeightService,
  DeactivateGoalService,
  DeleteWeightService,
  GetActivityLevelsService,
  GetAvailablePeriodService,
  GetGoalService,
  GetGoalsHistoryService,
  GetLatestWeightService,
  GetProfileService,
  GetWeightByPeriodService,
  GetWeightHistoryService,
  SetGoalService,
  UpdateProfileService,
} from './services';

/**
 * Главный сервис пользователей - координатор, делегирующий вызовы специализированным сервисам
 */
@Injectable()
export class UsersService {
  constructor(
    private getProfileService: GetProfileService,
    private updateProfileService: UpdateProfileService,
    private addWeightService: AddWeightService,
    private getWeightHistoryService: GetWeightHistoryService,
    private deleteWeightService: DeleteWeightService,
    private getLatestWeightService: GetLatestWeightService,
    private getWeightByPeriodService: GetWeightByPeriodService,
    private getAvailablePeriodService: GetAvailablePeriodService,
    private setGoalService: SetGoalService,
    private getGoalService: GetGoalService,
    private getGoalsHistoryService: GetGoalsHistoryService,
    private deactivateGoalService: DeactivateGoalService,
    private getActivityLevelsService: GetActivityLevelsService,
  ) {}

  /**
   * Получение профиля пользователя
   */
  async getProfile(userId: string) {
    return this.getProfileService.execute(userId);
  }

  /**
   * Обновление профиля
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    return this.updateProfileService.execute(userId, updateProfileDto);
  }

  /**
   * Добавление записи веса
   */
  async addWeight(userId: string, addWeightDto: AddWeightDto) {
    return this.addWeightService.execute(userId, addWeightDto);
  }

  /**
   * Получение истории веса
   */
  async getWeightHistory(userId: string) {
    return this.getWeightHistoryService.execute(userId);
  }

  /**
   * Удаление записи веса
   */
  async deleteWeight(weightId: string, userId: string) {
    return this.deleteWeightService.execute(weightId, userId);
  }

  /**
   * Получение последнего веса
   */
  async getLatestWeight(userId: string) {
    return this.getLatestWeightService.execute(userId);
  }

  /**
   * Получение веса за период
   */
  async getWeightByPeriod(userId: string, startDate: Date, endDate: Date) {
    return this.getWeightByPeriodService.execute(userId, startDate, endDate);
  }

  /**
   * Получение доступного периода
   */
  async getAvailablePeriod(userId: string) {
    return this.getAvailablePeriodService.execute(userId);
  }

  /**
   * Создание новой цели
   */
  async setGoal(userId: string, createGoalDto: CreateGoalDto) {
    return this.setGoalService.execute(userId, createGoalDto);
  }

  /**
   * Получение активной цели
   */
  async getGoal(userId: string) {
    return this.getGoalService.execute(userId);
  }

  /**
   * Получение истории целей
   */
  async getGoalsHistory(userId: string) {
    return this.getGoalsHistoryService.execute(userId);
  }

  /**
   * Деактивация цели
   */
  async deactivateGoal(userId: string) {
    return this.deactivateGoalService.execute(userId);
  }

  /**
   * Получение всех уровней активности
   */
  async getActivityLevels() {
    return this.getActivityLevelsService.execute();
  }
}
