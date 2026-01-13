import { Injectable } from '@nestjs/common';
import { DishStatus } from '@prisma/client';
import { AddDishItemDto } from './dto/add-dish-item.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { ReorderDishItemsDto } from './dto/reorder-dish-items.dto';
import { UpdateDishItemDto } from './dto/update-dish-item.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import {
  AddDishItemService,
  AddDishPhotoService,
  ArchiveDishService,
  CreateDishService,
  GetDishService,
  GetUserDishesFilters,
  GetUserDishesService,
  RemoveDishItemService,
  RemoveDishPhotoService,
  ReorderDishItemsService,
  RestoreDishService,
  UpdateDishItemService,
  UpdateDishService,
  UpdateDishStatusService,
} from './services';

/**
 * Главный сервис-координатор для работы с блюдами.
 * Делегирует вызовы специализированным сервисам согласно архитектуре Service Layer.
 */
@Injectable()
export class DishesService {
  constructor(
    // Dish services
    private createDishService: CreateDishService,
    private getDishService: GetDishService,
    private getUserDishesService: GetUserDishesService,
    private updateDishService: UpdateDishService,
    private updateDishStatusService: UpdateDishStatusService,
    private archiveDishService: ArchiveDishService,
    private restoreDishService: RestoreDishService,
    // DishItem services
    private addDishItemService: AddDishItemService,
    private updateDishItemService: UpdateDishItemService,
    private removeDishItemService: RemoveDishItemService,
    private reorderDishItemsService: ReorderDishItemsService,
    // Photo services
    private addDishPhotoService: AddDishPhotoService,
    private removeDishPhotoService: RemoveDishPhotoService,
  ) {}

  // ============= CRUD Блюд =============

  async createDish(userId: string, dto: CreateDishDto) {
    return this.createDishService.execute(userId, dto);
  }

  async getDish(userId: string, dishId: string) {
    return this.getDishService.execute(userId, dishId);
  }

  async getUserDishes(userId: string, filters?: GetUserDishesFilters) {
    return this.getUserDishesService.execute(userId, filters);
  }

  async updateDish(userId: string, dishId: string, dto: UpdateDishDto) {
    return this.updateDishService.execute(userId, dishId, dto);
  }

  async updateDishStatus(userId: string, dishId: string, status: DishStatus) {
    return this.updateDishStatusService.execute(userId, dishId, status);
  }

  async archiveDish(userId: string, dishId: string) {
    return this.archiveDishService.execute(userId, dishId);
  }

  async restoreDish(userId: string, dishId: string) {
    return this.restoreDishService.execute(userId, dishId);
  }

  // ============= Управление ингредиентами =============

  async addDishItem(userId: string, dishId: string, dto: AddDishItemDto) {
    return this.addDishItemService.execute(userId, dishId, dto);
  }

  async updateDishItem(
    userId: string,
    dishId: string,
    itemId: string,
    dto: UpdateDishItemDto,
  ) {
    return this.updateDishItemService.execute(userId, dishId, itemId, dto);
  }

  async removeDishItem(userId: string, dishId: string, itemId: string) {
    return this.removeDishItemService.execute(userId, dishId, itemId);
  }

  async reorderDishItems(
    userId: string,
    dishId: string,
    dto: ReorderDishItemsDto,
  ) {
    return this.reorderDishItemsService.execute(userId, dishId, dto);
  }

  // ============= Photo =============

  async addDishPhoto(userId: string, dishId: string, photoUrl: string) {
    return this.addDishPhotoService.execute(userId, dishId, photoUrl);
  }

  async removeDishPhoto(userId: string, dishId: string, photoUrl: string) {
    return this.removeDishPhotoService.execute(userId, dishId, photoUrl);
  }
}
