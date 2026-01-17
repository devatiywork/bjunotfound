import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateMealTypeDto,
  ReorderMealTypeDto,
  UpdateMealTypeDto,
} from './dto';
import { MealTypesService } from './meal-types.service';
import {
  MealTypesSwaggerDocs,
  MealTypesSwaggerResponses,
} from './swagger/meal-types.swagger';

@ApiTags('Типы приемов пищи')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('meal-types')
export class MealTypesController {
  constructor(private readonly mealTypesService: MealTypesService) {}

  @ApiOperation(MealTypesSwaggerDocs.create)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeCreated)
  @ApiResponse(MealTypesSwaggerResponses.badRequest)
  @ApiResponse(MealTypesSwaggerResponses.unauthorized)
  @Post()
  create(@Request() req, @Body() dto: CreateMealTypeDto) {
    return this.mealTypesService.create(req.user.userId, dto);
  }

  @ApiOperation(MealTypesSwaggerDocs.getAll)
  @ApiResponse(MealTypesSwaggerResponses.mealTypesList)
  @ApiResponse(MealTypesSwaggerResponses.unauthorized)
  @Get()
  getAll(@Request() req) {
    return this.mealTypesService.getAll(req.user.userId);
  }

  @ApiOperation(MealTypesSwaggerDocs.update)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeUpdated)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeNotFound)
  @ApiResponse(MealTypesSwaggerResponses.forbidden)
  @ApiResponse(MealTypesSwaggerResponses.badRequest)
  @ApiResponse(MealTypesSwaggerResponses.unauthorized)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMealTypeDto,
  ) {
    return this.mealTypesService.update(req.user.userId, id, dto);
  }

  @ApiOperation(MealTypesSwaggerDocs.archive)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeArchived)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeNotFound)
  @ApiResponse(MealTypesSwaggerResponses.forbidden)
  @ApiResponse(MealTypesSwaggerResponses.unauthorized)
  @Delete(':id')
  archive(@Request() req, @Param('id') id: string) {
    return this.mealTypesService.archive(req.user.userId, id);
  }

  @ApiOperation(MealTypesSwaggerDocs.reorder)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeUpdated)
  @ApiResponse(MealTypesSwaggerResponses.mealTypeNotFound)
  @ApiResponse(MealTypesSwaggerResponses.forbidden)
  @ApiResponse(MealTypesSwaggerResponses.badRequest)
  @ApiResponse(MealTypesSwaggerResponses.unauthorized)
  @Patch(':id/reorder')
  reorder(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ReorderMealTypeDto,
  ) {
    return this.mealTypesService.reorder(req.user.userId, id, dto);
  }
}
