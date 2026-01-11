import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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

@Injectable()
export class CategoriesService {
  constructor(
    private createCategoryService: CreateCategoryService,
    private updateCategoryService: UpdateCategoryService,
    private deleteCategoryService: DeleteCategoryService,
    private getCategoryService: GetCategoryService,
    private listCategoriesService: ListCategoriesService,
    private getCategoryTreeService: GetCategoryTreeService,
    private uploadPhotoService: UploadPhotoService,
    private deletePhotoService: DeletePhotoService,
  ) {}

  create(dto: CreateCategoryDto) {
    return this.createCategoryService.execute(dto);
  }

  update(id: string, dto: UpdateCategoryDto) {
    return this.updateCategoryService.execute(id, dto);
  }

  delete(id: string) {
    return this.deleteCategoryService.execute(id);
  }

  findOne(id: string, isAdmin: boolean = false) {
    return this.getCategoryService.execute(id, isAdmin);
  }

  findBySlug(slug: string, isAdmin: boolean = false) {
    return this.getCategoryService.executeBySlug(slug, isAdmin);
  }

  findAll(
    query: {
      onlyActive?: boolean;
      parentId?: string | null;
      search?: string;
    },
    isAdmin: boolean = false,
  ) {
    return this.listCategoriesService.execute(query, isAdmin);
  }

  getTree(isAdmin: boolean = false) {
    return this.getCategoryTreeService.execute(isAdmin);
  }

  uploadPhoto(id: string, file: Express.Multer.File) {
    return this.uploadPhotoService.execute(id, file);
  }

  deletePhoto(id: string, photoUrl: string) {
    return this.deletePhotoService.execute(id, photoUrl);
  }
}
