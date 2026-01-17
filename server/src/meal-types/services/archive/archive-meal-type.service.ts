import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ArchiveMealTypeService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, mealTypeId: string) {
    // Проверяем существование типа
    const mealType = await this.prisma.mealType.findUnique({
      where: { id: mealTypeId },
    });

    if (!mealType) {
      throw new NotFoundException('Тип приема пищи не найден');
    }

    // Системные типы (userId = null) нельзя архивировать
    if (mealType.userId === null) {
      throw new ForbiddenException(
        'Нельзя архивировать системные типы приемов пищи',
      );
    }

    // Проверяем владельца
    if (mealType.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому типу приема пищи');
    }

    // Архивируем (мягкое удаление)
    return this.prisma.mealType.update({
      where: { id: mealTypeId },
      data: {
        isArchived: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }
}
