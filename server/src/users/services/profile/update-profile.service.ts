import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateProfileDto } from '../../dto/update-profile.dto';

@Injectable()
export class UpdateProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Обновление профиля (email менять нельзя)
   */
  async execute(userId: string, updateProfileDto: UpdateProfileDto) {
    const updateData: any = {
      ...updateProfileDto,
    };

    // Преобразуем строку даты в DateTime для Prisma
    if (updateProfileDto.birthDate) {
      updateData.birthDate = new Date(updateProfileDto.birthDate);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        gender: true,
        birthDate: true,
        height: true,
        formulaType: true,
        activityLevelId: true,
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

    return user;
  }
}
