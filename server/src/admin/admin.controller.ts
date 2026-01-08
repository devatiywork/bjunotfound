import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/users
   * Получить список всех пользователей с пагинацией
   */
  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;

    return this.adminService.getAllUsers(pageNum, limitNum);
  }

  /**
   * GET /admin/users/stats
   * Получить статистику по пользователям
   */
  @Get('users/stats')
  async getUsersStats() {
    return this.adminService.getUsersStats();
  }

  /**
   * GET /admin/users/:id
   * Получить детальную информацию о пользователе
   */
  @Get('users/:id')
  async getUserById(@Param('id') userId: string) {
    return this.adminService.getUserById(userId);
  }

  /**
   * PATCH /admin/users/:id/role
   * Изменить роль пользователя
   */
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, updateUserRoleDto);
  }

  /**
   * PATCH /admin/users/:id
   * Обновить данные пользователя
   */
  @Patch('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, updateUserDto);
  }

  /**
   * DELETE /admin/users/:id
   * Удалить пользователя
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  /**
   * GET /admin/roles
   * Получить список всех ролей
   */
  @Get('roles')
  async getAllRoles() {
    return this.adminService.getAllRoles();
  }

  /**
   * POST /admin/roles
   * Создать новую роль
   */
  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminService.createRole(createRoleDto);
  }
}
