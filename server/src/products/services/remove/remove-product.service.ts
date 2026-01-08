import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RemoveProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * Удалить продукт
   */
  async execute(id: string, userId: string, isAdmin: boolean) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        dishIngredients: {
          include: {
            dish: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Проверка прав: админ или владелец
    if (!isAdmin && product.userId !== userId) {
      throw new ForbiddenException('Недостаточно прав для удаления');
    }

    // Проверка: продукт не должен использоваться в блюдах
    if (product.dishIngredients.length > 0) {
      const dishNames = product.dishIngredients
        .map((ingredient) => ingredient.dish.name)
        .join(', ');

      throw new BadRequestException(
        `Невозможно удалить продукт, так как он используется в следующих блюдах: ${dishNames}. ` +
          `Сначала удалите продукт из этих блюд или удалите сами блюда.`,
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Продукт успешно удален' };
  }
}
