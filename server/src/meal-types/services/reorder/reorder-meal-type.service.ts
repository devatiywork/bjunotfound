import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReorderMealTypeDto } from '../../dto';

@Injectable()
export class ReorderMealTypeService {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, mealTypeId: string, dto: ReorderMealTypeDto) {
    // Проверяем существование типа
    const mealType = await this.prisma.mealType.findUnique({
      where: { id: mealTypeId },
    });

    if (!mealType) {
      throw new NotFoundException('Тип приема пищи не найден');
    }

    // Системные типы (userId = null) нельзя переупорядочивать
    if (mealType.userId === null) {
      throw new ForbiddenException(
        'Нельзя переупорядочивать системные типы приемов пищи',
      );
    }

    // Проверяем владельца
    if (mealType.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому типу приема пищи');
    }

    // Обновляем порядок
    return this.prisma.mealType.update({
      where: { id: mealTypeId },
      data: {
        sortOrder: dto.sortOrder,
        updatedAt: new Date(),
      },
    });
  }
}
