import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  CreateProductService,
  FindAllProductsService,
  FindByBarcodeService,
  FindOneProductService,
  GetStatsService,
  RemoveProductService,
  UpdateProductService,
} from './services';

/**
 * Главный сервис продуктов - координатор, делегирующий вызовы специализированным сервисам
 */
@Injectable()
export class ProductsService {
  constructor(
    private createProductService: CreateProductService,
    private findAllProductsService: FindAllProductsService,
    private findOneProductService: FindOneProductService,
    private findByBarcodeService: FindByBarcodeService,
    private updateProductService: UpdateProductService,
    private removeProductService: RemoveProductService,
    private getStatsService: GetStatsService,
  ) {}

  /**
   * Создать новый продукт
   */
  async create(userId: string | null, dto: CreateProductDto, isAdmin: boolean) {
    return this.createProductService.execute(userId, dto, isAdmin);
  }

  /**
   * Получить список продуктов с фильтрацией и пагинацией
   */
  async findAll(filters: FilterProductsDto, userId?: string) {
    return this.findAllProductsService.execute(filters, userId);
  }

  /**
   * Получить продукт по ID
   */
  async findOne(id: string, userId?: string) {
    return this.findOneProductService.execute(id, userId);
  }

  /**
   * Найти продукт по штрих-коду
   */
  async findByBarcode(barcode: string, userId?: string) {
    return this.findByBarcodeService.execute(barcode, userId);
  }

  /**
   * Обновить продукт
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateProductDto,
    isAdmin: boolean,
  ) {
    return this.updateProductService.execute(id, userId, dto, isAdmin);
  }

  /**
   * Удалить продукт
   */
  async remove(id: string, userId: string, isAdmin: boolean) {
    return this.removeProductService.execute(id, userId, isAdmin);
  }

  /**
   * Получить статистику продуктов (только для админов)
   */
  async getStats() {
    return this.getStatsService.execute();
  }
}
