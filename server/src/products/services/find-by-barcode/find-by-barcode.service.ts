import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FindByBarcodeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Найти продукт по штрих-коду
   */
  async execute(barcode: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
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
      throw new NotFoundException('Продукт с таким штрих-кодом не найден');
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
