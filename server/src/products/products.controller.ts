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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../admin/decorators/roles.decorator';
import { RolesGuard } from '../admin/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../file-upload/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import {
  ProductsSwaggerDocs,
  ProductsSwaggerResponses,
} from './swagger/products.swagger';

@ApiTags('Продукты')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Создать продукт (требует авторизации)
   */
  @ApiOperation(ProductsSwaggerDocs.create)
  @ApiResponse(ProductsSwaggerResponses.productCreated)
  @ApiResponse(ProductsSwaggerResponses.badRequest)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const userId = req.user.userId;
    const isAdmin = req.user.roleId === 'admin';

    return this.productsService.create(userId, createProductDto, isAdmin);
  }

  /**
   * Загрузить фото продукта в Cloudinary (требует авторизации)
   */
  @ApiOperation({
    summary: 'Загрузить фото продукта',
    description:
      'Загружает изображение в Cloudinary и возвращает URL. Поддерживаемые форматы: JPEG, PNG, WebP. Максимальный размер: 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл изображения',
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
  @ApiResponse({
    status: 200,
    description: 'Фото успешно загружено',
    schema: {
      example: {
        url: 'https://res.cloudinary.com/dvxl9xlts/image/upload/v1234567890/products/abc123.jpg',
        message: 'Фото успешно загружено',
      },
    },
  })
  @ApiResponse(ProductsSwaggerResponses.badRequest)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file);
    return {
      url: result.url,
      message: 'Фото успешно загружено',
    };
  }

  /**
   * Получить список продуктов (требует авторизации)
   */
  @ApiOperation(ProductsSwaggerDocs.findAll)
  @ApiResponse(ProductsSwaggerResponses.productList)
  @ApiResponse(ProductsSwaggerResponses.badRequest)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() filters: FilterProductsDto, @Request() req) {
    const userId = req.user.userId;
    return this.productsService.findAll(filters, userId);
  }

  /**
   * Получить статистику продуктов (только для админов)
   */
  @ApiOperation(ProductsSwaggerDocs.getStats)
  @ApiResponse(ProductsSwaggerResponses.stats)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiResponse(ProductsSwaggerResponses.forbidden)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('stats')
  async getStats() {
    return this.productsService.getStats();
  }

  /**
   * Найти продукт по штрих-коду (требует авторизации)
   */
  @ApiOperation(ProductsSwaggerDocs.findByBarcode)
  @ApiResponse(ProductsSwaggerResponses.product)
  @ApiResponse(ProductsSwaggerResponses.notFound)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'barcode',
    description: 'Штрих-код продукта (EAN-13/UPC)',
    example: '4607065597597',
  })
  @Get('barcode/:barcode')
  async findByBarcode(@Param('barcode') barcode: string, @Request() req) {
    const userId = req.user.userId;
    return this.productsService.findByBarcode(barcode, userId);
  }

  /**
   * Получить продукт по ID (требует авторизации)
   */
  @ApiOperation(ProductsSwaggerDocs.findOne)
  @ApiResponse(ProductsSwaggerResponses.product)
  @ApiResponse(ProductsSwaggerResponses.notFound)
  @ApiResponse(ProductsSwaggerResponses.forbidden)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'id',
    description: 'ID продукта',
    example: 'uuid',
  })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.productsService.findOne(id, userId);
  }

  /**
   * Обновить продукт (требует авторизации)
   */
  @ApiOperation(ProductsSwaggerDocs.update)
  @ApiResponse(ProductsSwaggerResponses.product)
  @ApiResponse(ProductsSwaggerResponses.badRequest)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiResponse(ProductsSwaggerResponses.forbidden)
  @ApiResponse(ProductsSwaggerResponses.notFound)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const userId = req.user.userId;
    const isAdmin = req.user.roleId === 'admin';

    return this.productsService.update(id, userId, updateProductDto, isAdmin);
  }

  /**
   * Удалить продукт (требует авторизации)
   */
  @ApiOperation(ProductsSwaggerDocs.remove)
  @ApiResponse(ProductsSwaggerResponses.productDeleted)
  @ApiResponse(ProductsSwaggerResponses.unauthorized)
  @ApiResponse(ProductsSwaggerResponses.forbidden)
  @ApiResponse(ProductsSwaggerResponses.notFound)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.roleId === 'admin';

    return this.productsService.remove(id, userId, isAdmin);
  }
}
