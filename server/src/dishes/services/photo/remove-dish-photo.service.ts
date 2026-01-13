import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Сервис для удаления фото из блюда
 */
@Injectable()
export class RemoveDishPhotoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Удаляет URL фото из массива фото блюда
   *
   * @param userId - ID пользователя
   * @param dishId - ID блюда
   * @param photoUrl - URL фото для удаления
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

    // Проверка наличия фото
    if (!dish.photos.includes(photoUrl)) {
      throw new NotFoundException('Фото не найдено в этом блюде');
    }

    // Удаляем фото из массива
    const updatedPhotos = dish.photos.filter((url) => url !== photoUrl);

    return this.prisma.dish.update({
      where: { id: dishId },
      data: {
        photos: updatedPhotos,
      },
    });
  }
}
