import { Module } from '@nestjs/common';
import { CalorieSettingsService } from '../utils/calorie-settings.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CalorieSettingsController } from './calorie-settings.controller';

@Module({
  controllers: [AdminController, CalorieSettingsController],
  providers: [AdminService, CalorieSettingsService],
})
export class AdminModule {}
