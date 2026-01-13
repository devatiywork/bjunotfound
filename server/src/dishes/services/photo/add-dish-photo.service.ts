import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Сервис для добавления фото к блюду
 */
@Injectable()
export class AddDishPhotoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Добавляет URL фото к существующему массиву фото блюда
   *
   * @param userId - ID пользователя
   * @param dishId - ID блюда
   * @param photoUrl - URL фото с Cloudinary
   * @returns Обновленное блюдо
   */
  async execute(userId: string, dishId: string, photoUrl: string) {
    // Находим блюдо
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверка владельца
    if (dish.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому блюду');
    }

    // Добавляем фото к массиву
    return this.prisma.dish.update({
      where: { id: dishId },
      data: {
        photos: {
          push: photoUrl,
        },
      },
    });
  }
}
