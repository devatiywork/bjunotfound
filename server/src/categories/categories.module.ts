import { Module } from '@nestjs/common';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryService,
  DeleteCategoryService,
  DeletePhotoService,
  GetCategoryService,
  GetCategoryTreeService,
  ListCategoriesService,
  UpdateCategoryService,
  UploadPhotoService,
} from './services';

@Module({
  imports: [FileUploadModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    CreateCategoryService,
    UpdateCategoryService,
    DeleteCategoryService,
    GetCategoryService,
    ListCategoriesService,
    GetCategoryTreeService,
    UploadPhotoService,
    DeletePhotoService,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
