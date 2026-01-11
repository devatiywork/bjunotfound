import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить список всех пользователей
   */
  async getAllUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          roleId: true,
          gender: true,
          birthDate: true,
          height: true,
          formulaType: true,
          activityLevelId: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          activityLevel: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              weights: true,
              goals: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить конкретного пользователя по ID
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        roleId: true,
        gender: true,
        birthDate: true,
        height: true,
        formulaType: true,
        activityLevelId: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        activityLevel: {
          select: {
            id: true,
            name: true,
            description: true,
            coefficient: true,
          },
        },
        weights: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        goals: {
          orderBy: { startDate: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            weights: true,
            goals: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  /**
   * Изменить роль пользователя
   */
  async updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto) {
    // Проверяем существование роли
    const role = await this.prisma.userRole.findUnique({
      where: { id: updateUserRoleDto.roleId },
    });

    if (!role) {
      throw new BadRequestException(
        `Роль "${updateUserRoleDto.roleId}" не найдена`,
      );
    }

    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Обновляем роль
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId: updateUserRoleDto.roleId },
      select: {
        id: true,
        email: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedUser;
  }

  /**
   * Обновить данные пользователя
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Если указан activityLevelId, проверяем его существование
    if (updateUserDto.activityLevelId) {
      const activityLevel = await this.prisma.activityLevel.findUnique({
        where: { id: updateUserDto.activityLevelId },
      });

      if (!activityLevel) {
        throw new BadRequestException(
          `Уровень активности "${updateUserDto.activityLevelId}" не найден`,
        );
      }
    }

    const updateData: any = { ...updateUserDto };
    if (updateUserDto.birthDate) {
      updateData.birthDate = new Date(updateUserDto.birthDate);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        roleId: true,
        gender: true,
        birthDate: true,
        height: true,
        formulaType: true,
        activityLevelId: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Prisma автоматически удалит связанные данные благодаря onDelete: Cascade
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      message: 'Пользователь успешно удален',
      userId,
    };
  }

  /**
   * Получить статистику по пользователям
   */
  async getUsersStats() {
    const [totalUsers, usersByRole, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['roleId'],
        _count: true,
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          roleId: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalUsers,
      usersByRole,
      recentUsers,
    };
  }

  /**
   * Получить список всех ролей
   */
  async getAllRoles() {
    return this.prisma.userRole.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  /**
   * Создать новую роль
   */
  async createRole(createRoleDto: CreateRoleDto) {
    // Проверяем, не существует ли роль с таким ID
    const existingRole = await this.prisma.userRole.findUnique({
      where: { id: createRoleDto.id },
    });

    if (existingRole) {
      throw new ConflictException(
        `Роль с ID "${createRoleDto.id}" уже существует`,
      );
    }

    // Создаем новую роль
    const role = await this.prisma.userRole.create({
      data: {
        id: createRoleDto.id,
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return role;
  }
}
