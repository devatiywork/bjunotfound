import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from '../file-upload/cloudinary.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import {
  CreateProductService,
  FindAllProductsService,
  FindByBarcodeService,
  FindOneProductService,
  GetStatsService,
  RemoveProductService,
  UpdateProductService,
} from './services';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
      // `expiresIn` may be a string like '15m' from env; cast to any to satisfy types
      signOptions: {
        expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
      },
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    CloudinaryService,
    CreateProductService,
    FindAllProductsService,
    FindOneProductService,
    FindByBarcodeService,
    UpdateProductService,
    RemoveProductService,
    GetStatsService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
