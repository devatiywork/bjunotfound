import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../../../file-upload/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Сервис для архивирования или полного удаления блюда
 * - Если блюдо НЕ архивировано → архивирует (мягкое удаление)
 * - Если блюдо УЖЕ архивировано → удаляет навсегда (жесткое удаление)
 */
@Injectable()
export class ArchiveDishService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Архивирует блюдо или удаляет навсегда (зависит от текущего состояния)
   *
   * @param userId - ID пользователя (для проверки владельца)
   * @param dishId - ID блюда
   * @returns Архивированное блюдо или сообщение об удалении
   */
  async execute(userId: string, dishId: string) {
    // Проверяем существование и владельца
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

    // Если блюдо уже архивировано → удаляем навсегда
    if (dish.isArchived) {
      // Удаляем все фото из Cloudinary
      if (dish.photos && dish.photos.length > 0) {
        for (const photoUrl of dish.photos) {
          try {
            await this.cloudinaryService.deleteImage(photoUrl);
          } catch (error) {
            console.warn(
              `Не удалось удалить фото ${photoUrl} для блюда ${dishId}:`,
              error.message,
            );
          }
        }
      }

      // Удаляем блюдо (ингредиенты удалятся каскадно)
      await this.prisma.dish.delete({
        where: { id: dishId },
      });

      return {
        message: 'Блюдо успешно удалено навсегда',
        deletedDishId: dishId,
        deletedPhotos: dish.photos?.length || 0,
        deletedItems: dish.items?.length || 0,
      };
    }

    // Если блюдо НЕ архивировано → архивируем
    return this.prisma.dish.update({
      where: { id: dishId },
      data: { isArchived: true },
    });
  }
}
