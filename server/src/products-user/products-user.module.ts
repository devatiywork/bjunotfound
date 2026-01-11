import { Module } from '@nestjs/common';
import { ProductsUserController } from './products-user.controller';
import { ProductsUserService } from './products-user.service';
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

@Module({
  controllers: [ProductsUserController],
  providers: [
    ProductsUserService,
    // Product services
    CreateProductUserService,
    UpdateProductUserService,
    DeleteProductUserService,
    GetProductUserService,
    ListProductsUserService,
    ListMyProductsUserService,
    SearchProductsUserService,
    // Photo services
    UploadProductUserPhotoService,
    DeleteProductUserPhotoService,
    // Package services
    AddPackageService,
    UpdatePackageService,
    DeletePackageService,
    ListPackagesService,
    // Serving services
    AddServingService,
    UpdateServingService,
    DeleteServingService,
    ListServingsService,
  ],
  exports: [ProductsUserService],
})
export class ProductsUserModule {}
