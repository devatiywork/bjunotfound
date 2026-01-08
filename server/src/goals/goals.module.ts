import { Module } from '@nestjs/common';
import { CalorieSettingsService } from '../utils/calorie-settings.service';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
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
  UpdateExpiredGoalsService,
  UpdateGoalService,
  UpdateGoalStatusesService,
} from './services';

@Module({
  controllers: [GoalsController],
  providers: [
    GoalsService,
    CalorieSettingsService,
    CalculateCaloriesService,
    CalculateGoalPaceService,
    GetUserGoalsService,
    GetActiveGoalsService,
    GetAllGoalsService,
    GetArchivedGoalsService,
    GetGoalByIdService,
    UpdateGoalService,
    ArchiveGoalService,
    RestoreGoalService,
    GetGoalProgressService,
    RecalculateGoalRecommendationService,
    UpdateExpiredGoalsService,
    UpdateGoalStatusesService,
  ],
  exports: [GoalsService],
})
export class GoalsModule {}
