import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import {
  ApproveBrandService,
  CreateBrandService,
  DeleteBrandPhotoService,
  DeleteBrandService,
  GetBrandService,
  ListBrandGroupsService,
  ListBrandsService,
  ListMyBrandsService,
  ListPendingBrandsService,
  MergeBrandsService,
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
    ListBrandGroupsService,
    ListMyBrandsService,
    ApproveBrandService,
    RejectBrandService,
    MergeBrandsService,
    UploadBrandPhotoService,
    DeleteBrandPhotoService,
  ],
  exports: [BrandsService],
})
export class BrandsModule {}
