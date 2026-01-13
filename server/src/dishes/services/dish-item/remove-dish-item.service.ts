import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Сервис для удаления ингредиента из блюда
 */
@Injectable()
export class RemoveDishItemService {
  constructor(private prisma: PrismaService) {}

  /**
   * Удаляет ингредиент из блюда
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @param itemId - ID ингредиента
   * @returns Удаленный ингредиент
   */
  async execute(userId: string, dishId: string, itemId: string) {
    // Проверяем существование и владельца
    const item = await this.prisma.dishItem.findUnique({
      where: { id: itemId },
      include: { dish: true },
    });

    if (!item) {
      throw new NotFoundException('Ингредиент не найден');
    }

    if (item.dishId !== dishId) {
      throw new BadRequestException('Ингредиент не принадлежит этому блюду');
    }

    if (item.dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Удаляем ингредиент
    return this.prisma.dishItem.delete({
      where: { id: itemId },
    });
  }
}
