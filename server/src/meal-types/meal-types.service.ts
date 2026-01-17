import { Injectable } from '@nestjs/common';
import {
  CreateMealTypeDto,
  ReorderMealTypeDto,
  UpdateMealTypeDto,
} from './dto';
import {
  ArchiveMealTypeService,
  CreateMealTypeService,
  GetAllMealTypesService,
  ReorderMealTypeService,
  UpdateMealTypeService,
} from './services';

@Injectable()
export class MealTypesService {
  constructor(
    private createMealTypeService: CreateMealTypeService,
    private getAllMealTypesService: GetAllMealTypesService,
    private updateMealTypeService: UpdateMealTypeService,
    private archiveMealTypeService: ArchiveMealTypeService,
    private reorderMealTypeService: ReorderMealTypeService,
  ) {}

  async create(userId: string, dto: CreateMealTypeDto) {
    return this.createMealTypeService.execute(userId, dto);
  }

  async getAll(userId: string) {
    return this.getAllMealTypesService.execute(userId);
  }

  async update(userId: string, mealTypeId: string, dto: UpdateMealTypeDto) {
    return this.updateMealTypeService.execute(userId, mealTypeId, dto);
  }

  async archive(userId: string, mealTypeId: string) {
    return this.archiveMealTypeService.execute(userId, mealTypeId);
  }

  async reorder(userId: string, mealTypeId: string, dto: ReorderMealTypeDto) {
    return this.reorderMealTypeService.execute(userId, mealTypeId, dto);
  }
}
