import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GetProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение профиля пользователя
   */
  async execute(userId: string) {
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
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
}
