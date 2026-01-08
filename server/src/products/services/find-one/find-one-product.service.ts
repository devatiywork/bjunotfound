import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FindOneProductService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить продукт по ID
   */
  async execute(id: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
        userPrices: userId
          ? {
              where: { userId },
              select: { price: true },
            }
          : false,
      },
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Проверка доступа к личному продукту
    if (!product.isPublic && product.userId !== userId) {
      throw new ForbiddenException('Доступ к этому продукту запрещен');
    }

    // Добавляем price в ответ
    return {
      ...product,
      price:
        product.userPrices && product.userPrices.length > 0
          ? product.userPrices[0].price
          : null,
      userPrices: undefined,
    };
  }
}
