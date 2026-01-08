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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddWeightDto } from './dto/add-weight.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  UsersSwaggerDocs,
  UsersSwaggerResponses,
} from './swagger/users.swagger';
import { UsersService } from './users.service';

@ApiTags('Пользователи')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation(UsersSwaggerDocs.getProfile)
  @ApiResponse(UsersSwaggerResponses.profile)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.updateProfile)
  @ApiResponse(UsersSwaggerResponses.profile)
  @ApiResponse(UsersSwaggerResponses.badRequest)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @ApiOperation(UsersSwaggerDocs.addWeight)
  @ApiResponse(UsersSwaggerResponses.weightCreated)
  @ApiResponse(UsersSwaggerResponses.badRequest)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Post('weight')
  async addWeight(@Request() req, @Body() addWeightDto: AddWeightDto) {
    return this.usersService.addWeight(req.user.userId, addWeightDto);
  }

  @ApiOperation(UsersSwaggerDocs.getWeightHistory)
  @ApiResponse(UsersSwaggerResponses.weightHistory)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('weight')
  async getWeightHistory(@Request() req) {
    return this.usersService.getWeightHistory(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.getLatestWeight)
  @ApiResponse(UsersSwaggerResponses.weightLatest)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('weight/latest')
  async getLatestWeight(@Request() req) {
    return this.usersService.getLatestWeight(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.getWeightByPeriod)
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Дата начала периода (ISO 8601)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Дата окончания периода (ISO 8601)',
    example: '2024-12-31',
  })
  @ApiResponse(UsersSwaggerResponses.weightHistory)
  @ApiResponse(UsersSwaggerResponses.badRequest)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('weight/period')
  async getWeightByPeriod(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.usersService.getWeightByPeriod(
      req.user.userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @ApiOperation(UsersSwaggerDocs.getAvailablePeriod)
  @ApiResponse(UsersSwaggerResponses.availablePeriod)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('weight/available-period')
  async getAvailablePeriod(@Request() req) {
    return this.usersService.getAvailablePeriod(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.deleteWeight)
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'ID записи веса (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse(UsersSwaggerResponses.weightDeleted)
  @ApiResponse(UsersSwaggerResponses.notFound)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Delete('weight/:id')
  async deleteWeight(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteWeight(id, req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.setGoal)
  @ApiResponse(UsersSwaggerResponses.goalCreated)
  @ApiResponse(UsersSwaggerResponses.badRequest)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Post('goal')
  async setGoal(@Request() req, @Body() createGoalDto: CreateGoalDto) {
    return this.usersService.setGoal(req.user.userId, createGoalDto);
  }

  @ApiOperation(UsersSwaggerDocs.getGoal)
  @ApiResponse(UsersSwaggerResponses.goalActive)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('goal')
  async getGoal(@Request() req) {
    return this.usersService.getGoal(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.getGoalsHistory)
  @ApiResponse(UsersSwaggerResponses.goalsHistory)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Get('goal/history')
  async getGoalsHistory(@Request() req) {
    return this.usersService.getGoalsHistory(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.deactivateGoal)
  @ApiResponse(UsersSwaggerResponses.goalDeactivated)
  @ApiResponse(UsersSwaggerResponses.notFound)
  @ApiResponse(UsersSwaggerResponses.unauthorized)
  @Delete('goal')
  async deactivateGoal(@Request() req) {
    return this.usersService.deactivateGoal(req.user.userId);
  }

  @ApiOperation(UsersSwaggerDocs.getActivityLevels)
  @ApiResponse(UsersSwaggerResponses.activityLevels)
  @Get('activity-levels')
  async getActivityLevels() {
    return this.usersService.getActivityLevels();
  }
}
