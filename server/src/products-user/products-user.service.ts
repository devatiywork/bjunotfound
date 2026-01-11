import { Injectable } from '@nestjs/common';
import {
  AddPackageDto,
  AddServingDto,
  CreateProductUserDto,
  UpdatePackageDto,
  UpdateProductUserDto,
  UpdateServingDto,
} from './dto/index';
import {
  AddPackageService,
  AddServingService,
  CreateProductUserService,
  DeletePackageService,
  DeleteProductUserPhotoService,
  DeleteProductUserService,
  DeleteServingService,
  GetProductUserService,
  ListMyProductsUserService,
  ListPackagesService,
  ListProductsUserService,
  ListServingsService,
  SearchProductsUserService,
  UpdatePackageService,
  UpdateProductUserService,
  UpdateServingService,
  UploadProductUserPhotoService,
} from './services';

@Injectable()
export class ProductsUserService {
  constructor(
    private createProductUserService: CreateProductUserService,
    private updateProductUserService: UpdateProductUserService,
    private deleteProductUserService: DeleteProductUserService,
    private getProductUserService: GetProductUserService,
    private listProductsUserService: ListProductsUserService,
    private listMyProductsUserService: ListMyProductsUserService,
    private searchProductsUserService: SearchProductsUserService,
    private uploadProductUserPhotoService: UploadProductUserPhotoService,
    private deleteProductUserPhotoService: DeleteProductUserPhotoService,
    private addPackageService: AddPackageService,
    private updatePackageService: UpdatePackageService,
    private deletePackageService: DeletePackageService,
    private listPackagesService: ListPackagesService,
    private addServingService: AddServingService,
    private updateServingService: UpdateServingService,
    private deleteServingService: DeleteServingService,
    private listServingsService: ListServingsService,
  ) {}

  // Product operations
  async createProduct(userId: string, dto: CreateProductUserDto) {
    return this.createProductUserService.execute(dto, userId);
  }

  async updateProduct(
    productId: string,
    userId: string,
    isAdmin: boolean,
    dto: UpdateProductUserDto,
  ) {
    return this.updateProductUserService.execute(
      productId,
      dto,
      userId,
      isAdmin,
    );
  }

  async deleteProduct(productId: string, userId: string, isAdmin: boolean) {
    return this.deleteProductUserService.execute(productId, userId, isAdmin);
  }

  async getProduct(productId: string, userId: string, isAdmin: boolean) {
    return this.getProductUserService.execute(productId, userId, isAdmin);
  }

  async listProducts(
    page: number,
    limit: number,
    categoryId?: string,
    brandId?: string,
    userId?: string,
  ) {
    return this.listProductsUserService.execute(page, limit, {
      categoryId,
      brandId,
      userId,
    });
  }

  async listMyProducts(
    userId: string,
    page: number,
    limit: number,
    categoryId?: string,
    brandId?: string,
  ) {
    return this.listMyProductsUserService.execute(userId, page, limit, {
      categoryId,
      brandId,
    });
  }

  async searchProducts(userId: string, query: string) {
    return this.searchProductsUserService.execute(userId, query);
  }

  // Photo operations
  async uploadPhoto(
    productId: string,
    userId: string,
    isAdmin: boolean,
    file: Express.Multer.File,
  ) {
    return this.uploadProductUserPhotoService.execute(
      productId,
      file,
      userId,
      isAdmin,
    );
  }

  async deletePhoto(
    productId: string,
    userId: string,
    isAdmin: boolean,
    photoUrl: string,
  ) {
    return this.deleteProductUserPhotoService.execute(
      productId,
      photoUrl,
      userId,
      isAdmin,
    );
  }

  // Package operations
  async addPackage(productId: string, userId: string, dto: AddPackageDto) {
    return this.addPackageService.execute(productId, dto, userId);
  }

  async updatePackage(
    productId: string,
    packageId: string,
    userId: string,
    dto: UpdatePackageDto,
  ) {
    return this.updatePackageService.execute(productId, packageId, dto, userId);
  }

  async deletePackage(productId: string, packageId: string, userId: string) {
    return this.deletePackageService.execute(productId, packageId, userId);
  }

  async listPackages(productId: string, userId: string, isAdmin: boolean) {
    return this.listPackagesService.execute(productId, userId, isAdmin);
  }

  // Serving operations
  async addServing(productId: string, userId: string, dto: AddServingDto) {
    return this.addServingService.execute(productId, dto, userId);
  }

  async updateServing(
    productId: string,
    servingId: string,
    userId: string,
    dto: UpdateServingDto,
  ) {
    return this.updateServingService.execute(productId, servingId, dto, userId);
  }

  async deleteServing(productId: string, servingId: string, userId: string) {
    return this.deleteServingService.execute(productId, servingId, userId);
  }

  async listServings(productId: string, userId: string, isAdmin: boolean) {
    return this.listServingsService.execute(productId, userId, isAdmin);
  }
}
