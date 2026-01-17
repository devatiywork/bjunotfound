import { Injectable } from '@nestjs/common';
import {
  ChangeStatusDto,
  CreateMealEventDto,
  GetEventsPeriodDto,
  UpdateMealEventDto,
} from './dto';
import {
  ArchiveMealEventService,
  ChangeStatusMealEventService,
  CreateMealEventService,
  GetMealEventByIdService,
  GetMealEventsByPeriodService,
  UpdateMealEventService,
} from './services';

@Injectable()
export class MealEventsService {
  constructor(
    private createService: CreateMealEventService,
    private getByIdService: GetMealEventByIdService,
    private getByPeriodService: GetMealEventsByPeriodService,
    private updateService: UpdateMealEventService,
    private archiveService: ArchiveMealEventService,
    private changeStatusService: ChangeStatusMealEventService,
  ) {}

  async create(userId: string, dto: CreateMealEventDto) {
    return this.createService.execute(userId, dto);
  }

  async getById(userId: string, eventId: string) {
    return this.getByIdService.execute(userId, eventId);
  }

  async getByPeriod(userId: string, dto: GetEventsPeriodDto) {
    return this.getByPeriodService.execute(userId, dto);
  }

  async update(userId: string, eventId: string, dto: UpdateMealEventDto) {
    return this.updateService.execute(userId, eventId, dto);
  }

  async archive(userId: string, eventId: string) {
    return this.archiveService.execute(userId, eventId);
  }

  async changeStatus(userId: string, eventId: string, dto: ChangeStatusDto) {
    return this.changeStatusService.execute(userId, eventId, dto);
  }
}
