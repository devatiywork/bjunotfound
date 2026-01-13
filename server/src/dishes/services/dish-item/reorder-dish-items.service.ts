import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReorderDishItemsDto } from '../../dto/reorder-dish-items.dto';

/**
 * Сервис для изменения порядка ингредиентов в блюде
 */
@Injectable()
export class ReorderDishItemsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Изменяет порядок ингредиентов (batch update)
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @param dto - Массив с новым порядком
   * @returns Обновленные ингредиенты
   */
  async execute(userId: string, dishId: string, dto: ReorderDishItemsDto) {
    // Проверка 1: Блюдо существует и принадлежит пользователю
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        items: true,
      },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    if (dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Проверка 2: Все ингредиенты из dto принадлежат этому блюду
    const itemIds = dto.items.map((i) => i.id);
    const itemsInDb = dish.items.filter((i) => itemIds.includes(i.id));

    if (itemsInDb.length !== itemIds.length) {
      throw new BadRequestException(
        'Некоторые ингредиенты не принадлежат этому блюду',
      );
    }

    // Batch update через транзакцию
    const updates = dto.items.map((item) =>
      this.prisma.dishItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );

    await this.prisma.$transaction(updates);

    // Возвращаем обновленный список ингредиентов
    return this.prisma.dishItem.findMany({
      where: { dishId },
      orderBy: { sortOrder: 'asc' },
      include: {
        productUser: {
          include: {
            names: true,
          },
        },
        serving: true,
      },
    });
  }
}
