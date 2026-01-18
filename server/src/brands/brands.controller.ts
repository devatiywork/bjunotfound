import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../admin/decorators/roles.decorator';
import { RolesGuard } from '../admin/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { imageUploadOptions } from '../file-upload/multer.config';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { MergeBrandsDto } from './dto/merge-brands.dto';
import { RejectBrandDto } from './dto/reject-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Бренды')
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  // Получить все бренды
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить все бренды',
    description:
      'Для обычных пользователей - одобренные бренды + свои неодобренные. Для администраторов - все бренды.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список брендов успешно получен',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  async listBrands(@Request() req) {
    const isAdmin = req.user?.roleId === 'admin';
    const userId = req.user?.userId;
    return this.brandsService.listBrands(isAdmin, userId);
  }

  // Получить бренды на модерации (только админ)
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить бренды на модерации (админ)',
    description:
      'Список брендов, ожидающих одобрения, с информацией о потенциальных дубликатах.',
  })
  @ApiResponse({
    status: 200,
    description: 'Список брендов на модерации успешно получен',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  async listPendingBrands() {
    return this.brandsService.listPendingBrands();
  }

  // Получить группы похожих брендов для модерации (только админ)
  @Get('similar-groups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить группы похожих брендов (админ)',
    description:
      'Группирует похожие бренды для удобного объединения. Каждая группа содержит бренды, которые можно объединить в один.',
  })
  @ApiResponse({
    status: 200,
    description: 'Группы брендов успешно получены',
    schema: {
      example: [
        {
          groupId: 'group-uuid',
          hasApproved: false,
          totalProducts: 5,
          brands: [
            {
              id: 'uuid-1',
              name: 'Данон',
              status: 'pending',
              productsCount: 3,
            },
            {
              id: 'uuid-2',
              name: 'Danone',
              status: 'pending',
              productsCount: 2,
            },
          ],
        },
      ],
    },
  })
  async listBrandGroups() {
    return this.brandsService.listBrandGroups();
  }

  // Получить мои бренды
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить мои бренды',
    description:
      'Все бренды, созданные текущим пользователем (одобренные, на модерации, отклоненные)',
  })
  @ApiResponse({
    status: 200,
    description: 'Список брендов успешно получен',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  async listMyBrands(@Request() req) {
    return this.brandsService.listMyBrands(req.user.userId);
  }

  // Получить бренд по ID
  @Get(':id')
  @ApiOperation({
    summary: 'Получить бренд по ID',
    description:
      'Администратор видит любые бренды. Создатель видит свои бренды. Остальные видят только одобренные.',
  })
  @ApiResponse({
    status: 200,
    description: 'Бренд успешно получен',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async getBrand(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user?.roleId === 'admin';
    const userId = req.user?.userId;
    return this.brandsService.getBrand(id, isAdmin, userId);
  }

  // Создать бренд
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать бренд',
    description:
      'Администратор создает сразу одобренный бренд. Обычный пользователь создает бренд, который требует модерации.',
  })
  @ApiResponse({
    status: 201,
    description: 'Бренд успешно создан',
  })
  @ApiResponse({
    status: 400,
    description:
      'Некорректные данные или бренд с таким названием уже существует',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  async createBrand(@Body() dto: CreateBrandDto, @Request() req) {
    const isAdmin = req.user.roleId === 'admin';
    return this.brandsService.createBrand(dto, req.user.userId, isAdmin);
  }

  // Обновить бренд (только админ)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить бренд (админ)',
    description: 'Изменить данные бренда. Доступно только администраторам.',
  })
  @ApiResponse({
    status: 200,
    description: 'Бренд успешно обновлен',
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async updateBrand(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandsService.updateBrand(id, dto);
  }

  // Удалить бренд (только админ)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить бренд (админ)',
    description:
      'Удалить бренд. Невозможно удалить, если бренд используется в продуктах. Доступно только администраторам.',
  })
  @ApiResponse({
    status: 200,
    description: 'Бренд успешно удален',
  })
  @ApiResponse({
    status: 400,
    description: 'Бренд используется в продуктах',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async deleteBrand(@Param('id') id: string) {
    return this.brandsService.deleteBrand(id);
  }

  // Одобрить бренд (только админ)
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Одобрить бренд (админ)',
    description:
      'Одобрить бренд, созданный пользователем. Доступно только администраторам.',
  })
  @ApiResponse({
    status: 200,
    description: 'Бренд успешно одобрен',
  })
  @ApiResponse({
    status: 400,
    description: 'Бренд уже одобрен',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async approveBrand(@Param('id') id: string, @Request() req) {
    return this.brandsService.approveBrand(id, req.user.userId);
  }

  // Отклонить бренд (только админ)
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Отклонить бренд (админ)',
    description:
      'Отклонить бренд с указанием причины. Доступно только администраторам.',
  })
  @ApiResponse({
    status: 200,
    description: 'Бренд успешно отклонен',
  })
  @ApiResponse({
    status: 400,
    description: 'Невозможно отклонить одобренный бренд',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async rejectBrand(@Param('id') id: string, @Body() dto: RejectBrandDto) {
    return this.brandsService.rejectBrand(id, dto);
  }

  // Объединить бренды (только админ)
  @Post('merge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Объединить бренды (админ)',
    description: `Объединяет несколько похожих брендов в один:
1. Одобряет выбранный целевой бренд (targetBrandId)
2. Переносит все продукты с других брендов на целевой
3. Отклоняет остальные бренды с причиной "Объединён с..."

Используйте GET /brands/groups для получения групп похожих брендов.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Бренды успешно объединены',
    schema: {
      example: {
        approvedBrand: {
          id: 'uuid-1',
          name: 'Danone',
        },
        rejectedBrands: [
          {
            id: 'uuid-2',
            name: 'Данон',
            productsUserMigrated: 3,
            productsGlobalMigrated: 0,
          },
          {
            id: 'uuid-3',
            name: 'Danon',
            productsUserMigrated: 2,
            productsGlobalMigrated: 1,
          },
        ],
        totalProductsMigrated: 6,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или целевой бренд отклонён',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  @ApiResponse({
    status: 404,
    description: 'Один или несколько брендов не найдены',
  })
  async mergeBrands(@Body() dto: MergeBrandsDto, @Request() req) {
    return this.brandsService.mergeBrands(dto, req.user.userId);
  }

  // Загрузить фото (админ или создатель)
  @Post(':id/photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Загрузить фото бренда',
    description:
      'Загрузить фото бренда. Доступно администратору или создателю бренда.',
  })
  @ApiResponse({
    status: 200,
    description: 'Фото успешно загружено',
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка при загрузке фото',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async uploadBrandPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const isAdmin = req.user.roleId === 'admin';
    return this.brandsService.uploadBrandPhoto(
      id,
      file,
      req.user.userId,
      isAdmin,
    );
  }

  // Удалить фото (только админ)
  @Delete(':id/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить фото бренда (админ)',
    description: 'Удалить фото бренда. Доступно только администраторам.',
  })
  @ApiResponse({
    status: 200,
    description: 'Фото успешно удалено',
  })
  @ApiResponse({
    status: 400,
    description: 'Фото не найдено',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (только для администраторов)',
  })
  @ApiResponse({
    status: 404,
    description: 'Бренд не найден',
  })
  async deleteBrandPhoto(
    @Param('id') id: string,
    @Body('photoUrl') photoUrl: string,
  ) {
    return this.brandsService.deleteBrandPhoto(id, photoUrl);
  }
}
