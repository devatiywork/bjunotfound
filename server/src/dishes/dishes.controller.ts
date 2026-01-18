import {
  BadRequestException,
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
import { DishStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../file-upload/cloudinary.service';
import { imageUploadOptions } from '../file-upload/multer.config';
import { DishesService } from './dishes.service';
import { AddDishItemDto } from './dto/add-dish-item.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { ReorderDishItemsDto } from './dto/reorder-dish-items.dto';
import { UpdateDishItemDto } from './dto/update-dish-item.dto';
import { UpdateDishStatusDto } from './dto/update-dish-status.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@ApiTags('Блюда')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dishes')
export class DishesController {
  constructor(
    private readonly dishesService: DishesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ============= CRUD Блюд =============

  @Post()
  @ApiOperation({
    summary: 'Создать блюдо',
    description: 'Создает новое блюдо со статусом DRAFT',
  })
  @ApiResponse({ status: 201, description: 'Блюдо успешно создано' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async createDish(@Request() req, @Body() dto: CreateDishDto) {
    return this.dishesService.createDish(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список блюд',
    description: 'Возвращает список блюд пользователя с пагинацией',
  })
  @ApiQuery({
    name: 'status',
    enum: DishStatus,
    required: false,
    description: 'Фильтр по статусу',
  })
  @ApiQuery({
    name: 'isArchived',
    type: Boolean,
    required: false,
    description: 'Показать только архивированные',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Номер страницы (начиная с 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Количество на странице',
  })
  @ApiResponse({ status: 200, description: 'Список блюд успешно получен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getUserDishes(
    @Request() req,
    @Query('status') status?: DishStatus,
    @Query('isArchived') isArchived?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.dishesService.getUserDishes(req.user.userId, {
      status,
      isArchived,
      page,
      limit,
    });
  }

  @Get('archived')
  @ApiOperation({
    summary: 'Получить архивированные блюда',
    description: 'Возвращает только архивированные блюда',
  })
  @ApiResponse({
    status: 200,
    description: 'Архивированные блюда успешно получены',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getArchivedDishes(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.dishesService.getUserDishes(req.user.userId, {
      isArchived: true,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить блюдо',
    description: 'Возвращает блюдо с ингредиентами и расчетами КБЖУ/цены',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({ status: 200, description: 'Блюдо успешно получено' })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getDish(@Request() req, @Param('id') id: string) {
    return this.dishesService.getDish(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить блюдо',
    description: 'Обновляет данные блюда',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({ status: 200, description: 'Блюдо успешно обновлено' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateDish(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDishDto,
  ) {
    return this.dishesService.updateDish(req.user.userId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Изменить статус блюда',
    description: 'Изменяет статус блюда (DRAFT ↔ READY)',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({ status: 200, description: 'Статус успешно изменен' })
  @ApiResponse({
    status: 400,
    description: 'Невозможно изменить статус (есть критичные ошибки)',
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateDishStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDishStatusDto,
  ) {
    return this.dishesService.updateDishStatus(req.user.userId, id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить блюдо',
    description:
      'Если блюдо НЕ в архиве → перемещает в архив (мягкое удаление). Если УЖЕ в архиве → удаляет навсегда с фото',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({
    status: 200,
    description: 'Блюдо успешно архивировано или удалено навсегда',
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async archiveDish(@Request() req, @Param('id') id: string) {
    return this.dishesService.archiveDish(req.user.userId, id);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Восстановить блюдо',
    description: 'Восстанавливает блюдо из архива',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({ status: 200, description: 'Блюдо успешно восстановлено' })
  @ApiResponse({ status: 400, description: 'Блюдо не находится в архиве' })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async restoreDish(@Request() req, @Param('id') id: string) {
    return this.dishesService.restoreDish(req.user.userId, id);
  }

  // ============= Управление ингредиентами =============

  @Post(':id/items')
  @ApiOperation({
    summary: 'Добавить ингредиент',
    description: 'Добавляет ингредиент в блюдо',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({ status: 201, description: 'Ингредиент успешно добавлен' })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или порция не принадлежит продукту',
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду или продукту' })
  @ApiResponse({ status: 404, description: 'Блюдо или продукт не найдены' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async addDishItem(
    @Request() req,
    @Param('id') dishId: string,
    @Body() dto: AddDishItemDto,
  ) {
    return this.dishesService.addDishItem(req.user.userId, dishId, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({
    summary: 'Обновить ингредиент',
    description: 'Обновляет данные ингредиента блюда',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiParam({ name: 'itemId', description: 'ID ингредиента' })
  @ApiResponse({ status: 200, description: 'Ингредиент успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Ингредиент не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async updateDishItem(
    @Request() req,
    @Param('id') dishId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateDishItemDto,
  ) {
    return this.dishesService.updateDishItem(
      req.user.userId,
      dishId,
      itemId,
      dto,
    );
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({
    summary: 'Удалить ингредиент',
    description: 'Удаляет ингредиент из блюда',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiParam({ name: 'itemId', description: 'ID ингредиента' })
  @ApiResponse({ status: 200, description: 'Ингредиент успешно удален' })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Ингредиент не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async removeDishItem(
    @Request() req,
    @Param('id') dishId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.dishesService.removeDishItem(req.user.userId, dishId, itemId);
  }

  @Post(':id/items/reorder')
  @ApiOperation({
    summary: 'Изменить порядок ингредиентов',
    description: 'Изменяет порядок отображения ингредиентов',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiResponse({ status: 200, description: 'Порядок успешно изменен' })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или ингредиенты не принадлежат блюду',
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async reorderDishItems(
    @Request() req,
    @Param('id') dishId: string,
    @Body() dto: ReorderDishItemsDto,
  ) {
    return this.dishesService.reorderDishItems(req.user.userId, dishId, dto);
  }

  // ============= Photo Endpoints =============

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('photo', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Загрузить фото блюда',
    description:
      'Загружает фото блюда в Cloudinary и добавляет URL в массив photos',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPEG, PNG, WebP, макс 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Фото успешно загружено' })
  @ApiResponse({
    status: 400,
    description: 'Некорректный файл или формат не поддерживается',
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async uploadDishPhoto(
    @Request() req,
    @Param('id') dishId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Проверяем наличие файла
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    // Загружаем фото в Cloudinary
    const photoUrl = await this.cloudinaryService.uploadImage(
      file,
      'dishes', // папка в Cloudinary
    );

    // Добавляем URL в массив photos блюда
    return this.dishesService.addDishPhoto(req.user.userId, dishId, photoUrl);
  }

  @Delete(':id/photos')
  @ApiOperation({
    summary: 'Удалить фото блюда',
    description: 'Удаляет фото из Cloudinary и из массива photos блюда',
  })
  @ApiParam({ name: 'id', description: 'ID блюда' })
  @ApiQuery({ name: 'photoUrl', description: 'URL фото для удаления' })
  @ApiResponse({ status: 200, description: 'Фото успешно удалено' })
  @ApiResponse({ status: 403, description: 'Нет доступа к блюду' })
  @ApiResponse({ status: 404, description: 'Блюдо или фото не найдено' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async deleteDishPhoto(
    @Request() req,
    @Param('id') dishId: string,
    @Query('photoUrl') photoUrl: string,
  ) {
    // Удаляем из массива photos в БД
    await this.dishesService.removeDishPhoto(req.user.userId, dishId, photoUrl);

    // Удаляем файл из Cloudinary
    await this.cloudinaryService.deleteImage(photoUrl);

    return { message: 'Фото успешно удалено' };
  }
}
