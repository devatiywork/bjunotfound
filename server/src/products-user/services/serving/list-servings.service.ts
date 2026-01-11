import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ListServingsService {
  constructor(private prisma: PrismaService) {}

  async execute(productId: string, userId: string, isAdmin: boolean) {
    // 1. Проверка существования продукта
    const product = await this.prisma.productUser.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID "${productId}" не найден`);
    }

    // 2. Проверка прав доступа
    if (product.userId !== userId && !isAdmin) {
      throw new ForbiddenException(
        'Нет прав для просмотра порций этого продукта',
      );
    }

    // 3. Получение списка порций
    const servings = await this.prisma.productUserServing.findMany({
      where: { productUserId: productId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return servings;
  }
}
