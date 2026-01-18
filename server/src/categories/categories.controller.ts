import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../admin/decorators/roles.decorator';
import { RolesGuard } from '../admin/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { imageUploadOptions } from '../file-upload/multer.config';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoriesSwaggerDocs,
  CategoriesSwaggerResponses,
} from './swagger/categories.swagger';

@ApiTags('Категории')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation(CategoriesSwaggerDocs.list)
  @ApiResponse(CategoriesSwaggerResponses.list)
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description:
      'Показать только активные категории (по умолчанию true для пользователей, false для админов)',
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: String,
    description:
      'Фильтр по родителю (null для корневых категорий, пустая строка не применяет фильтр)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поиск по названию категории',
  })
  @Get()
  async findAll(
    @Query('onlyActive') onlyActive?: string,
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
    @Request() req?: any,
  ) {
    const isAdmin = req?.user?.roleId === 'admin';

    return this.categoriesService.findAll(
      {
        onlyActive:
          onlyActive === 'false'
            ? false
            : onlyActive === 'true'
              ? true
              : undefined,
        parentId: parentId === 'null' ? null : parentId || undefined,
        search,
      },
      isAdmin,
    );
  }

  @ApiOperation(CategoriesSwaggerDocs.tree)
  @ApiResponse(CategoriesSwaggerResponses.tree)
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description:
      'Показать только активные категории (по умолчанию true для пользователей, false для админов)',
  })
  @Get('tree')
  async getTree(
    @Query('onlyActive') onlyActive?: string,
    @Request() req?: any,
  ) {
    const isAdmin = req?.user?.roleId === 'admin';

    // Если явно указан параметр, используем его
    // onlyActive=false → показываем все (isAdmin=true в сервисе)
    // onlyActive=true → показываем только активные (isAdmin=false)
    // не указан → админ видит все, пользователи - только активные
    const showAllCategories =
      onlyActive === 'false' ? true : onlyActive === 'true' ? false : isAdmin;

    return this.categoriesService.getTree(showAllCategories);
  }

  @ApiOperation(CategoriesSwaggerDocs.findById)
  @ApiResponse(CategoriesSwaggerResponses.category)
  @ApiResponse(CategoriesSwaggerResponses.notFound)
  @ApiParam({ name: 'id', description: 'ID категории' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req?: any) {
    const isAdmin = req?.user?.roleId === 'admin';
    return this.categoriesService.findOne(id, isAdmin);
  }

  @ApiOperation(CategoriesSwaggerDocs.findBySlug)
  @ApiResponse(CategoriesSwaggerResponses.category)
  @ApiResponse(CategoriesSwaggerResponses.notFound)
  @ApiParam({ name: 'slug', description: 'Slug категории' })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @Request() req?: any) {
    const isAdmin = req?.user?.roleId === 'admin';
    return this.categoriesService.findBySlug(slug, isAdmin);
  }

  @ApiOperation(CategoriesSwaggerDocs.create)
  @ApiResponse(CategoriesSwaggerResponses.created)
  @ApiResponse(CategoriesSwaggerResponses.badRequest)
  @ApiResponse(CategoriesSwaggerResponses.unauthorized)
  @ApiResponse(CategoriesSwaggerResponses.forbidden)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiOperation(CategoriesSwaggerDocs.update)
  @ApiResponse(CategoriesSwaggerResponses.category)
  @ApiResponse(CategoriesSwaggerResponses.badRequest)
  @ApiResponse(CategoriesSwaggerResponses.notFound)
  @ApiResponse(CategoriesSwaggerResponses.unauthorized)
  @ApiResponse(CategoriesSwaggerResponses.forbidden)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID категории' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiOperation(CategoriesSwaggerDocs.delete)
  @ApiResponse(CategoriesSwaggerResponses.deleted)
  @ApiResponse(CategoriesSwaggerResponses.badRequest)
  @ApiResponse(CategoriesSwaggerResponses.notFound)
  @ApiResponse(CategoriesSwaggerResponses.unauthorized)
  @ApiResponse(CategoriesSwaggerResponses.forbidden)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID категории' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }

  @ApiOperation(CategoriesSwaggerDocs.uploadPhoto)
  @ApiResponse(CategoriesSwaggerResponses.photoUploaded)
  @ApiResponse(CategoriesSwaggerResponses.badRequest)
  @ApiResponse(CategoriesSwaggerResponses.notFound)
  @ApiResponse(CategoriesSwaggerResponses.unauthorized)
  @ApiResponse(CategoriesSwaggerResponses.forbidden)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID категории' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @Post(':id/photo')
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.uploadPhoto(id, file);
  }

  @ApiOperation(CategoriesSwaggerDocs.deletePhoto)
  @ApiResponse(CategoriesSwaggerResponses.photoDeleted)
  @ApiResponse(CategoriesSwaggerResponses.notFound)
  @ApiResponse(CategoriesSwaggerResponses.unauthorized)
  @ApiResponse(CategoriesSwaggerResponses.forbidden)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID категории' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photoUrl: {
          type: 'string',
          example: 'https://cloudinary.com/categories/photo123.jpg',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id/photo')
  deletePhoto(@Param('id') id: string, @Body('photoUrl') photoUrl: string) {
    return this.categoriesService.deletePhoto(id, photoUrl);
  }
}
