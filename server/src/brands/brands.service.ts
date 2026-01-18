import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { MergeBrandsDto } from './dto/merge-brands.dto';
import { RejectBrandDto } from './dto/reject-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
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

@Injectable()
export class BrandsService {
  constructor(
    private createBrandService: CreateBrandService,
    private updateBrandService: UpdateBrandService,
    private deleteBrandService: DeleteBrandService,
    private getBrandService: GetBrandService,
    private listBrandsService: ListBrandsService,
    private listPendingBrandsService: ListPendingBrandsService,
    private listMyBrandsService: ListMyBrandsService,
    private listBrandGroupsService: ListBrandGroupsService,
    private approveBrandService: ApproveBrandService,
    private rejectBrandService: RejectBrandService,
    private mergeBrandsService: MergeBrandsService,
    private uploadBrandPhotoService: UploadBrandPhotoService,
    private deleteBrandPhotoService: DeleteBrandPhotoService,
  ) {}

  async createBrand(dto: CreateBrandDto, userId: string, isAdmin: boolean) {
    return this.createBrandService.execute(dto, userId, isAdmin);
  }

  async updateBrand(id: string, dto: UpdateBrandDto) {
    return this.updateBrandService.execute(id, dto);
  }

  async deleteBrand(id: string) {
    return this.deleteBrandService.execute(id);
  }

  async getBrand(id: string, isAdmin: boolean, userId?: string) {
    return this.getBrandService.execute(id, isAdmin, userId);
  }

  async listBrands(isAdmin: boolean, userId?: string) {
    return this.listBrandsService.execute(isAdmin, userId);
  }

  async listPendingBrands() {
    return this.listPendingBrandsService.execute();
  }

  async listBrandGroups() {
    return this.listBrandGroupsService.execute();
  }

  async listMyBrands(userId: string) {
    return this.listMyBrandsService.execute(userId);
  }

  async approveBrand(id: string, adminId: string) {
    return this.approveBrandService.execute(id, adminId);
  }

  async rejectBrand(id: string, dto: RejectBrandDto) {
    return this.rejectBrandService.execute(id, dto);
  }

  async mergeBrands(dto: MergeBrandsDto, adminId: string) {
    return this.mergeBrandsService.execute(
      dto.targetBrandId,
      dto.brandIdsToMerge,
      adminId,
    );
  }

  async uploadBrandPhoto(
    id: string,
    file: Express.Multer.File,
    userId: string,
    isAdmin: boolean,
  ) {
    return this.uploadBrandPhotoService.execute(id, file, userId, isAdmin);
  }

  async deleteBrandPhoto(id: string, photoUrl: string) {
    return this.deleteBrandPhotoService.execute(id, photoUrl);
  }
}
