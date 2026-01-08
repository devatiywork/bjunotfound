import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
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
import { ActivitiesService } from './activities.service';
import { AddActivityDto } from './dto/add-activity.dto';
import { FilterActivitiesDto } from './dto/filter-activities.dto';
import { GetStatsDto } from './dto/get-stats.dto';
import {
  ActivitiesSwaggerDocs,
  ActivitiesSwaggerResponses,
} from './swagger/activities.swagger';

@ApiTags('Activities')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation(ActivitiesSwaggerDocs.addActivity)
  @ApiResponse(ActivitiesSwaggerResponses.activityCreated)
  @ApiResponse(ActivitiesSwaggerResponses.badRequest)
  @ApiResponse(ActivitiesSwaggerResponses.unauthorized)
  @ApiResponse(ActivitiesSwaggerResponses.noWeight)
  async addActivity(@Request() req, @Body() dto: AddActivityDto) {
    return this.activitiesService.addActivity(req.user.userId, dto);
  }

  @Get()
  @ApiOperation(ActivitiesSwaggerDocs.getActivities)
  @ApiResponse(ActivitiesSwaggerResponses.activitiesList)
  @ApiResponse(ActivitiesSwaggerResponses.unauthorized)
  async getActivities(@Request() req, @Query() dto: FilterActivitiesDto) {
    return this.activitiesService.getActivities(req.user.userId, dto);
  }

  @Get('today')
  @ApiOperation(ActivitiesSwaggerDocs.getToday)
  @ApiResponse(ActivitiesSwaggerResponses.todayActivity)
  @ApiResponse(ActivitiesSwaggerResponses.unauthorized)
  async getToday(@Request() req) {
    return this.activitiesService.getToday(req.user.userId);
  }

  @Get('stats')
  @ApiOperation(ActivitiesSwaggerDocs.getStats)
  @ApiResponse(ActivitiesSwaggerResponses.stats)
  @ApiResponse(ActivitiesSwaggerResponses.unauthorized)
  async getStats(@Request() req, @Query() dto: GetStatsDto) {
    return this.activitiesService.getStats(req.user.userId, dto.period);
  }

  @Get(':date')
  @ApiOperation(ActivitiesSwaggerDocs.getByDate)
  @ApiResponse(ActivitiesSwaggerResponses.todayActivity)
  @ApiResponse(ActivitiesSwaggerResponses.unauthorized)
  async getByDate(@Request() req, @Param('date') date: string) {
    return this.activitiesService.getByDate(req.user.userId, date);
  }

  @Delete(':activityId')
  @ApiOperation(ActivitiesSwaggerDocs.deleteActivity)
  @ApiResponse(ActivitiesSwaggerResponses.activityDeleted)
  @ApiResponse(ActivitiesSwaggerResponses.unauthorized)
  @ApiResponse(ActivitiesSwaggerResponses.notFound)
  async deleteActivity(
    @Request() req,
    @Param('activityId') activityId: string,
  ) {
    return this.activitiesService.deleteActivity(req.user.userId, activityId);
  }
}
