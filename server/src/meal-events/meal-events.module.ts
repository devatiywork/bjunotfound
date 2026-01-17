import { Module } from '@nestjs/common';
import { MealEventsController } from './meal-events.controller';
import { MealEventsService } from './meal-events.service';
import {
  ArchiveMealEventService,
  ChangeStatusMealEventService,
  CreateMealEventService,
  GetMealEventByIdService,
  GetMealEventsByPeriodService,
  UpdateMealEventService,
} from './services';

@Module({
  controllers: [MealEventsController],
  providers: [
    MealEventsService,
    CreateMealEventService,
    GetMealEventByIdService,
    GetMealEventsByPeriodService,
    UpdateMealEventService,
    ArchiveMealEventService,
    ChangeStatusMealEventService,
  ],
  exports: [MealEventsService],
})
export class MealEventsModule {}
