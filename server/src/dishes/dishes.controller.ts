import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../file-upload/cloudinary.service';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { FilterDishesDto } from './dto/filter-dishes.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import {
  DishesSwaggerDocs,
  DishesSwaggerResponses,
} from './swagger/dishes.swagger';

@ApiTags('Блюда')
@Controller('dishes')
export class DishesController {
  constructor(
    private readonly dishesService: DishesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.create)
  @ApiResponse(DishesSwaggerResponses.dishCreated)
  @ApiResponse(DishesSwaggerResponses.badRequest)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  async create(@Body() createDishDto: CreateDishDto, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.dishesService.create(createDishDto, userId, isAdmin);
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.uploadPhoto)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPG, PNG, WebP, макс 5MB)',
        },
      },
    },
  })
  @ApiResponse(DishesSwaggerResponses.photoUploaded)
  @ApiResponse(DishesSwaggerResponses.badRequest)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file);
    return { url: result.url };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.findAll)
  @ApiResponse(DishesSwaggerResponses.dishesList)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  async findAll(@Query() filters: FilterDishesDto, @Request() req) {
    const userId = req.user.userId;
    return this.dishesService.findAll(filters, userId);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.getFavorites)
  @ApiResponse(DishesSwaggerResponses.favoritesList)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  async getFavorites(@Request() req) {
    const userId = req.user.userId;
    return this.dishesService.getFavorites(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.findOne)
  @ApiResponse(DishesSwaggerResponses.dishFound)
  @ApiResponse(DishesSwaggerResponses.notFound)
  @ApiResponse(DishesSwaggerResponses.forbidden)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.dishesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.update)
  @ApiResponse(DishesSwaggerResponses.dishUpdated)
  @ApiResponse(DishesSwaggerResponses.badRequest)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  @ApiResponse(DishesSwaggerResponses.forbidden)
  @ApiResponse(DishesSwaggerResponses.notFound)
  async update(
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.dishesService.update(id, updateDishDto, userId, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.remove)
  @ApiResponse(DishesSwaggerResponses.dishDeleted)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  @ApiResponse(DishesSwaggerResponses.forbidden)
  @ApiResponse(DishesSwaggerResponses.notFound)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.dishesService.remove(id, userId, isAdmin);
  }

  @Post(':id/recalculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.recalculate)
  @ApiResponse(DishesSwaggerResponses.dishRecalculated)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  @ApiResponse(DishesSwaggerResponses.forbidden)
  @ApiResponse(DishesSwaggerResponses.notFound)
  async recalculate(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.dishesService.recalculate(id, userId, isAdmin);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.addToFavorites)
  @ApiResponse(DishesSwaggerResponses.addedToFavorites)
  @ApiResponse(DishesSwaggerResponses.badRequest)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  @ApiResponse(DishesSwaggerResponses.notFound)
  @ApiResponse(DishesSwaggerResponses.forbidden)
  async addToFavorites(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.dishesService.addToFavorites(id, userId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation(DishesSwaggerDocs.removeFromFavorites)
  @ApiResponse(DishesSwaggerResponses.removedFromFavorites)
  @ApiResponse(DishesSwaggerResponses.unauthorized)
  @ApiResponse(DishesSwaggerResponses.notFound)
  async removeFromFavorites(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.dishesService.removeFromFavorites(id, userId);
  }
}
