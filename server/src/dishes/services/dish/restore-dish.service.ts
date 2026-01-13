import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Сервис для восстановления блюда из архива
 */
@Injectable()
export class RestoreDishService {
  constructor(private prisma: PrismaService) {}

  /**
   * Восстанавливает блюдо из архива (isArchived = false)
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @returns Восстановленное блюдо
   */
  async execute(userId: string, dishId: string) {
    // Проверяем существование и владельца
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    if (dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Проверяем, что блюдо было архивировано
    if (!dish.isArchived) {
      throw new BadRequestException('Блюдо не находится в архиве');
    }

    // Восстанавливаем
    return this.prisma.dish.update({
      where: { id: dishId },
      data: { isArchived: false },
    });
  }
}
