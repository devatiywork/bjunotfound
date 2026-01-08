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
import { Roles } from '../admin/decorators/roles.decorator';
import { RolesGuard } from '../admin/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DishTagsService } from './dish-tags.service';
import { CreateDishTagDto } from './dto/create-dish-tag.dto';
import { UpdateDishTagDto } from './dto/update-dish-tag.dto';

@Controller('dish-tags')
export class DishTagsController {
  constructor(private readonly dishTagsService: DishTagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createDishTagDto: CreateDishTagDto) {
    return this.dishTagsService.create(createDishTagDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.dishTagsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dishTagsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateDishTagDto: UpdateDishTagDto,
  ) {
    return this.dishTagsService.update(id, updateDishTagDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.dishTagsService.remove(id);
  }
}
