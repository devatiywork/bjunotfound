import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateMealTypeDto } from '../../dto';

@Injectable()
export class UpdateMealTypeService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, mealTypeId: string, dto: UpdateMealTypeDto) {
    // Проверяем существование типа
    const mealType = await this.prisma.mealType.findUnique({
      where: { id: mealTypeId },
    });

    if (!mealType) {
      throw new NotFoundException('Тип приема пищи не найден');
    }

    // Системные типы (userId = null) нельзя редактировать
    if (mealType.userId === null) {
      throw new ForbiddenException(
        'Нельзя редактировать системные типы приемов пищи',
      );
    }

    // Проверяем владельца
    if (mealType.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому типу приема пищи');
    }

    // Обновляем тип
    return this.prisma.mealType.update({
      where: { id: mealTypeId },
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        updatedAt: new Date(),
      },
    });
  }
}
