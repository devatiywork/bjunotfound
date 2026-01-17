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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ChangeStatusDto,
  CreateMealEventDto,
  GetEventsPeriodDto,
  UpdateMealEventDto,
} from './dto';
import { MealEventsService } from './meal-events.service';
import {
  MealEventsSwaggerDocs,
  MealEventsSwaggerResponses,
} from './swagger/meal-events.swagger';

@ApiTags('События питания')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('meal-events')
export class MealEventsController {
  constructor(private readonly mealEventsService: MealEventsService) {}

  @ApiOperation(MealEventsSwaggerDocs.create)
  @ApiResponse(MealEventsSwaggerResponses.eventCreated)
  @ApiResponse(MealEventsSwaggerResponses.badRequest)
  @ApiResponse(MealEventsSwaggerResponses.notFound)
  @ApiResponse(MealEventsSwaggerResponses.unauthorized)
  @Post()
  create(@Request() req, @Body() dto: CreateMealEventDto) {
    return this.mealEventsService.create(req.user.userId, dto);
  }

  @ApiOperation(MealEventsSwaggerDocs.getByPeriod)
  @ApiResponse(MealEventsSwaggerResponses.eventsList)
  @ApiResponse(MealEventsSwaggerResponses.badRequest)
  @ApiResponse(MealEventsSwaggerResponses.unauthorized)
  @ApiQuery({ name: 'startDate', required: true, example: '2026-01-20' })
  @ApiQuery({ name: 'endDate', required: true, example: '2026-01-27' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PLANNED', 'COMPLETED', 'SKIPPED'],
  })
  @ApiQuery({ name: 'mealTypeId', required: false })
  @Get('period')
  getByPeriod(@Request() req, @Query() dto: GetEventsPeriodDto) {
    return this.mealEventsService.getByPeriod(req.user.userId, dto);
  }

  @ApiOperation(MealEventsSwaggerDocs.getById)
  @ApiResponse(MealEventsSwaggerResponses.eventDetails)
  @ApiResponse(MealEventsSwaggerResponses.notFound)
  @ApiResponse(MealEventsSwaggerResponses.forbidden)
  @ApiResponse(MealEventsSwaggerResponses.unauthorized)
  @Get(':id')
  getById(@Request() req, @Param('id') id: string) {
    return this.mealEventsService.getById(req.user.userId, id);
  }

  @ApiOperation(MealEventsSwaggerDocs.update)
  @ApiResponse(MealEventsSwaggerResponses.eventUpdated)
  @ApiResponse(MealEventsSwaggerResponses.notFound)
  @ApiResponse(MealEventsSwaggerResponses.forbidden)
  @ApiResponse(MealEventsSwaggerResponses.badRequest)
  @ApiResponse(MealEventsSwaggerResponses.unauthorized)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMealEventDto,
  ) {
    return this.mealEventsService.update(req.user.userId, id, dto);
  }

  @ApiOperation(MealEventsSwaggerDocs.changeStatus)
  @ApiResponse(MealEventsSwaggerResponses.statusChanged)
  @ApiResponse(MealEventsSwaggerResponses.notFound)
  @ApiResponse(MealEventsSwaggerResponses.forbidden)
  @ApiResponse(MealEventsSwaggerResponses.badRequest)
  @ApiResponse(MealEventsSwaggerResponses.unauthorized)
  @Patch(':id/status')
  changeStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.mealEventsService.changeStatus(req.user.userId, id, dto);
  }

  @ApiOperation(MealEventsSwaggerDocs.archive)
  @ApiResponse(MealEventsSwaggerResponses.eventArchived)
  @ApiResponse(MealEventsSwaggerResponses.notFound)
  @ApiResponse(MealEventsSwaggerResponses.forbidden)
  @ApiResponse(MealEventsSwaggerResponses.unauthorized)
  @Delete(':id')
  archive(@Request() req, @Param('id') id: string) {
    return this.mealEventsService.archive(req.user.userId, id);
  }
}
