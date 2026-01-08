import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AddToFavoritesService {
  constructor(private prisma: PrismaService) {}

  async execute(dishId: string, userId: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    // Проверка доступа к личному блюду
    if (!dish.isPublic && dish.userId !== userId) {
      throw new ForbiddenException('Доступ к этому блюду запрещен');
    }

    // Проверка, не добавлено ли уже
    const existing = await this.prisma.favoriteDish.findUnique({
      where: {
        userId_dishId: { userId, dishId },
      },
    });

    if (existing) {
      throw new BadRequestException('Блюдо уже в избранном');
    }

    await this.prisma.favoriteDish.create({
      data: { userId, dishId },
    });

    return { message: 'Блюдо добавлено в избранное' };
  }
}
