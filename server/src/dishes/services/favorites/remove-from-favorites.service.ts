import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveFromFavoritesService {
  constructor(private prisma: PrismaService) {}

  async execute(dishId: string, userId: string) {
    const favorite = await this.prisma.favoriteDish.findUnique({
      where: {
        userId_dishId: { userId, dishId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Блюдо не найдено в избранном');
    }

    await this.prisma.favoriteDish.delete({
      where: {
        userId_dishId: { userId, dishId },
      },
    });

    return { message: 'Блюдо удалено из избранного' };
  }
}
