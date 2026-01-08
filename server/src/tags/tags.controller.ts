import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../admin/decorators/roles.decorator';
import { RolesGuard } from '../admin/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TagsService } from './tags.service';

@ApiTags('Теги')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({
    summary: 'Создать тег',
    description:
      'Создание нового тега для продуктов. Только для администраторов.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() data: { name: string }) {
    return this.tagsService.create(data);
  }

  @ApiOperation({
    summary: 'Получить список тегов',
    description: 'Возвращает все теги с количеством продуктов в каждом',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @ApiOperation({
    summary: 'Получить тег по ID',
    description: 'Возвращает детальную информацию о теге',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'ID тега' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Обновить тег',
    description: 'Обновление данных тега. Только для администраторов.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string }) {
    return this.tagsService.update(id, data);
  }

  @ApiOperation({
    summary: 'Удалить тег',
    description:
      'Удаление тега. Нельзя удалить, если к нему привязаны продукты. Только для администраторов.',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
