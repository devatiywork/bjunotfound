import { Module } from '@nestjs/common';
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
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    GetProfileService,
    UpdateProfileService,
    AddWeightService,
    GetWeightHistoryService,
    DeleteWeightService,
    GetLatestWeightService,
    GetWeightByPeriodService,
    GetAvailablePeriodService,
    SetGoalService,
    GetGoalService,
    GetGoalsHistoryService,
    DeactivateGoalService,
    GetActivityLevelsService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
