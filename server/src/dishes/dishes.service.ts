import { Injectable } from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { FilterDishesDto } from './dto/filter-dishes.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import {
  AddToFavoritesService,
  CreateDishService,
  FindAllDishesService,
  FindOneDishService,
  GetFavoritesService,
  RecalculateDishService,
  RemoveDishService,
  RemoveFromFavoritesService,
  UpdateDishService,
} from './services';

@Injectable()
export class DishesService {
  constructor(
    private createDishService: CreateDishService,
    private findAllDishesService: FindAllDishesService,
    private findOneDishService: FindOneDishService,
    private updateDishService: UpdateDishService,
    private removeDishService: RemoveDishService,
    private recalculateDishService: RecalculateDishService,
    private addToFavoritesService: AddToFavoritesService,
    private removeFromFavoritesService: RemoveFromFavoritesService,
    private getFavoritesService: GetFavoritesService,
  ) {}

  /**
   * Создание нового блюда с автоматическим расчетом КБЖУ
   */
  async create(dto: CreateDishDto, userId: string, isAdmin: boolean) {
    return this.createDishService.execute(dto, userId, isAdmin);
  }

  /**
   * Получение списка блюд с фильтрацией
   */
  async findAll(filters: FilterDishesDto, userId?: string) {
    return this.findAllDishesService.execute(filters, userId);
  }

  /**
   * Получение блюда по ID
   */
  async findOne(id: string, userId?: string) {
    return this.findOneDishService.execute(id, userId);
  }

  /**
   * Обновление блюда с пересчетом КБЖУ (если изменились ингредиенты)
   */
  async update(
    id: string,
    dto: UpdateDishDto,
    userId: string,
    isAdmin: boolean,
  ) {
    return this.updateDishService.execute(id, dto, userId, isAdmin);
  }

  /**
   * Удаление блюда
   */
  async remove(id: string, userId: string, isAdmin: boolean) {
    return this.removeDishService.execute(id, userId, isAdmin);
  }

  /**
   * Пересчет КБЖУ блюда (если изменились данные продуктов)
   */
  async recalculate(id: string, userId: string, isAdmin: boolean) {
    return this.recalculateDishService.execute(id, userId, isAdmin);
  }

  /**
   * Добавление блюда в избранное
   */
  async addToFavorites(dishId: string, userId: string) {
    return this.addToFavoritesService.execute(dishId, userId);
  }

  /**
   * Удаление блюда из избранного
   */
  async removeFromFavorites(dishId: string, userId: string) {
    return this.removeFromFavoritesService.execute(dishId, userId);
  }

  /**
   * Получение избранных блюд пользователя
   */
  async getFavorites(userId: string) {
    return this.getFavoritesService.execute(userId);
  }
}
