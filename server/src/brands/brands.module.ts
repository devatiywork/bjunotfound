import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import {
  ApproveBrandService,
  CreateBrandService,
  DeleteBrandPhotoService,
  DeleteBrandService,
  GetBrandService,
  ListBrandsService,
  ListMyBrandsService,
  ListPendingBrandsService,
  RejectBrandService,
  UpdateBrandService,
  UploadBrandPhotoService,
} from './services';

@Module({
  controllers: [BrandsController],
  providers: [
    BrandsService,
    CreateBrandService,
    UpdateBrandService,
    DeleteBrandService,
    GetBrandService,
    ListBrandsService,
    ListPendingBrandsService,
    ListMyBrandsService,
    ApproveBrandService,
    RejectBrandService,
    UploadBrandPhotoService,
    DeleteBrandPhotoService,
  ],
  exports: [BrandsService],
})
export class BrandsModule {}
