import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../file-upload/multer.config';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AddPackageDto,
  AddServingDto,
  CreateProductUserDto,
  UpdatePackageDto,
  UpdateProductUserDto,
  UpdateServingDto,
} from './dto/index';
import { ProductsUserService } from './products-user.service';

@Controller('products-user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsUserController {
  constructor(private productsUserService: ProductsUserService) {}

  // ==================== Product endpoints ====================

  @Get()
  @Roles('admin')
  async listProducts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.productsUserService.listProducts(
      page,
      limit,
      categoryId,
      brandId,
      userId,
    );
  }

  @Get('my')
  async listMyProducts(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
  ) {
    return this.productsUserService.listMyProducts(
      req.user.userId,
      page,
      limit,
      categoryId,
      brandId,
    );
  }

  @Get('my/search')
  async searchProducts(@Request() req, @Query('query') query: string) {
    return this.productsUserService.searchProducts(req.user.userId, query);
  }

  @Get(':id')
  async getProduct(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.getProduct(id, req.user.userId, isAdmin);
  }

  @Post()
  async createProduct(@Request() req, @Body() dto: CreateProductUserDto) {
    return this.productsUserService.createProduct(req.user.userId, dto);
  }

  @Patch(':id')
  async updateProduct(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateProductUserDto,
  ) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.updateProduct(
      id,
      req.user.userId,
      isAdmin,
      dto,
    );
  }

  @Delete(':id')
  async deleteProduct(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.deleteProduct(id, req.user.userId, isAdmin);
  }

  // ==================== Photo endpoints ====================

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  async uploadPhoto(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.uploadPhoto(
      id,
      req.user.userId,
      isAdmin,
      file,
    );
  }

  @Delete(':id/photos')
  async deletePhoto(
    @Request() req,
    @Param('id') id: string,
    @Query('photoUrl') photoUrl: string,
  ) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.deletePhoto(
      id,
      req.user.userId,
      isAdmin,
      photoUrl,
    );
  }

  // ==================== Package endpoints ====================

  @Get(':id/packages')
  async listPackages(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.listPackages(id, req.user.userId, isAdmin);
  }

  @Post(':id/packages')
  async addPackage(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddPackageDto,
  ) {
    return this.productsUserService.addPackage(id, req.user.userId, dto);
  }

  @Patch(':id/packages/:packageId')
  async updatePackage(
    @Request() req,
    @Param('id') id: string,
    @Param('packageId') packageId: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.productsUserService.updatePackage(
      id,
      packageId,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id/packages/:packageId')
  async deletePackage(
    @Request() req,
    @Param('id') id: string,
    @Param('packageId') packageId: string,
  ) {
    return this.productsUserService.deletePackage(
      id,
      packageId,
      req.user.userId,
    );
  }

  // ==================== Serving endpoints ====================

  @Get(':id/servings')
  async listServings(@Request() req, @Param('id') id: string) {
    const isAdmin = req.user.roleId === 'admin';
    return this.productsUserService.listServings(id, req.user.userId, isAdmin);
  }

  @Post(':id/servings')
  async addServing(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddServingDto,
  ) {
    return this.productsUserService.addServing(id, req.user.userId, dto);
  }

  @Patch(':id/servings/:servingId')
  async updateServing(
    @Request() req,
    @Param('id') id: string,
    @Param('servingId') servingId: string,
    @Body() dto: UpdateServingDto,
  ) {
    return this.productsUserService.updateServing(
      id,
      servingId,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id/servings/:servingId')
  async deleteServing(
    @Request() req,
    @Param('id') id: string,
    @Param('servingId') servingId: string,
  ) {
    return this.productsUserService.deleteServing(
      id,
      servingId,
      req.user.userId,
    );
  }
}
